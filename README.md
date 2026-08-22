# Medical Operations Intelligence Platform (MediOps Pro)

An enterprise-grade healthcare operations analytics and capacity management platform built with FastAPI, SQLite, React, and Tailwind CSS.

## Architecture Overview

1. **Normalized Data Model & Schema Engine**
   - Tables: `departments`, `doctors`, `staff`, `diagnoses`, `services`, `room_types`, `rooms`, `beds`, `patients`, `admissions`, `discharges`, `bed_assignments`, `patient_movements`, `treatments`, `operational_events`.
   - Relational integrity enforced via `PRAGMA foreign_keys = ON`.
   - Structural categorization of rooms into Basic, Elite, and Premium specifications.

2. **SQL Analytical View Layer**
   - Pre-aggregated views for real-time dashboard performance:
     - `v_hospital_overview`
     - `v_floor_summary`
     - `v_department_metrics`
     - `v_room_type_analytics`
     - `v_geographic_distribution`

3. **Event-Driven Audit & State Engine**
   - Automated creation of business audit events upon admission, discharge, transfer, and bed state changes.

4. **Interactive Command Center UI**
   - Single-bed architectural floor topology with real-time status management.
   - Clinical diagnostics and service workload distributions.
   - Interactive OpenStreetMap geographic patient catchment density visualization.
   - Operational bottleneck and safety violation monitoring.

## Local Execution Instructions

### 1. Backend Setup & Seeding

```powershell
# In project root:
pip install fastapi uvicorn sqlalchemy pandas pydantic python-multipart faker

# Seed master database & export CSV files:
python -m backend.scripts.seed_data

# Launch FastAPI application:
uvicorn backend.main:app --reload --port 8000

 2. Frontend Setup & Launch
code
Powershell
# In frontend directory:
cd frontend
npm install
npm run dev
3. Access Platform
Frontend Interface: http://localhost:5173
Interactive API Documentation: http://127.0.0.1:8000/docs