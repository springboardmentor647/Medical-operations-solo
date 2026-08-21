import sqlite3
import pandas as pd
import os

def inspect():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    
    tables = ['rooms', 'patients']
    
    for table in tables:
        print(f"\n{'='*20} TABLE: {table.upper()} {'='*20}")
        
        # Get column info
        cols = pd.read_sql(f"PRAGMA table_info({table})", conn)
        print("COLUMNS:")
        print(cols[['name', 'type']])
        
        # Get data preview
        df = pd.read_sql(f"SELECT * FROM {table} LIMIT 5", conn)
        print("\nPREVIEW (First 5 rows):")
        print(df.head())
        
        # Get counts of unique statuses or wards if applicable
        if table == 'rooms':
            print("\nSTATUS DISTRIBUTION:")
            print(pd.read_sql(f"SELECT status, count(*) FROM {table} GROUP BY status", conn))
            
    conn.close()

if __name__ == "__main__":
    inspect()