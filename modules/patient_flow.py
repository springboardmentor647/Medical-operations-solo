import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from utils.data_processing import fetch_processed_data
import os

def create_patient_flow_layout(db_path):
    df = fetch_processed_data(db_path)
    
    df['Date of Admission'] = pd.to_datetime(df['Date of Admission'])
    daily_admissions = df.groupby(df['Date of Admission'].dt.date).size().reset_index(name='Count')
    
    fig_flow = px.line(daily_admissions, x='Date of Admission', y='Count', 
                       title='Patient Admission Velocity', template='plotly_dark')
    fig_flow.update_traces(line_color='#00d4ff', line_width=3)
    
    fig_dept = px.histogram(df, x='Hospital', color='Admission', barmode='group',
                            title='Departmental Admission Demand', template='plotly_dark')
    
    return dbc.Container([
        dbc.Row([
            dbc.Col(html.H2("Patient Flow & Service Demand", className="text-primary mb-4"), width=12)
        ]),
        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([
                html.H4("Total Admissions", className="card-title"),
                html.H2(len(df), className="text-info")
            ])], color="dark", inverse=True), width=4),
            dbc.Col(dbc.Card([dbc.CardBody([
                html.H4("Avg Length of Stay", className="card-title"),
                html.H2(f"{df['Length of Stay'].mean():.1f} Days", className="text-warning")
            ])], color="dark", inverse=True), width=4),
            dbc.Col(dbc.Card([dbc.CardBody([
                html.H4("Max Daily Demand", className="card-title"),
                html.H2(daily_admissions['Count'].max(), className="text-danger")
            ])], color="dark", inverse=True), width=4),
        ], className="mb-4"),
        dbc.Row([
            dbc.Col(dcc.Graph(figure=fig_flow), width=8),
            dbc.Col(dcc.Graph(figure=fig_dept), width=4)
        ])
    ], fluid=True)