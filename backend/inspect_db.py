import sqlite3
import pandas as pd
import os

def inspect():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    
    tables = [
        'departments', 'room_types', 'rooms', 'beds', 'patients', 
        'admissions', 'discharges', 'bed_assignments', 'patient_movements', 
        'treatments', 'staff', 'staff_assignments', 'operational_events'
    ]
    
    for table in tables:
        print(f"\n{'='*20} TABLE: {table.upper()} {'='*20}")
        try:
            count = pd.read_sql(f"SELECT COUNT(*) as count FROM {table}", conn).iloc[0]['count']
            print(f"Total Rows: {count}")
            cols = pd.read_sql(f"PRAGMA table_info({table})", conn)
            print("COLUMNS:")
            print(cols[['name', 'type']])
            df = pd.read_sql(f"SELECT * FROM {table} LIMIT 3", conn)
            print("\nPREVIEW (First 3 rows):")
            print(df)
        except Exception as e:
            print(f"Could not read table {table}: {e}")
            
    print(f"\n{'='*20} ROOM TIER DISTRIBUTION BY FLOOR {'='*20}")
    dist_df = pd.read_sql("""
        SELECT r.floor, rt.room_type_name, COUNT(r.room_id) as room_count
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        GROUP BY r.floor, rt.room_type_name
        ORDER BY r.floor ASC, rt.room_type_id ASC;
    """, conn)
    print(dist_df)
    
    conn.close()

if __name__ == "__main__":
    inspect()