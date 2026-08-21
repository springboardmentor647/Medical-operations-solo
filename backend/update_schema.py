import pandas as pd
import sqlite3
import numpy as np

def update_db():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    conn = sqlite3.connect(db_path)
    
    # Load rooms
    df = pd.read_sql("SELECT * FROM rooms", conn)
    
    # Define Distribution
    total_rooms = len(df)
    n_normal = int(total_rooms * 0.60)
    n_comfort = int(total_rooms * 0.25)
    n_royal = total_rooms - n_normal - n_comfort
    
    # Assign Room Types
    types = ['Normal'] * n_normal + ['Comfort'] * n_comfort + ['Royal'] * n_royal
    np.random.shuffle(types)
    df['room_type'] = types
    
    # Assign Statuses
    statuses = ['Available', 'Cleaning', 'Maintenance', 'Occupied', 'Reserved']
    df['status'] = np.random.choice(statuses, size=total_rooms, p=[0.11, 0.06, 0.02, 0.78, 0.03])
    
    # Save back
    df.to_sql('rooms', conn, if_exists='replace', index=False)
    conn.close()
    print("Database updated with new room type distribution and status logic.")

if __name__ == "__main__":
    update_db()