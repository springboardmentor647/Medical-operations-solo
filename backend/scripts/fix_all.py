import sqlite3
import os

db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"

def fix():
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Run the exact schema we need
    cur.executescript('''
        CREATE TABLE IF NOT EXISTS departments (department_id INTEGER PRIMARY KEY, department_name TEXT, department_code TEXT, floor INTEGER, capacity INTEGER);
        CREATE TABLE IF NOT EXISTS room_types (room_type_id INTEGER PRIMARY KEY, room_type_name TEXT, base_tariff REAL, visitor_bed_available BOOLEAN);
        CREATE TABLE IF NOT EXISTS rooms (room_id TEXT PRIMARY KEY, floor INTEGER, room_number INTEGER, department_id INTEGER, room_type_id INTEGER, status TEXT);
        CREATE TABLE IF NOT EXISTS beds (bed_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, bed_number TEXT, status TEXT);
        CREATE TABLE IF NOT EXISTS patients (patient_id TEXT PRIMARY KEY, patient_name TEXT, gender TEXT, age INTEGER, city TEXT, state TEXT);
        CREATE TABLE IF NOT EXISTS staff (staff_id INTEGER PRIMARY KEY, staff_name TEXT, role TEXT, department_id INTEGER);
        CREATE TABLE IF NOT EXISTS operational_events (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, entity_id TEXT, timestamp DATETIME, description TEXT);
    ''')
    conn.commit()
    conn.close()
    print("All tables confirmed.")

if __name__ == "__main__":
    fix()