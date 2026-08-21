import sqlite3
import numpy as np
from faker import Faker
import os

fake = Faker('en_IN')

def seed():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    if os.path.exists(db_path): os.remove(db_path)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.executescript('''
        CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT, department_code TEXT, floor INTEGER, capacity INTEGER);
        CREATE TABLE room_types (room_type_id INTEGER PRIMARY KEY, room_type_name TEXT, base_tariff REAL, visitor_bed_available BOOLEAN);
        CREATE TABLE rooms (room_id TEXT PRIMARY KEY, floor INTEGER, room_number INTEGER, department_id INTEGER, room_type_id INTEGER, status TEXT);
        CREATE TABLE beds (bed_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, bed_number TEXT, status TEXT);
        CREATE TABLE patients (patient_id TEXT PRIMARY KEY, patient_name TEXT, gender TEXT, age INTEGER, city TEXT, state TEXT);
        CREATE TABLE staff (staff_id INTEGER PRIMARY KEY, staff_name TEXT, role TEXT, department_id INTEGER);
        CREATE TABLE operational_events (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, entity_id TEXT, timestamp DATETIME, description TEXT);
    ''')
    
    depts = ['Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'General Surgery']
    for i, d in enumerate(depts, 1):
        cur.execute("INSERT INTO departments VALUES (?, ?, ?, ?, ?)", (i, d, d[:3].upper(), i, 100))
        
    types = [('Basic', 1000.0, 0), ('Elite', 2500.0, 0), ('Premium', 5000.0, 1)]
    for i, t in enumerate(types, 1):
        cur.execute("INSERT INTO room_types VALUES (?, ?, ?, ?)", (i, t[0], t[1], t[2]))
        
    for floor in range(1, 6):
        for idx in range(20):
            room_num = (floor * 100) + idx + 1
            room_id = f"R{room_num}"
            type_id = np.random.randint(1, 4)
            cur.execute("INSERT INTO rooms VALUES (?, ?, ?, ?, ?, ?)", (room_id, floor, room_num, np.random.randint(1, 6), type_id, 'Available'))
            for b in ['A', 'B']:
                cur.execute("INSERT INTO beds (room_id, bed_number, status) VALUES (?,?,?)", (room_id, b, np.random.choice(['Available', 'Occupied'])))

    for i in range(1000):
        cur.execute("INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?)", (f"P{i:04d}", fake.name(), np.random.choice(['Male', 'Female']), np.random.randint(18, 85), fake.city(), fake.state()))
        
    # POPULATE STAFF
    staff_roles = ['Doctor', 'Nurse', 'Technician', 'Admin']
    for i in range(50):
        cur.execute("INSERT INTO staff VALUES (?, ?, ?, ?)", (i, fake.name(), np.random.choice(staff_roles), np.random.randint(1, 6)))
        
    conn.commit()
    conn.close()
    print("Database built and seeded successfully with Staff data.")

if __name__ == "__main__":
    seed()