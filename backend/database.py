import os
import sqlite3
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, 
    ForeignKey, Boolean, event, text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "hospital_blueprint.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"
    department_id = Column(Integer, primary_key=True, autoincrement=True)
    department_name = Column(String, unique=True, nullable=False)
    department_code = Column(String, unique=True, nullable=False)
    floor = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    specialization = Column(String, nullable=False)
    designation = Column(String, nullable=False)

class Staff(Base):
    __tablename__ = "staff"
    staff_id = Column(Integer, primary_key=True, autoincrement=True)
    staff_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)

class StaffAssignment(Base):
    __tablename__ = "staff_assignments"
    assignment_id = Column(Integer, primary_key=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey("staff.staff_id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    shift = Column(String, nullable=False)
    assigned_date = Column(DateTime, nullable=False)

class Diagnosis(Base):
    __tablename__ = "diagnoses"
    diagnosis_id = Column(Integer, primary_key=True, autoincrement=True)
    diagnosis_name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False)

class Service(Base):
    __tablename__ = "services"
    service_id = Column(Integer, primary_key=True, autoincrement=True)
    service_name = Column(String, unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    base_cost = Column(Float, nullable=False)

class RoomType(Base):
    __tablename__ = "room_types"
    room_type_id = Column(Integer, primary_key=True, autoincrement=True)
    room_type_name = Column(String, unique=True, nullable=False)
    room_size = Column(String, nullable=False)
    meals = Column(String, nullable=False)
    amenities = Column(String, nullable=False)
    guest_accommodation = Column(Boolean, default=False, nullable=False)
    visitor_bed_available = Column(Boolean, default=False, nullable=False)
    comfort_privacy = Column(String, nullable=False)
    base_tariff = Column(Float, nullable=False)

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(String, primary_key=True)
    floor = Column(Integer, nullable=False)
    room_number = Column(Integer, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.room_type_id", ondelete="RESTRICT"), nullable=False)
    status = Column(String, nullable=False, default="Available")

class Bed(Base):
    __tablename__ = "beds"
    bed_id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String, ForeignKey("rooms.room_id", ondelete="CASCADE"), nullable=False)
    bed_number = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Available")

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True)
    patient_name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    city = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)

class Admission(Base):
    __tablename__ = "admissions"
    admission_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    admission_date = Column(DateTime, nullable=False)
    admission_type = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="RESTRICT"), nullable=False)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.diagnosis_id", ondelete="RESTRICT"), nullable=False)
    expected_discharge_date = Column(DateTime, nullable=False)
    actual_discharge_date = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="Active")

class Discharge(Base):
    __tablename__ = "discharges"
    discharge_id = Column(Integer, primary_key=True, autoincrement=True)
    admission_id = Column(Integer, ForeignKey("admissions.admission_id", ondelete="RESTRICT"), unique=True, nullable=False)
    discharge_date = Column(DateTime, nullable=False)
    discharge_type = Column(String, nullable=False)
    discharge_summary = Column(String, nullable=True)

