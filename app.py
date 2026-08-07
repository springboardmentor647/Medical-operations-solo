import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import os
from modules.patient_flow import create_patient_flow_layout
from modules.resource_utilization import create_resource_utilization_layout
from modules.geo_dashboard import create_geo_dashboard_layout

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.DARKLY])
db_path = os.path.join("data", "processed", "healthcare.db")

app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("Medical Operations Intelligence Dashboard", className="text-center text-light my-4"), width=12)
    ]),
    dcc.Tabs([
        dcc.Tab(label='Patient Flow & Demand', children=[
            create_patient_flow_layout(db_path)
        ], className="bg-dark text-white", selected_className="bg-primary text-white"),
        dcc.Tab(label='Resource Capacity', children=[
            create_resource_utilization_layout(db_path)
        ], className="bg-dark text-white", selected_className="bg-primary text-white"),
        dcc.Tab(label='Geographic Intelligence', children=[
            create_geo_dashboard_layout(db_path)
        ], className="bg-dark text-white", selected_className="bg-primary text-white"),
    ], colors={"border": "#444", "primary": "#00d4ff", "background": "#222"}),
], fluid=True, style={"backgroundColor": "#1a1a1a", "minHeight": "100vh"})

if __name__ == "__main__":
    app.run_server(debug=True)