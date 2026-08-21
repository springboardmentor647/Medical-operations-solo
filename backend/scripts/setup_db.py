import sqlite3
import pandas as pd
import numpy as np
from faker import Faker
import os

fake = Faker('en_IN')

def setup_db():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    if os.path.exists(db_path): os.remove(db_path)
    conn = sqlite3.connect(db_path)
    
    conn.executescript('''
        CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT, department_code TEXT, floor INTEGER, capacity INTEGER);
        CREATE TABLE room_types (room_type_id INTEGER PRIMARY KEY, room_type_name TEXT, base_tariff REAL, visitor_bed_available BOOLEAN);
        CREATE TABLE rooms (room_id TEXT PRIMARY KEY, floor INTEGER, room_number INTEGER, department_id INTEGER, room_type_id INTEGER, status TEXT);
        CREATE TABLE beds (bed_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, bed_number TEXT, status TEXT);
        CREATE TABLE patients (patient_id TEXT PRIMARY KEY, patient_name TEXT, gender TEXT, age INTEGER, city TEXT, state TEXT);
    ''')

    depts = ['Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'General Surgery']
    for i, d in enumerate(depts, 1): conn.execute("INSERT INTO departments VALUES (?,?,?,?,?)", (i, d, d[:3].upper(), (i%5)+1, 100))
    
    types = [('Basic', 1000.0, 0), ('Elite', 2500.0, 0), ('Premium', 5000.0, 1)]
    for i, t in enumerate(types, 1): conn.execute("INSERT INTO room_types VALUES (?,?,?,?)", (i, t[0], t[1], t[2]))

    for floor in range(1, 6):
        for room_num in range(101, 121):
            rid = f"R{floor}{room_num}"
            conn.execute("INSERT INTO rooms VALUES (?,?,?,?,?,?)", (rid, floor, room_num, np.random.randint(1, 6), np.random.randint(1, 4), 'Available'))
            conn.execute("INSERT INTO beds (room_id, bed_number, status) VALUES (?,?,?)", (rid, 'A', np.random.choice(['Available', 'Occupied'])))
            conn.execute("INSERT INTO beds (room_id, bed_number, status) VALUES (?,?,?)", (rid, 'B', np.random.choice(['Available', 'Occupied'])))

    for i in range(1000):
        conn.execute("INSERT INTO patients VALUES (?,?,?,?,?,?)", (f"P{i:04d}", fake.name(), np.random.choice(['Male', 'Female']), np.random.randint(18, 80), fake.city(), fake.state()))

    conn.commit()
    conn.close()
    print("Database built and seeded.")

if __name__ == "__main__": setup_db()