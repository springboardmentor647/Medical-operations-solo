from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DepartmentSchema(BaseModel):
    department_id: int
    department_name: str
    department_code: str
    floor: int
    capacity: int

    class Config:
        from_attributes = True

class RoomTypeSchema(BaseModel):
    room_type_id: int
    room_type_name: str
    base_tariff: float
    visitor_bed_available: bool

    class Config:
        from_attributes = True

class RoomSchema(BaseModel):
    room_id: str
    floor: int
    room_number: int
    department_id: str
    room_type_id: int
    status: str

    class Config:
        from_attributes = True

class BedSchema(BaseModel):
    bed_id: int
    room_id: str
    bed_number: str
    status: str

    class Config:
        from_attributes = True

class PatientSchema(BaseModel):
    patient_id: str
    patient_name: str
    gender: str
    age: int
    city: str
    state: str

    class Config:
        from_attributes = True

class AdmissionSchema(BaseModel):
    admission_id: int
    patient_id: str
    admission_date: datetime
    admission_type: str
    department_id: int
    status: str

    class Config:
        from_attributes = True

class OperationalEventSchema(BaseModel):
    event_id: int
    event_type: str
    entity_id: str
    timestamp: datetime
    description: str

    class Config:
        from_attributes = True