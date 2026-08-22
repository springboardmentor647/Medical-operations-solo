import os
import sqlite3
import random
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd

fake = Faker('en_IN')

def seed():
    DB_DIR = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data"
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "hospital_blueprint.db")
    
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    from backend.database import init_db
    init_db()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    departments = [
        (1, 'Cardiology', 'CAR', 1, 60),
        (2, 'Orthopedics', 'ORT', 2, 50),
        (3, 'Pediatrics', 'PED', 3, 40),
        (4, 'General Medicine', 'GEN', 4, 70),
        (5, 'General Surgery', 'SUR', 5, 50)
    ]
    cur.executemany("INSERT INTO departments VALUES (?, ?, ?, ?, ?)", departments)

    room_types = [
        (1, 'Basic', 'Standard', 'Standard', 'AC, TV, Wi-Fi, Attached Bathroom', False, False, 'Standard', 1200.0),
        (2, 'Elite', 'Large', 'Enhanced', 'AC, Smart TV, Wi-Fi, Attached Bathroom, Refrigerator, Better Furnishings', False, False, 'High', 3000.0),
        (3, 'Premium', 'Largest', 'Premium', 'AC, Smart TV, Wi-Fi, Attached Bathroom, Refrigerator, Premium Furnishings, Mini Lounge', True, True, 'Highest', 6500.0)
    ]
    cur.executemany("INSERT INTO room_types VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", room_types)

    diagnoses = [
        (1, 'Acute Myocardial Infarction', 'Cardiovascular', 'Critical'),
        (2, 'Hypertensive Heart Disease', 'Cardiovascular', 'Moderate'),
        (3, 'Osteoarthritis Knee', 'Musculoskeletal', 'Mild'),
        (4, 'Femur Fracture', 'Trauma', 'Severe'),
        (5, 'Bronchopneumonia', 'Respiratory', 'Moderate'),
        (6, 'Viral Gastroenteritis', 'Infectious', 'Mild'),
        (7, 'Type 2 Diabetes Mellitus', 'Endocrine', 'Moderate'),
        (8, 'Acute Appendicitis', 'Gastrointestinal', 'Severe'),
        (9, 'Cholelithiasis', 'Gastrointestinal', 'Moderate'),
        (10, 'Chronic Kidney Disease', 'Renal', 'Critical')
    ]
    cur.executemany("INSERT INTO diagnoses VALUES (?, ?, ?, ?)", diagnoses)

    services = [
        (1, 'Echocardiogram', 1, 2500.0),
        (2, 'Coronary Angiography', 1, 15000.0),
        (3, 'Knee Arthroscopy', 2, 35000.0),
        (4, 'Fracture Reduction & Plaster', 2, 8000.0),
        (5, 'Nebulization & O2 Therapy', 3, 1200.0),
        (6, 'Pediatric Critical Care Monitoring', 3, 5000.0),
        (7, 'Intravenous Antibiotic Therapy', 4, 3000.0),
        (8, 'Endocrine Stabilization', 4, 4500.0),
        (9, 'Laparoscopic Appendectomy', 5, 45000.0),
        (10, 'Open Cholecystectomy', 5, 55000.0)
    ]
    cur.executemany("INSERT INTO services VALUES (?, ?, ?, ?)", services)

    doctors = []
    doc_id = 1
    doc_specializations = {
        1: [('Cardiologist', 'Senior Consultant'), ('Interventional Cardiologist', 'Head of Department')],
        2: [('Orthopedic Surgeon', 'Senior Consultant'), ('Joint Replacement Specialist', 'Consultant')],
        3: [('Pediatrician', 'Associate Consultant'), ('Pediatric Intensivist', 'Senior Consultant')],
        4: [('Internal Medicine Specialist', 'Chief Physician'), ('General Physician', 'Consultant')],
        5: [('General Surgeon', 'Chief Surgeon'), ('Laparoscopic Surgeon', 'Senior Consultant')]
    }
    for dept_id, specs in doc_specializations.items():
        for spec, desig in specs:
            doctors.append((doc_id, f"Dr. {fake.name()}", dept_id, spec, desig))
            doc_id += 1
    cur.executemany("INSERT INTO doctors VALUES (?, ?, ?, ?, ?)", doctors)

    staff = []
    staff_id = 1
    roles = ['Nurse', 'Senior Nurse', 'Technician', 'Ward Attendant']
    for dept_id in range(1, 6):
        for _ in range(10):
            staff.append((staff_id, fake.name(), random.choice(roles), dept_id))
            staff_id += 1
    cur.executemany("INSERT INTO staff VALUES (?, ?, ?, ?)", staff)

    staff_assignments = []
    assign_id = 1
    shifts = ['Morning', 'Evening', 'Night']
    for s_id in range(1, 51):
        dept = ((s_id - 1) // 10) + 1
        staff_assignments.append((assign_id, s_id, dept, random.choice(shifts), datetime.now() - timedelta(hours=random.randint(1, 8))))
        assign_id += 1
    cur.executemany("INSERT INTO staff_assignments VALUES (?, ?, ?, ?, ?)", staff_assignments)

    rooms = []
    beds = []
    bed_id = 1

    for floor in range(1, 6):
        dept_id = floor
        room_dist = ['Basic'] * 12 + ['Elite'] * 5 + ['Premium'] * 3
        random.shuffle(room_dist)

        for idx, rtype_name in enumerate(room_dist):
            room_num = (floor * 100) + (idx + 1)
            room_id = f"R{room_num}"
            type_id = 1 if rtype_name == 'Basic' else (2 if rtype_name == 'Elite' else 3)
            
            rooms.append((room_id, floor, room_num, dept_id, type_id, 'Available'))

            bed_labels = ['A'] if type_id == 3 else ['A', 'B']
            for blabel in bed_labels:
                beds.append((bed_id, room_id, blabel, 'Available'))
                bed_id += 1

    cur.executemany("INSERT INTO rooms VALUES (?, ?, ?, ?, ?, ?)", rooms)
    cur.executemany("INSERT INTO beds VALUES (?, ?, ?, ?)", beds)

    indian_states_districts = {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
        'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
        'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi'],
        'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Noida']
    }

    patients = []
    for p in range(1, 1001):
        p_id = f"P{p:04d}"
        p_gender = random.choice(['Male', 'Female'])
        p_name = fake.name_male() if p_gender == 'Male' else fake.name_female()
        p_age = random.randint(1, 88)
        p_state = random.choice(list(indian_states_districts.keys()))
        p_district = random.choice(indian_states_districts[p_state])
        p_city = p_district
        p_pin = str(random.randint(110001, 700001))
        patients.append((p_id, p_name, p_gender, p_age, p_city, p_district, p_state, p_pin))
    cur.executemany("INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?)", patients)

    admissions = []
    discharges = []
    bed_assignments = []
    movements = []
    treatments = []
    events = []

    adm_id = 1
    dis_id = 1
    b_assign_id = 1
    mov_id = 1
    treat_id = 1
    ev_id = 1

    total_beds_count = len(beds)
    occupied_count = int(total_beds_count * 0.76)
    cleaning_count = int(total_beds_count * 0.08)
    maintenance_count = int(total_beds_count * 0.04)

    bed_indices = list(range(1, total_beds_count + 1))
    random.shuffle(bed_indices)

    occupied_beds = bed_indices[:occupied_count]
    cleaning_beds = bed_indices[occupied_count:occupied_count + cleaning_count]
    maintenance_beds = bed_indices[occupied_count + cleaning_count:occupied_count + cleaning_count + maintenance_count]

    cur.executemany("UPDATE beds SET status = 'Occupied' WHERE bed_id = ?", [(b,) for b in occupied_beds])
    cur.executemany("UPDATE beds SET status = 'Cleaning' WHERE bed_id = ?", [(b,) for b in cleaning_beds])
    cur.executemany("UPDATE beds SET status = 'Maintenance' WHERE bed_id = ?", [(b,) for b in maintenance_beds])

    for b_id in occupied_beds:
        cur.execute("SELECT b.room_id, r.department_id, r.floor FROM beds b JOIN rooms r ON b.room_id = r.room_id WHERE b.bed_id = ?", (b_id,))
        r_id, d_id, fl = cur.fetchone()
        
        cur.execute("SELECT doctor_id FROM doctors WHERE department_id = ?", (d_id,))
        possible_docs = [row[0] for row in cur.fetchall()]
        doc = random.choice(possible_docs)
        
        diag = random.choice(range(1, 11))
        pat_id = f"P{adm_id:04d}"
        
        days_ago = random.randint(1, 14)
        adm_date = datetime.now() - timedelta(days=days_ago, hours=random.randint(1, 20))
        exp_dis = adm_date + timedelta(days=random.randint(3, 10))
        
        admissions.append((adm_id, pat_id, adm_date, random.choice(['Urgent', 'Emergency', 'Elective']), d_id, doc, diag, exp_dis, None, 'Active'))
        bed_assignments.append((b_assign_id, adm_id, pat_id, b_id, adm_date, None, 'Active'))
        events.append((ev_id, 'ADMISSION', 'Admission', str(adm_id), adm_date, f"Patient {pat_id} admitted to Department {d_id} in Bed ID {b_id}"))
        ev_id += 1
        b_assign_id += 1
        
        treatments.append((treat_id, adm_id, pat_id, random.choice(range(1, 11)), doc, adm_date + timedelta(hours=random.randint(2, 24)), 'Completed'))
        treat_id += 1
        
        if random.random() < 0.20:
            cur.execute("SELECT bed_id FROM beds WHERE bed_id != ? AND status = 'Occupied' LIMIT 1", (b_id,))
            prior_bed_row = cur.fetchone()
            if prior_bed_row:
                prior_bed = prior_bed_row[0]
                move_time = adm_date + timedelta(hours=random.randint(24, 72))
                movements.append((mov_id, adm_id, pat_id, d_id, d_id, prior_bed, b_id, move_time, "Clinical Condition Escalation"))
                events.append((ev_id, 'PATIENT_TRANSFER', 'PatientMovement', str(mov_id), move_time, f"Patient {pat_id} transferred to Bed {b_id}"))
                ev_id += 1
                mov_id += 1
        
        adm_id += 1

    for h in range(1, 400):
        past_pat_id = f"P{random.randint(occupied_count + 1, 1000):04d}"
        d_id = random.randint(1, 5)
        cur.execute("SELECT doctor_id FROM doctors WHERE department_id = ?", (d_id,))
        doc = random.choice([row[0] for row in cur.fetchall()])
        diag = random.choice(range(1, 11))
        
        adm_days = random.randint(5, 30)
        stay_days = random.randint(2, 6)
        adm_time = datetime.now() - timedelta(days=adm_days)
        dis_time = adm_time + timedelta(days=stay_days)
        exp_time = adm_time + timedelta(days=stay_days + random.randint(-1, 2))
        
        admissions.append((adm_id, past_pat_id, adm_time, random.choice(['Urgent', 'Emergency', 'Elective']), d_id, doc, diag, exp_time, dis_time, 'Discharged'))
        discharges.append((dis_id, adm_id, dis_time, 'Standard Medical Discharge', 'Patient recovered satisfactorily.'))
        events.append((ev_id, 'DISCHARGE', 'Discharge', str(dis_id), dis_time, f"Patient {past_pat_id} discharged from Department {d_id}"))
        ev_id += 1
        dis_id += 1
        adm_id += 1

    cur.executemany("INSERT INTO admissions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", admissions)
    cur.executemany("INSERT INTO discharges VALUES (?, ?, ?, ?, ?)", discharges)
    cur.executemany("INSERT INTO bed_assignments VALUES (?, ?, ?, ?, ?, ?, ?)", bed_assignments)
    cur.executemany("INSERT INTO patient_movements VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", movements)
    cur.executemany("INSERT INTO treatments VALUES (?, ?, ?, ?, ?, ?, ?)", treatments)
    cur.executemany("INSERT INTO operational_events VALUES (?, ?, ?, ?, ?, ?)", events)

    for r_tuple in rooms:
        rid = r_tuple[0]
        cur.execute("SELECT status FROM beds WHERE room_id = ?", (rid,))
        b_statuses = [r[0] for r in cur.fetchall()]
        if 'Occupied' in b_statuses:
            r_stat = 'Occupied'
        elif 'Cleaning' in b_statuses:
            r_stat = 'Cleaning'
        elif 'Maintenance' in b_statuses:
            r_stat = 'Maintenance'
        else:
            r_stat = 'Available'
        cur.execute("UPDATE rooms SET status = ? WHERE room_id = ?", (r_stat, rid))

    conn.commit()

    processed_dir = os.path.join(DB_DIR, "processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    tables_to_export = [
        'departments', 'doctors', 'staff', 'diagnoses', 'services', 
        'room_types', 'rooms', 'beds', 'patients', 'admissions', 
        'discharges', 'bed_assignments', 'patient_movements', 
        'treatments', 'operational_events'
    ]
    for table_name in tables_to_export:
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        df.to_csv(os.path.join(processed_dir, f"{table_name}.csv"), index=False)

    conn.close()

if __name__ == "__main__":
    seed()