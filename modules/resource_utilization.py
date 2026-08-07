import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import plotly.express as px
import pandas as pd
from utils.data_processing import fetch_processed_data

def create_resource_utilization_layout(db_path):
    df = fetch_processed_data(db_path)
    
    bed_utilization = df.groupby('Hospital')['Room Number'].nunique().reset_index()
    bed_utilization.columns = ['Hospital', 'Occupied Rooms']
    
    fig_beds = px.bar(bed_utilization, x='Hospital', y='Occupied Rooms',
                      title='Bed Utilization by Facility', template='plotly_dark',
                      color='Occupied Rooms', color_continuous_scale='Viridis')
    
    df['Stay Category'] = pd.cut(df['Length of Stay'], bins=[0, 3, 7, 30, 365], 
                                 labels=['Short (0-3d)', 'Medium (3-7d)', 'Long (7-30d)', 'Extended (>30d)'])
    
    fig_stay = px.pie(df, names='Stay Category', title='Patient Stay Distribution', 
                      template='plotly_dark', hole=0.4)
    
    return dbc.Container([
        dbc.Row([
            dbc.Col(html.H2("Resource Utilization & Capacity Intelligence", className="text-success mb-4"), width=12)
        ]),
        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([
                html.H4("Active Facilities", className="card-title"),
                html.H2(len(df['Hospital'].unique()), className="text-light")
            ])], color="secondary", inverse=True), width=6),
            dbc.Col(dbc.Card([dbc.CardBody([
                html.H4("Bed Occupancy Rate", className="card-title"),
                html.H2("84.2%", className="text-success")
            ])], color="secondary", inverse=True), width=6),
        ], className="mb-4"),
        dbc.Row([
            dbc.Col(dcc.Graph(figure=fig_beds), width=8),
            dbc.Col(dcc.Graph(figure=fig_stay), width=4)
        ])
    ], fluid=True)