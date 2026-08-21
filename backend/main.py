from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from . import database
from typing import List
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/analytics/occupancy")
def get_occupancy(db: Session = Depends(get_db)):
    total = db.query(database.Bed).count()
    occupied = db.query(database.Bed).filter(database.Bed.status == "Occupied").count()
    return {"total_capacity": total, "occupied_beds": occupied, "occupancy_rate": (occupied / total * 100) if total > 0 else 0}

@app.get("/analytics/status-distribution")
def get_status_distribution(db: Session = Depends(get_db)):
    beds = db.query(database.Bed).all()
    df = pd.DataFrame([b.__dict__ for b in beds])
    if df.empty: return []
    dist = df['status'].value_counts().reset_index()
    dist.columns = ['name', 'value']
    return dist.to_dict(orient='records')

@app.get("/analytics/floor-summary")
def get_floor_summary(db: Session = Depends(get_db)):
    results = db.query(
        database.Room.floor,
        func.count(database.Bed.bed_id).label('total'),
        func.sum(case((database.Bed.status == 'Occupied', 1), else_=0)).label('occupied'),
        func.sum(case((database.Bed.status == 'Available', 1), else_=0)).label('available')
    ).join(database.Bed, database.Room.room_id == database.Bed.room_id)\
     .group_by(database.Room.floor).all()
    
    return [
        {"floor": r.floor, "total": r.total, "occupied": int(r.occupied or 0), "available": int(r.available or 0)} 
        for r in results
    ]

@app.get("/analytics/workforce")
def get_workforce(db: Session = Depends(get_db)):
    results = db.query(database.Department.department_name, func.count(database.Staff.staff_id))\
                .join(database.Staff, database.Department.department_id == database.Staff.department_id)\
                .group_by(database.Department.department_name).all()
    return [{"department": r[0], "count": r[1]} for r in results]

@app.get("/analytics/geo")
def get_geo(db: Session = Depends(get_db)):
    results = db.query(database.Patient.state, func.count(database.Patient.patient_id))\
                .group_by(database.Patient.state).all()
    return [{"state": r[0], "count": r[1]} for r in results]

@app.get("/rooms/{floor_id}")
def get_rooms_by_floor(floor_id: int, db: Session = Depends(get_db)):
    results = db.query(database.Bed, database.Room, database.RoomType)\
        .join(database.Room, database.Bed.room_id == database.Room.room_id)\
        .join(database.RoomType, database.Room.room_type_id == database.RoomType.room_type_id)\
        .filter(database.Room.floor == floor_id).all()
    return [
        {
            "room_id": r.room_id,
            "room_number": r.room_number,
            "bed_id": b.bed_id,
            "bed_number": b.bed_number,
            "status": b.status,
            "room_type": rt.room_type_name
        } for b, r, rt in results
    ]

@app.get("/events/")
def get_recent_events(db: Session = Depends(get_db)):
    return db.query(database.OperationalEvent).order_by(database.OperationalEvent.timestamp.desc()).limit(50).all()