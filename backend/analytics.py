import plotly.express as px
import pandas as pd
import sqlite3
import os

def generate_occupancy_chart():
    db_path = r"D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\data\hospital_blueprint.db"
    conn = sqlite3.connect(db_path)
    df = pd.read_sql("SELECT status, count(*) as count FROM rooms GROUP BY status", conn)
    conn.close()
    
    fig = px.pie(df, values='count', names='status', title='Hospital Occupancy Distribution', template='plotly_dark')
    fig.write_image("occupancy_chart.png")
    return "Chart generated as occupancy_chart.png"