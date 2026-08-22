from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, List

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
                COALESCE(COUNT(DISTINCT dis.discharge_id), 0) AS discharges
            FROM dates d
            LEFT JOIN admissions a ON DATE(a.admission_date) = d.date_val
            LEFT JOIN discharges dis ON DATE(dis.discharge_date) = d.date_val
            GROUP BY d.date_val
            ORDER BY d.date_val ASC;
        """)).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_diagnosis_demographics(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("""
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
            GROUP BY diag.diagnosis_id, diag.diagnosis_name, diag.category
            ORDER BY total_cases DESC
            LIMIT 10;
        """)).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_treatment_service_demand(db: Session) -> List[Dict[str, Any]]:
        results = db.execute(text("""
            SELECT 
                s.service_name,
                d.department_name,
                COUNT(t.treatment_id) as demand_count,
                SUM(s.base_cost) as total_revenue
            FROM services s
            JOIN departments d ON s.department_id = d.department_id
            LEFT JOIN treatments t ON s.service_id = t.service_id
            GROUP BY s.service_id, s.service_name, d.department_name
            ORDER BY demand_count DESC;
        """)).mappings().all()
        return [dict(row) for row in results]

    @staticmethod
    def get_operational_risks(db: Session) -> List[Dict[str, Any]]:
        risks = []
        dept_pressures = db.execute(text("""
            SELECT department_name, bed_occupancy_rate 
            FROM v_department_metrics 
            WHERE bed_occupancy_rate >= 85.0;
        """)).mappings().all()
        for dept in dept_pressures:
            risks.append({
                "severity": "CRITICAL" if dept["bed_occupancy_rate"] >= 95.0 else "WARNING",
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
                "message": f"Patient in {pat['department_name']} exceeded expected discharge date ({pat['expected_discharge_date']})."
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