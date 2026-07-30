import pandas as pd
import sqlite3
import os

def process_and_store(raw_path, processed_path, db_path):
    df = pd.read_csv(raw_path)
    
    if 'Name' in df.columns:
        df['Name'] = df['Name'].astype(str).str.title()
    
    for col in ['Date of Admission', 'Discharge Date']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], dayfirst=True, errors='coerce')
            
    if 'Date of Admission' in df.columns and 'Discharge Date' in df.columns:
        df['Length of Stay'] = (df['Discharge Date'] - df['Date of Admission']).dt.days
        df['Length of Stay'] = df['Length of Stay'].fillna(0).astype(int)
        
    if 'Billing Amount' in df.columns:
        df['Billing Amount'] = pd.to_numeric(df['Billing Amount'], errors='coerce').round(2)
        
    os.makedirs(os.path.dirname(processed_path), exist_ok=True)
    df.to_csv(processed_path, index=False)
    
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    df.to_sql('healthcare_operations', conn, if_exists='replace', index=False)
    conn.close()

def fetch_processed_data(db_path):
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query("SELECT * FROM healthcare_operations", conn)
    conn.close()
    
    for col in ['Date of Admission', 'Discharge Date']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    return df

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_csv = os.path.join(base_dir, "data", "raw", "healthcare_dataset.csv")
    processed_csv = os.path.join(base_dir, "data", "processed", "processed.csv")
    sqlite_db = os.path.join(base_dir, "data", "processed", "healthcare.db")
    
    process_and_store(raw_csv, processed_csv, sqlite_db)