from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import database, models
from .services.event_handler import EventLogger
from .services.analytics_engine import AnalyticsEngine

app = FastAPI(title="Medical Operations Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/overview", response_model=models.HospitalOverviewKPI)
def get_overview(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_hospital_overview(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/filters/metadata")
def get_filter_metadata(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_filter_metadata(db)

@app.get("/api/floors/summary", response_model=List[models.FloorSummaryKPI])
def get_floor_summaries(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_floor_summaries(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/floors/{floor_id}/blueprint", response_model=List[models.BedDetailOut])
def get_floor_blueprint(floor_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import text
    query = """
        SELECT 
            b.bed_id,
            b.bed_number,
            b.status AS bed_status,
            r.room_id,
            r.room_number,
            r.floor,
            rt.room_type_name,
            rt.base_tariff,
            rt.amenities,
            rt.visitor_bed_available,
            rt.guest_accommodation,
            rt.comfort_privacy,
            d.department_id,
            d.department_name,
            p.patient_id,
            p.patient_name,
            p.gender,
            p.age,
            diag.diagnosis_name,
            doc.doctor_name,
            a.admission_date,
            a.expected_discharge_date,
            a.admission_id
        FROM beds b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        JOIN departments d ON r.department_id = d.department_id
        LEFT JOIN bed_assignments ba ON b.bed_id = ba.bed_id AND ba.status = 'Active'
        LEFT JOIN admissions a ON ba.admission_id = a.admission_id AND a.status = 'Active'
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN diagnoses diag ON a.diagnosis_id = diag.diagnosis_id
        LEFT JOIN doctors doc ON a.doctor_id = doc.doctor_id
        WHERE r.floor = :floor_id
        ORDER BY rt.room_type_id ASC, r.room_number ASC, b.bed_number ASC
    """
    results = db.execute(text(query), {"floor_id": floor_id}).mappings().all()
    return [dict(row) for row in results]

@app.get("/api/departments/metrics", response_model=List[models.DepartmentMetricKPI])
def get_department_metrics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_department_metrics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/room-types/analytics", response_model=List[models.RoomTypeAnalyticsKPI])
def get_room_type_analytics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_room_type_analytics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/geographic/distribution")
def get_geographic_distribution(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_geographic_distribution(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/trends/patient-flow")
def get_patient_flow_trends(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_patient_flow_trends(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/flow-funnel")
def get_patient_flow_funnel(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_patient_flow_funnel(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/los")
def get_length_of_stay_analytics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_length_of_stay_analytics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/discharge-delays")
def get_discharge_delay_analytics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_discharge_delay_analytics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/bed-turnover")
def get_bed_turnover_analytics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_bed_turnover_analytics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/doctors")
def get_doctor_performance_workload(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_doctor_performance_workload(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/workforce-ratios")
def get_workforce_deployment_ratios(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_workforce_deployment_ratios(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/diagnostics")
def get_diagnostics_analytics(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_diagnosis_demographics(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/analytics/services")
def get_services_demand(
    department: Optional[str] = Query(None),
    floor: Optional[str] = Query(None),
    room_type: Optional[str] = Query(None),
    admission_type: Optional[str] = Query(None),
    diagnosis_category: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    doctor: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsEngine.get_treatment_service_demand(
        db,
        department=department,
        floor=floor,
        room_type=room_type,
        admission_type=admission_type,
        diagnosis_category=diagnosis_category,
        diagnosis=diagnosis,
        severity=severity,
        doctor=doctor,
        state=state,
        gender=gender,
        date_range=date_range
    )

@app.get("/api/risks/alerts")
def get_risk_alerts(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_operational_risks(db)

@app.get("/api/events", response_model=List[models.OperationalEventOut])
def get_events(
    event_type: Optional[str] = None,
    limit: int = Query(150, le=300),
    db: Session = Depends(get_db)
):
    query = db.query(database.OperationalEvent)
    if event_type and event_type != "ALL":
        query = query.filter(database.OperationalEvent.event_type == event_type)
    return query.order_by(database.OperationalEvent.timestamp.desc(), database.OperationalEvent.event_id.desc()).limit(limit).all()

@app.post("/api/operations/admit")
def admit_patient(admission_in: models.AdmissionCreate, db: Session = Depends(get_db)):
    bed = db.query(database.Bed).filter(database.Bed.bed_id == admission_in.bed_id).first()
    if not bed or bed.status != "Available":
        raise HTTPException(status_code=400, detail="Target bed is unavailable or does not exist.")
    
    patient = db.query(database.Patient).filter(database.Patient.patient_id == admission_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile does not exist.")
    
    admission_time = datetime.now()
    new_admission = database.Admission(
        patient_id=admission_in.patient_id,
        admission_date=admission_time,
        admission_type=admission_in.admission_type,
        department_id=admission_in.department_id,
        doctor_id=admission_in.doctor_id,
        diagnosis_id=admission_in.diagnosis_id,
        expected_discharge_date=admission_in.expected_discharge_date,
        status="Active"
    )
    db.add(new_admission)
    db.flush()

    new_assignment = database.BedAssignment(
        admission_id=new_admission.admission_id,
        patient_id=admission_in.patient_id,
        bed_id=admission_in.bed_id,
        start_datetime=admission_time,
        status="Active"
    )
    db.add(new_assignment)
    bed.status = "Occupied"

    EventLogger.record(
        db=db,
        event_type="ADMISSION",
        entity_name="Admission",
        entity_id=str(new_admission.admission_id),
        description=f"Patient {patient.patient_name} admitted to Department ID {admission_in.department_id}, assigned Bed ID {bed.bed_id}"
    )

    db.commit()
    return {"message": "Admission executed successfully", "admission_id": new_admission.admission_id}

@app.post("/api/operations/transfer")
def transfer_patient(transfer_in: models.PatientTransferRequest, db: Session = Depends(get_db)):
    active_assignment = db.query(database.BedAssignment).filter(
        database.BedAssignment.admission_id == transfer_in.admission_id,
        database.BedAssignment.status == "Active"
    ).first()
    
    if not active_assignment:
        raise HTTPException(status_code=404, detail="Active bed assignment not found for this admission.")

    target_bed = db.query(database.Bed).filter(database.Bed.bed_id == transfer_in.to_bed_id).first()
    if not target_bed or target_bed.status != "Available":
        raise HTTPException(status_code=400, detail="Target bed is unavailable or does not exist.")

    admission = db.query(database.Admission).filter(database.Admission.admission_id == transfer_in.admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission record not found.")

    now = datetime.now()
    old_bed = db.query(database.Bed).filter(database.Bed.bed_id == active_assignment.bed_id).first()
    old_bed.status = "Cleaning"
    active_assignment.end_datetime = now
    active_assignment.status = "Transferred"

    new_assignment = database.BedAssignment(
        admission_id=admission.admission_id,
        patient_id=admission.patient_id,
        bed_id=target_bed.bed_id,
        start_datetime=now,
        status="Active"
    )
    db.add(new_assignment)
    target_bed.status = "Occupied"

    from_dept = admission.department_id
    admission.department_id = transfer_in.to_department_id

    movement = database.PatientMovement(
        admission_id=admission.admission_id,
        patient_id=admission.patient_id,
        from_department_id=from_dept,
        to_department_id=transfer_in.to_department_id,
        from_bed_id=old_bed.bed_id,
        to_bed_id=target_bed.bed_id,
        movement_datetime=now,
        movement_reason=transfer_in.movement_reason
    )
    db.add(movement)

    EventLogger.record(
        db=db,
        event_type="PATIENT_TRANSFER",
        entity_name="PatientMovement",
        entity_id=str(admission.admission_id),
        description=f"Patient {admission.patient_id} transferred from Bed {old_bed.bed_id} to Bed {target_bed.bed_id}. Reason: {transfer_in.movement_reason}"
    )

    db.commit()
    return {"message": "Patient transfer registered successfully"}

@app.post("/api/operations/discharge")
def discharge_patient(discharge_in: models.DischargeCreate, db: Session = Depends(get_db)):
    admission = db.query(database.Admission).filter(
        database.Admission.admission_id == discharge_in.admission_id,
        database.Admission.status == "Active"
    ).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Active admission episode not found.")

    active_assignment = db.query(database.BedAssignment).filter(
        database.BedAssignment.admission_id == discharge_in.admission_id,
        database.BedAssignment.status == "Active"
    ).first()

    now = datetime.now()
    admission.actual_discharge_date = discharge_in.discharge_date or now
    admission.status = "Discharged"

    if active_assignment:
        active_assignment.end_datetime = admission.actual_discharge_date
        active_assignment.status = "Discharged"
        assigned_bed = db.query(database.Bed).filter(database.Bed.bed_id == active_assignment.bed_id).first()
        if assigned_bed:
            assigned_bed.status = "Cleaning"

    new_discharge = database.Discharge(
        admission_id=admission.admission_id,
        discharge_date=admission.actual_discharge_date,
        discharge_type=discharge_in.discharge_type,
        discharge_summary=discharge_in.discharge_summary
    )
    db.add(new_discharge)

    EventLogger.record(
        db=db,
        event_type="DISCHARGE",
        entity_name="Discharge",
        entity_id=str(admission.admission_id),
        description=f"Patient {admission.patient_id} officially discharged. Type: {discharge_in.discharge_type}"
    )

    db.commit()
    return {"message": "Patient discharge executed successfully"}

@app.post("/api/operations/beds/{bed_id}/status")
def change_bed_status(bed_id: int, status: str, db: Session = Depends(get_db)):
    valid_statuses = ["Available", "Occupied", "Cleaning", "Maintenance"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status value. Must be one of {valid_statuses}")

    bed = db.query(database.Bed).filter(database.Bed.bed_id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed ID not found.")

    prev_status = bed.status
    bed.status = status

    EventLogger.record(
        db=db,
        event_type="BED_STATUS_CHANGE",
        entity_name="Bed",
        entity_id=str(bed.bed_id),
        description=f"Bed {bed.bed_number} (Room {bed.room_id}) status transitioned from {prev_status} to {status}"
    )

    db.commit()
    return {"message": f"Bed status updated to {status}"}