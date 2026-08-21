import sqlite3
import os

def migrate():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Drop tables to ensure fresh start
    cur.executescript('''
        DROP TABLE IF EXISTS staff;
        DROP TABLE IF EXISTS departments;
        DROP TABLE IF EXISTS room_types;
        DROP TABLE IF EXISTS rooms;
        DROP TABLE IF EXISTS beds;
        DROP TABLE IF EXISTS patients;
        DROP TABLE IF EXISTS operational_events;
        
        CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT, department_code TEXT, floor INTEGER, capacity INTEGER);
        CREATE TABLE room_types (room_type_id INTEGER PRIMARY KEY, room_type_name TEXT, base_tariff REAL, visitor_bed_available BOOLEAN);
        CREATE TABLE rooms (room_id TEXT PRIMARY KEY, floor INTEGER, room_number INTEGER, department_id INTEGER, room_type_id INTEGER, status TEXT);
        CREATE TABLE beds (bed_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, bed_number TEXT, status TEXT);
        CREATE TABLE patients (patient_id TEXT PRIMARY KEY, patient_name TEXT, gender TEXT, age INTEGER, city TEXT, state TEXT);
        CREATE TABLE staff (staff_id INTEGER PRIMARY KEY, staff_name TEXT, role TEXT, department_id INTEGER);
        CREATE TABLE operational_events (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, entity_id TEXT, timestamp DATETIME, description TEXT);
    ''')
    conn.commit()
    conn.close()
    print("Schema Migrated Successfully.")

if __name__ == "__main__":
    migrate()