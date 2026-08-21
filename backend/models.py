from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func  # <--- FIX: Import func directly
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
    total_beds = db.query(database.Bed).count()
    occupied_beds = db.query(database.Bed).filter(database.Bed.status == "Occupied").count()
    return {
        "total_capacity": total_beds,
        "occupied_beds": occupied_beds,
        "occupancy_rate": (occupied_beds / total_beds * 100) if total_beds > 0 else 0
    }

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
    results = db.query(database.Bed, database.Room).join(database.Room).all()
    df = pd.DataFrame([{'floor': r.floor, 'status': b.status} for b, r in results])
    if df.empty: return []
    summary = df.groupby('floor', group_keys=False).apply(lambda x: pd.Series({
        'floor': int(x['floor'].iloc[0]),
        'total': len(x),
        'occupied': len(x[x['status'] == 'Occupied']),
        'available': len(x[x['status'] == 'Available'])
    })).to_dict(orient='records')
    return summary

@app.get("/analytics/workforce")
def get_workforce(db: Session = Depends(get_db)):
    # Use the imported func directly
    results = db.query(database.Department.department_name, func.count(database.Staff.staff_id))\
                .join(database.Staff, database.Department.department_id == database.Staff.department_id)\
                .group_by(database.Department.department_name).all()
    return [{"department": r[0], "count": r[1]} for r in results]

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