class BedAssignment(Base):
    __tablename__ = "bed_assignments"
    assignment_id = Column(Integer, primary_key=True, autoincrement=True)
    admission_id = Column(Integer, ForeignKey("admissions.admission_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="RESTRICT"), nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="Active")

class PatientMovement(Base):
    __tablename__ = "patient_movements"
    movement_id = Column(Integer, primary_key=True, autoincrement=True)
    admission_id = Column(Integer, ForeignKey("admissions.admission_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    from_department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    to_department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    from_bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="RESTRICT"), nullable=False)
    to_bed_id = Column(Integer, ForeignKey("beds.bed_id", ondelete="RESTRICT"), nullable=False)
    movement_datetime = Column(DateTime, nullable=False)
    movement_reason = Column(String, nullable=False)

class Treatment(Base):
    __tablename__ = "treatments"
    treatment_id = Column(Integer, primary_key=True, autoincrement=True)
    admission_id = Column(Integer, ForeignKey("admissions.admission_id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="RESTRICT"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="RESTRICT"), nullable=False)
    treatment_datetime = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="Completed")

class OperationalEvent(Base):
    __tablename__ = "operational_events"
    event_id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)
    entity_name = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)

def create_views():
    views = [
        """
        DROP VIEW IF EXISTS v_hospital_overview;
        """,
        """
        CREATE VIEW v_hospital_overview AS
        SELECT 
            (SELECT COUNT(*) FROM beds) AS total_beds,
            (SELECT COUNT(*) FROM beds WHERE status = 'Occupied') AS occupied_beds,
            (SELECT COUNT(*) FROM beds WHERE status = 'Available') AS available_beds,
            (SELECT COUNT(*) FROM beds WHERE status = 'Cleaning') AS cleaning_beds,
            (SELECT COUNT(*) FROM beds WHERE status = 'Maintenance') AS maintenance_beds,
            (SELECT COUNT(*) FROM admissions WHERE status = 'Active') AS active_patients,
            (SELECT COUNT(*) FROM admissions WHERE DATE(admission_date) = DATE('now')) AS admissions_today,
            (SELECT COUNT(*) FROM discharges WHERE DATE(discharge_date) = DATE('now')) AS discharges_today,
            ROUND((CAST((SELECT COUNT(*) FROM beds WHERE status = 'Occupied') AS FLOAT) / 
                   NULLIF((SELECT COUNT(*) FROM beds), 0)) * 100, 2) AS occupancy_rate;
        """,
        """
        DROP VIEW IF EXISTS v_floor_summary;
        """,
        """
        CREATE VIEW v_floor_summary AS
        SELECT 
            r.floor AS floor,
            COUNT(b.bed_id) AS total_beds,
            SUM(CASE WHEN b.status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_beds,
            SUM(CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END) AS available_beds,
            SUM(CASE WHEN b.status = 'Cleaning' THEN 1 ELSE 0 END) AS cleaning_beds,
            SUM(CASE WHEN b.status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance_beds,
            ROUND((CAST(SUM(CASE WHEN b.status = 'Occupied' THEN 1 ELSE 0 END) AS FLOAT) / 
                   NULLIF(COUNT(b.bed_id), 0)) * 100, 2) AS occupancy_rate
        FROM rooms r
        JOIN beds b ON r.room_id = b.room_id
        GROUP BY r.floor;
        """,
        """
        DROP VIEW IF EXISTS v_department_metrics;
        """,
        """
        CREATE VIEW v_department_metrics AS
        SELECT 
            d.department_id,
            d.department_name,
            d.department_code,
            d.capacity AS nominal_capacity,
            (SELECT COUNT(*) FROM rooms r WHERE r.department_id = d.department_id) AS total_rooms,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.department_id = d.department_id) AS total_beds,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.department_id = d.department_id AND b.status = 'Occupied') AS occupied_beds,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.department_id = d.department_id AND b.status = 'Available') AS available_beds,
            (SELECT COUNT(*) FROM doctors doc WHERE doc.department_id = d.department_id) AS doctor_count,
            (SELECT COUNT(*) FROM staff st WHERE st.department_id = d.department_id) AS staff_count,
            (SELECT COUNT(*) FROM admissions a WHERE a.department_id = d.department_id AND a.status = 'Active') AS active_patient_load,
            ROUND((CAST((SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.department_id = d.department_id AND b.status = 'Occupied') AS FLOAT) / 
                   NULLIF((SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.department_id = d.department_id), 0)) * 100, 2) AS bed_occupancy_rate
        FROM departments d;
        """,
        """
        DROP VIEW IF EXISTS v_room_type_analytics;
        """,
        """
        CREATE VIEW v_room_type_analytics AS
        SELECT 
            rt.room_type_id,
            rt.room_type_name,
            rt.room_size,
            rt.base_tariff,
            (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.room_type_id) AS total_rooms,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.room_type_id = rt.room_type_id) AS total_beds,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.room_type_id = rt.room_type_id AND b.status = 'Occupied') AS occupied_beds,
            (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.room_type_id = rt.room_type_id AND b.status = 'Available') AS available_beds,
            ROUND((CAST((SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.room_type_id = rt.room_type_id AND b.status = 'Occupied') AS FLOAT) / 
                   NULLIF((SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE r.room_type_id = rt.room_type_id), 0)) * 100, 2) AS utilization_rate
        FROM room_types rt;
        """,
        """
        DROP VIEW IF EXISTS v_geographic_distribution;
        """,
        """
        CREATE VIEW v_geographic_distribution AS
        SELECT 
            p.state,
            p.district,
            COUNT(DISTINCT p.patient_id) AS patient_count,
            COUNT(DISTINCT a.admission_id) AS total_admissions,
            COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.admission_id END) AS active_admissions
        FROM patients p
        LEFT JOIN admissions a ON p.patient_id = a.patient_id
        GROUP BY p.state, p.district;
        """
    ]
    with engine.connect() as connection:
        for view_sql in views:
            connection.execute(text(view_sql))
        connection.commit()

def init_db():
    Base.metadata.create_all(bind=engine)
    create_views()

if __name__ == "__main__":
    init_db()