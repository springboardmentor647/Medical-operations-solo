import sqlite3
import numpy as np
from faker import Faker
import os

fake = Faker('en_IN')

def seed():
    # Force absolute path and ensure folder existence
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # 1. Clean start: Delete DB file to ensure no locking or stale schema
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # 2. Connect
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 3. Explicit DDL: Run each CREATE TABLE and commit
    try:
        cur.execute("CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT, department_code TEXT, floor INTEGER, capacity INTEGER)")
        cur.execute("CREATE TABLE room_types (room_type_id INTEGER PRIMARY KEY, room_type_name TEXT, base_tariff REAL, visitor_bed_available BOOLEAN)")
        cur.execute("CREATE TABLE rooms (room_id TEXT PRIMARY KEY, floor INTEGER, room_number INTEGER, department_id INTEGER, room_type_id INTEGER, status TEXT)")
        cur.execute("CREATE TABLE beds (bed_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, bed_number TEXT, status TEXT)")
        cur.execute("CREATE TABLE patients (patient_id TEXT PRIMARY KEY, patient_name TEXT, gender TEXT, age INTEGER, city TEXT, state TEXT)")
        conn.commit()
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        return

    # 4. Insert Master Data
    depts = ['Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'General Surgery']
    for i, d in enumerate(depts, 1):
        cur.execute("INSERT INTO departments VALUES (?, ?, ?, ?, ?)", (i, d, d[:3].upper(), i, 100))
        
    types = [('Basic', 1000.0, 0), ('Elite', 2500.0, 0), ('Premium', 5000.0, 1)]
    for i, t in enumerate(types, 1):
        cur.execute("INSERT INTO room_types VALUES (?, ?, ?, ?)", (i, t[0], t[1], t[2]))
        
    # 5. Populate Data
    for floor in range(1, 6):
        for idx in range(20):
            room_num = (floor * 100) + idx + 1
            room_id = f"R{room_num}"
            r_type = np.random.choice(['Basic', 'Elite', 'Premium'], p=[0.6, 0.25, 0.15])
            type_id = 1 if r_type == 'Basic' else (2 if r_type == 'Elite' else 3)
            cur.execute("INSERT INTO rooms VALUES (?, ?, ?, ?, ?, ?)", (room_id, floor, room_num, np.random.randint(1, 6), type_id, 'Available'))
            for b in ['A', 'B']:
                cur.execute("INSERT INTO beds (room_id, bed_number, status) VALUES (?,?,?)", (room_id, b, np.random.choice(['Available', 'Occupied'])))

    for i in range(1000):
        cur.execute("INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?)", (f"P{i:04d}", fake.name(), np.random.choice(['Male', 'Female']), np.random.randint(18, 85), fake.city(), fake.state()))
        
    conn.commit()
    conn.close()
    print("Database built and seeded successfully.")

if __name__ == "__main__":
    seed()