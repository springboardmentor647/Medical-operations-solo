from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, List, Optional
from datetime import datetime

class AnalyticsEngine:
    @staticmethod
    def get_hospital_overview(db: Session) -> Dict[str, Any]:
        result = db.execute(text("SELECT * FROM v_hospital_overview")).mappings().first()
        if not result:
            return {
                "total_beds": 0,
                "occupied_beds": 0,
                "available_beds": 0,
                "cleaning_beds": 0,
                "maintenance_beds": 0,
                "active_patients": 0,
                "admissions_today": 0,
                "discharges_today": 0,
                "occupancy_rate": 0.0
            }
        return dict(result)

    @staticmethod
    def get_floor_summaries(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("SELECT * FROM v_floor_summary ORDER BY floor ASC")).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_department_metrics(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("SELECT * FROM v_department_metrics ORDER BY department_name ASC")).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_room_type_analytics(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("SELECT * FROM v_room_type_analytics ORDER BY base_tariff ASC")).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_geographic_distribution(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("""
            SELECT state, SUM(patient_count) as total_patients, SUM(total_admissions) as total_admissions 
            FROM v_geographic_distribution 
            GROUP BY state 
            ORDER BY total_patients DESC
        """)).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_patient_flow_trends(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("""
            WITH RECURSIVE dates(date_val) AS (
                SELECT DATE('now', '-29 days')
                UNION ALL
                SELECT DATE(date_val, '+1 day')
                FROM dates
                WHERE date_val < DATE('now')
            )
            SELECT 
                d.date_val AS date,
                COALESCE(COUNT(DISTINCT a.admission_id), 0) AS admissions,
                COALESCE(COUNT(DISTINCT dis.discharge_id), 0) AS discharges,
                (COALESCE(COUNT(DISTINCT a.admission_id), 0) - COALESCE(COUNT(DISTINCT dis.discharge_id), 0)) AS net_patient_change
            FROM dates d
            LEFT JOIN admissions a ON DATE(a.admission_date) = d.date_val
            LEFT JOIN discharges dis ON DATE(dis.discharge_date) = d.date_val
            GROUP BY d.date_val
            ORDER BY d.date_val ASC;
        """)).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_patient_flow_funnel(db: Session, department_id: Optional[int] = None) -> Dict[str, Any]:
        dept_clause = "WHERE a.department_id = :dept_id" if department_id else ""
        params = {"dept_id": department_id} if department_id else {}
        
        sql = f"""
            SELECT 
                (SELECT COUNT(*) FROM patients) as total_registered,
                COUNT(DISTINCT a.admission_id) as total_admissions,
                COUNT(DISTINCT ba.assignment_id) as total_bed_assignments,
                COUNT(DISTINCT t.treatment_id) as total_treatments,
                COUNT(DISTINCT dis.discharge_id) as total_discharges
            FROM admissions a
            LEFT JOIN bed_assignments ba ON a.admission_id = ba.admission_id
            LEFT JOIN treatments t ON a.admission_id = t.admission_id
            LEFT JOIN discharges dis ON a.admission_id = dis.admission_id
            {dept_clause};
        """
        row = db.execute(text(sql), params).mappings().first()
        return dict(row) if row else {
            "total_registered": 0,
            "total_admissions": 0,
            "total_bed_assignments": 0,
            "total_treatments": 0,
            "total_discharges": 0
        }

    @staticmethod
    def get_length_of_stay_analytics(db: Session) -> Dict[str, Any]:
        dept_los_sql = """
            SELECT 
                d.department_name,
                d.department_code,
                ROUND(AVG(JULIANDAY(COALESCE(a.actual_discharge_date, DATETIME('now'))) - JULIANDAY(a.admission_date)), 1) as avg_los_days,
                COUNT(a.admission_id) as patient_count
            FROM departments d
            JOIN admissions a ON d.department_id = a.department_id
            GROUP BY d.department_id, d.department_name, d.department_code
            ORDER BY avg_los_days DESC;
        """
        dept_los = db.execute(text(dept_los_sql)).mappings().all()
        
        overall_los_sql = """
            SELECT 
                ROUND(AVG(JULIANDAY(COALESCE(actual_discharge_date, DATETIME('now'))) - JULIANDAY(admission_date)), 1) as avg_los,
                ROUND(MAX(JULIANDAY(COALESCE(actual_discharge_date, DATETIME('now'))) - JULIANDAY(admission_date)), 1) as max_los,
                COUNT(CASE WHEN status = 'Active' AND expected_discharge_date < DATETIME('now') THEN 1 END) as overdue_count
            FROM admissions;
        """
        overall = db.execute(text(overall_los_sql)).mappings().first()
        
        return {
            "overall_avg_los": overall["avg_los"] if overall else 0.0,
            "longest_stay_days": overall["max_los"] if overall else 0.0,
            "overdue_discharge_patients": overall["overdue_count"] if overall else 0,
            "department_los_breakdown": [dict(r) for r in dept_los]
        }

    @staticmethod
    def get_discharge_delay_analytics(db: Session) -> List[Dict[str, Any]]:
        sql = """
            SELECT 
                d.department_name,
                COUNT(a.admission_id) as total_admissions,
                SUM(CASE WHEN a.actual_discharge_date > a.expected_discharge_date THEN 1 ELSE 0 END) as delayed_discharges,
                ROUND((CAST(SUM(CASE WHEN a.actual_discharge_date > a.expected_discharge_date THEN 1 ELSE 0 END) AS FLOAT) / 
                       NULLIF(COUNT(a.admission_id), 0)) * 100, 2) as delay_rate_percentage,
                ROUND(AVG(CASE WHEN a.actual_discharge_date > a.expected_discharge_date 
                               THEN JULIANDAY(a.actual_discharge_date) - JULIANDAY(a.expected_discharge_date) 
                               ELSE 0 END), 1) as avg_delay_days
            FROM departments d
            JOIN admissions a ON d.department_id = a.department_id
            WHERE a.actual_discharge_date IS NOT NULL
            GROUP BY d.department_id, d.department_name
            ORDER BY delay_rate_percentage DESC;
        """
        results = db.execute(text(sql)).mappings().all()
        return [dict(r) for r in results]

    @staticmethod
    def get_bed_turnover_analytics(db: Session) -> List[Dict[str, Any]]:
        sql = """
            SELECT 
                d.department_name,
                d.department_code,
                COUNT(DISTINCT b.bed_id) as total_beds,
                COUNT(ba.assignment_id) as turnover_count,
                ROUND(CAST(COUNT(ba.assignment_id) AS FLOAT) / NULLIF(COUNT(DISTINCT b.bed_id), 0), 2) as turnover_rate_per_bed
            FROM departments d
            JOIN rooms r ON d.department_id = r.department_id
            JOIN beds b ON r.room_id = b.room_id
            LEFT JOIN bed_assignments ba ON b.bed_id = ba.bed_id
            GROUP BY d.department_id, d.department_name, d.department_code
            ORDER BY turnover_rate_per_bed DESC;
        """
        results = db.execute(text(sql)).mappings().all()
        return [dict(r) for r in results]

    @staticmethod
    def get_doctor_performance_workload(db: Session, department_id: Optional[int] = None) -> List[Dict[str, Any]]:
        dept_clause = "WHERE doc.department_id = :dept_id" if department_id else ""
        params = {"dept_id": department_id} if department_id else {}
        
        sql = f"""
            SELECT 
                doc.doctor_id,
                doc.doctor_name,
                d.department_name,
                doc.specialization,
                COUNT(DISTINCT a.admission_id) as total_admissions,
                COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.admission_id END) as active_patients,
                COUNT(DISTINCT t.treatment_id) as procedures_performed,
                ROUND(AVG(JULIANDAY(COALESCE(a.actual_discharge_date, DATETIME('now'))) - JULIANDAY(a.admission_date)), 1) as avg_patient_stay_days
            FROM doctors doc
            JOIN departments d ON doc.department_id = d.department_id
            LEFT JOIN admissions a ON doc.doctor_id = a.doctor_id
            LEFT JOIN treatments t ON doc.doctor_id = t.doctor_id
            {dept_clause}
            GROUP BY doc.doctor_id, doc.doctor_name, d.department_name, doc.specialization
            ORDER BY active_patients DESC, procedures_performed DESC;
        """
        results = db.execute(text(sql), params).mappings().all()
        return [dict(r) for r in results]

    @staticmethod
    def get_workforce_deployment_ratios(db: Session) -> List[Dict[str, Any]]:
        sql = """
            SELECT 
                d.department_name,
                d.department_code,
                (SELECT COUNT(*) FROM admissions a WHERE a.department_id = d.department_id AND a.status = 'Active') as active_patients,
                (SELECT COUNT(*) FROM staff s WHERE s.department_id = d.department_id) as total_staff,
                (SELECT COUNT(*) FROM staff s WHERE s.department_id = d.department_id AND s.role LIKE '%Nurse%') as nursing_staff,
                (SELECT COUNT(*) FROM doctors doc WHERE doc.department_id = d.department_id) as active_doctors,
                ROUND(CAST((SELECT COUNT(*) FROM admissions a WHERE a.department_id = d.department_id AND a.status = 'Active') AS FLOAT) / 
                      NULLIF((SELECT COUNT(*) FROM staff s WHERE s.department_id = d.department_id), 0), 2) as patient_to_staff_ratio,
                ROUND(CAST((SELECT COUNT(*) FROM admissions a WHERE a.department_id = d.department_id AND a.status = 'Active') AS FLOAT) / 
                      NULLIF((SELECT COUNT(*) FROM doctors doc WHERE doc.department_id = d.department_id), 0), 2) as patient_to_doctor_ratio
            FROM departments d
            ORDER BY patient_to_staff_ratio DESC;
        """
        results = db.execute(text(sql)).mappings().all()
        return [dict(r) for r in results]

    @staticmethod
    def get_diagnosis_demographics(db: Session, category: Optional[str] = None) -> List[Dict[str, Any]]:
        cat_clause = "WHERE diag.category = :category" if category and category != "ALL" else ""
        params = {"category": category} if category and category != "ALL" else {}
        
        sql = f"""
            SELECT 
                diag.diagnosis_name,
                diag.category,
                COUNT(a.admission_id) as total_cases,
                ROUND(AVG(p.age), 1) as average_age,
                SUM(CASE WHEN p.gender = 'Male' THEN 1 ELSE 0 END) as male_count,
                SUM(CASE WHEN p.gender = 'Female' THEN 1 ELSE 0 END) as female_count
            FROM diagnoses diag
            JOIN admissions a ON diag.diagnosis_id = a.diagnosis_id
            JOIN patients p ON a.patient_id = p.patient_id
            {cat_clause}
            GROUP BY diag.diagnosis_id, diag.diagnosis_name, diag.category
            ORDER BY total_cases DESC
            LIMIT 10;
        """
        results = db.execute(text(sql), params).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_treatment_service_demand(db: Session, department_name: Optional[str] = None) -> List[Dict[str, Any]]:
        dept_clause = "WHERE d.department_name = :dept_name" if department_name and department_name != "ALL" else ""
        params = {"dept_name": department_name} if department_name and department_name != "ALL" else {}
        
        sql = f"""
            SELECT 
                s.service_name,
                d.department_name,
                COUNT(t.treatment_id) as demand_count,
                SUM(s.base_cost) as total_revenue
            FROM services s
            JOIN departments d ON s.department_id = d.department_id
            LEFT JOIN treatments t ON s.service_id = t.service_id
            {dept_clause}
            GROUP BY s.service_id, s.service_name, d.department_name
            ORDER BY demand_count DESC;
        """
        results = db.execute(text(sql), params).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_filter_metadata(db: Session) -> Dict[str, Any]:
        departments = db.execute(text("SELECT department_id, department_name, department_code FROM departments ORDER BY department_name")).mappings().all()
        doctors = db.execute(text("SELECT doctor_id, doctor_name, department_id, specialization FROM doctors ORDER BY doctor_name")).mappings().all()
        room_types = db.execute(text("SELECT room_type_id, room_type_name FROM room_types ORDER BY base_tariff")).mappings().all()
        diagnoses = db.execute(text("SELECT diagnosis_id, diagnosis_name, category, severity FROM diagnoses ORDER BY diagnosis_name")).mappings().all()
        states = db.execute(text("SELECT DISTINCT state FROM patients ORDER BY state")).mappings().all()
        
        return {
            "departments": [dict(r) for r in departments],
            "doctors": [dict(r) for r in doctors],
            "room_types": [dict(r) for r in room_types],
            "diagnoses": [dict(r) for r in diagnoses],
            "states": [r["state"] for r in states],
            "floors": [1, 2, 3, 4, 5],
            "admission_types": ["Urgent", "Emergency", "Elective"],
            "severities": ["Mild", "Moderate", "Severe", "Critical"],
            "shifts": ["Morning", "Evening", "Night"]
        }

    @staticmethod
    def get_operational_risks(db: Session) -> List[Dict[str, Any]]:
        risks = []
        dept_pressures = db.execute(text("""
            SELECT department_name, bed_occupancy_rate 
            FROM v_department_metrics 
            WHERE bed_occupancy_rate >= 80.0;
        """)).mappings().all()
        for dept in dept_pressures:
            risks.append({
                "severity": "CRITICAL" if dept["bed_occupancy_rate"] >= 90.0 else "WARNING",
                "category": "CAPACITY PRESSURE",
                "entity": dept["department_name"],
                "message": f"Department operating at {dept['bed_occupancy_rate']}% bed capacity threshold."
            })
        
        overdue_patients = db.execute(text("""
            SELECT p.patient_name, a.expected_discharge_date, d.department_name 
            FROM admissions a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN departments d ON a.department_id = d.department_id
            WHERE a.status = 'Active' AND a.expected_discharge_date < DATETIME('now')
            LIMIT 10;
        """)).mappings().all()
        for pat in overdue_patients:
            risks.append({
                "severity": "WARNING",
                "category": "DISCHARGE DELAY",
                "entity": pat["patient_name"],
                "message": f"Patient in {pat['department_name']} exceeded expected discharge date."
            })
            
        uncleaned = db.execute(text("""
            SELECT COUNT(*) as count FROM beds WHERE status = 'Cleaning';
        """)).mappings().first()
        if uncleaned and uncleaned["count"] > 5:
            risks.append({
                "severity": "INFO",
                "category": "TURNOVER BOTTLENECK",
                "entity": "Hospital Facility",
                "message": f"{uncleaned['count']} beds awaiting housekeeping turnover."
            })
            
        return risks