from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DB_DIR = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data"
DB_PATH = os.path.join(DB_DIR, "hospital_blueprint.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"
    department_id = Column(Integer, primary_key=True)
    department_name = Column(String)
    department_code = Column(String)
    floor = Column(Integer)
    capacity = Column(Integer)

class RoomType(Base):
    __tablename__ = "room_types"
    room_type_id = Column(Integer, primary_key=True)
    room_type_name = Column(String)
    base_tariff = Column(Float)
    visitor_bed_available = Column(Boolean)

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(String, primary_key=True)
    floor = Column(Integer)
    room_number = Column(Integer)
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    room_type_id = Column(Integer, ForeignKey("room_types.room_type_id"))
    status = Column(String)

class Bed(Base):
    __tablename__ = "beds"
    bed_id = Column(Integer, primary_key=True)
    room_id = Column(String, ForeignKey("rooms.room_id"))
    bed_number = Column(String)
    status = Column(String)

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True)
    patient_name = Column(String)
    gender = Column(String)
    age = Column(Integer)
    city = Column(String)
    state = Column(String)

class Admission(Base):
    __tablename__ = "admissions"
    admission_id = Column(Integer, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"))
    admission_date = Column(DateTime)
    admission_type = Column(String)
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    status = Column(String)

class OperationalEvent(Base):
    __tablename__ = "operational_events"
    event_id = Column(Integer, primary_key=True)
    event_type = Column(String)
    entity_id = Column(String)
    timestamp = Column(DateTime)
    description = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()