from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DepartmentBase(BaseModel):
    department_name: str
    department_code: str
    floor: int
    capacity: int

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    department_id: int
    class Config:
        from_attributes = True

class DoctorBase(BaseModel):
    doctor_name: str
    department_id: int
    specialization: str
    designation: str

class DoctorCreate(DoctorBase):
    pass

class DoctorOut(DoctorBase):
    doctor_id: int
    class Config:
        from_attributes = True

class StaffBase(BaseModel):
    staff_name: str
    role: str
    department_id: int

class StaffCreate(StaffBase):
    pass

class StaffOut(StaffBase):
    staff_id: int
    class Config:
        from_attributes = True

class StaffAssignmentBase(BaseModel):
    staff_id: int
    department_id: int
    shift: str
    assigned_date: datetime

class StaffAssignmentCreate(StaffAssignmentBase):
    pass

class StaffAssignmentOut(StaffAssignmentBase):
    assignment_id: int
    class Config:
        from_attributes = True

class DiagnosisBase(BaseModel):
    diagnosis_name: str
    category: str
    severity: str

class DiagnosisCreate(DiagnosisBase):
    pass

class DiagnosisOut(DiagnosisBase):
    diagnosis_id: int
    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    service_name: str
    department_id: int
    base_cost: float

class ServiceCreate(ServiceBase):
    pass

class ServiceOut(ServiceBase):
    service_id: int
    class Config:
        from_attributes = True

class RoomTypeBase(BaseModel):
    room_type_name: str
    room_size: str
    meals: str
    amenities: str
    guest_accommodation: bool
    visitor_bed_available: bool
    comfort_privacy: str
    base_tariff: float

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomTypeOut(RoomTypeBase):
    room_type_id: int
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    room_id: str
    floor: int
    room_number: int
    department_id: int
    room_type_id: int
    status: str

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    class Config:
        from_attributes = True

class BedBase(BaseModel):
    room_id: str
    bed_number: str
    status: str

class BedCreate(BedBase):
    pass

class BedOut(BedBase):
    bed_id: int
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    patient_id: str
    patient_name: str
    gender: str
    age: int
    city: str
    district: str
    state: str
    postal_code: str

class PatientCreate(PatientBase):
    pass

class PatientOut(PatientBase):
    class Config:
        from_attributes = True

class AdmissionBase(BaseModel):
    patient_id: str
    admission_date: datetime
    admission_type: str
    department_id: int
    doctor_id: int
    diagnosis_id: int
    expected_discharge_date: datetime
    actual_discharge_date: Optional[datetime] = None
    status: str

class AdmissionCreate(BaseModel):
    patient_id: str
    admission_type: str
    department_id: int
    doctor_id: int
    diagnosis_id: int
    expected_discharge_date: datetime
    bed_id: int

class AdmissionOut(AdmissionBase):
    admission_id: int
    class Config:
        from_attributes = True

class DischargeCreate(BaseModel):
    admission_id: int
    discharge_date: datetime = Field(default_factory=datetime.now)
    discharge_type: str
    discharge_summary: Optional[str] = None

class DischargeOut(BaseModel):
    discharge_id: int
    admission_id: int
    discharge_date: datetime
    discharge_type: str
    discharge_summary: Optional[str]
    class Config:
        from_attributes = True

class PatientTransferRequest(BaseModel):
    admission_id: int
    to_department_id: int
    to_bed_id: int
    movement_reason: str

class BedAssignmentOut(BaseModel):
    assignment_id: int
    admission_id: int
    patient_id: str
    bed_id: int
    start_datetime: datetime
    end_datetime: Optional[datetime]
    status: str
    class Config:
        from_attributes = True

class PatientMovementOut(BaseModel):
    movement_id: int
    admission_id: int
    patient_id: str
    from_department_id: int
    to_department_id: int
    from_bed_id: int
    to_bed_id: int
    movement_datetime: datetime
    movement_reason: str
    class Config:
        from_attributes = True

class TreatmentCreate(BaseModel):
    admission_id: int
    patient_id: str
    service_id: int
    doctor_id: int
    treatment_datetime: datetime = Field(default_factory=datetime.now)
    status: str = "Completed"

class TreatmentOut(BaseModel):
    treatment_id: int
    admission_id: int
    patient_id: str
    service_id: int
    doctor_id: int
    treatment_datetime: datetime
    status: str
    class Config:
        from_attributes = True

class OperationalEventOut(BaseModel):
    event_id: int
    event_type: str
    entity_name: str
    entity_id: str
    timestamp: datetime
    description: str
    class Config:
        from_attributes = True

class BedDetailOut(BaseModel):
    bed_id: int
    bed_number: str
    bed_status: str
    room_id: str
    room_number: int
    floor: int
    room_type_name: str
    base_tariff: float
    amenities: str
    visitor_bed_available: bool
    guest_accommodation: bool
    comfort_privacy: str
    department_id: int
    department_name: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    diagnosis_name: Optional[str] = None
    doctor_name: Optional[str] = None
    admission_date: Optional[datetime] = None
    expected_discharge_date: Optional[datetime] = None
    admission_id: Optional[int] = None

class HospitalOverviewKPI(BaseModel):
    total_beds: int
    occupied_beds: int
    available_beds: int
    cleaning_beds: int
    maintenance_beds: int
    active_patients: int
    admissions_today: int
    discharges_today: int
    occupancy_rate: float

class FloorSummaryKPI(BaseModel):
    floor: int
    total_beds: int
    occupied_beds: int
    available_beds: int
    cleaning_beds: int
    maintenance_beds: int
    occupancy_rate: float

class DepartmentMetricKPI(BaseModel):
    department_id: int
    department_name: str
    department_code: str
    nominal_capacity: int
    total_rooms: int
    total_beds: int
    occupied_beds: int
    available_beds: int
    doctor_count: int
    staff_count: int
    active_patient_load: int
    bed_occupancy_rate: float

class RoomTypeAnalyticsKPI(BaseModel):
    room_type_id: int
    room_type_name: str
    room_size: str
    base_tariff: float
    total_rooms: int
    total_beds: int
    occupied_beds: int
    available_beds: int
    utilization_rate: float

class GeoDistributionKPI(BaseModel):
    state: str
    district: str
    patient_count: int
    total_admissions: int
    active_admissions: int