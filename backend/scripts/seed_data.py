import os
import sqlite3
import pandas as pd

def seed():
    DB_DIR = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data"
    PROCESSED_DIR = os.path.join(DB_DIR, "processed")
    DB_PATH = os.path.join(DB_DIR, "hospital_blueprint.db")
    
    os.makedirs(DB_DIR, exist_ok=True)
    
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    from backend.database import init_db
    init_db()

    conn = sqlite3.connect(DB_PATH)

    operational_pipeline_tables = [
        'departments',
        'room_types',
        'diagnoses',
        'services',
        'doctors',
        'staff',
        'staff_assignments',
        'rooms',
        'beds',
        'patients',
        'admissions',
        'discharges',
        'bed_assignments',
        'patient_movements',
        'treatments',
        'operational_events'
    ]

    for table in operational_pipeline_tables:
        csv_file = os.path.join(PROCESSED_DIR, f"{table}.csv")
        if os.path.exists(csv_file):
            df = pd.read_csv(csv_file)
            df.to_sql(table, conn, if_exists='append', index=False)

    conn.close()

if __name__ == "__main__":
    seed()