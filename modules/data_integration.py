import pandas as pd
import sqlite3
import os

def process_and_store_data(raw_data_path, processed_data_path, db_path):
    df = pd.read_csv(raw_data_path)
    
    if 'Name' in df.columns:
        df['Name'] = df['Name'].astype(str).str.title()
    
    date_cols = ['Date of Admission', 'Discharge Date']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], dayfirst=True, errors='coerce')
            
    if 'Date of Admission' in df.columns and 'Discharge Date' in df.columns:
        df['Length of Stay'] = (df['Discharge Date'] - df['Date of Admission']).dt.days
        
    if 'Billing Amount' in df.columns:
        df['Billing Amount'] = pd.to_numeric(df['Billing Amount'], errors='coerce').round(2)
        
    os.makedirs(os.path.dirname(processed_data_path), exist_ok=True)
    df.to_csv(processed_data_path, index=False)
    
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    df.to_sql('healthcare_operations', conn, if_exists='replace', index=False)
    conn.close()

def fetch_data_from_db(db_path):
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query("SELECT * FROM healthcare_operations", conn)
    conn.close()
    
    date_cols = ['Date of Admission', 'Discharge Date']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])
            
    return df

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, "data", "raw", "healthcare_dataset.csv")
    processed_path = os.path.join(base_dir, "data", "processed", "processed_healthcare_dataset.csv")
    db_path = os.path.join(base_dir, "data", "processed", "healthcare_operations.db")
    
    process_and_store_data(raw_path, processed_path, db_path)