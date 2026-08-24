File: `README.md`

```markdown
# Medical Operations Intelligence Platform (MediOps Pro)

An enterprise-grade healthcare operations analytics, hospital resource planning, and clinical workload intelligence platform. Designed as a centralized decision-support system to provide visibility into patient flow dynamics, infrastructure capacity, workforce deployment, and operational risk metrics.

---

## 1. Project Statement & Objectives

Healthcare administrators require unified visibility across operational functions to eliminate bottlenecks, forecast admission pressures, optimize bed turnover, and maintain institutional efficiency.

MediOps Pro transitions hospital administration from static reporting to real-time operational intelligence by structuring clinical and infrastructural events into an analytics-ready platform:

$$\text{Raw Event Streams} \longrightarrow \text{Relational Database Engine} \longrightarrow \text{SQL Analytical Views} \longrightarrow \text{High-Performance API} \longrightarrow \text{Interactive Command Center}$$

### Key Outcomes
- **Multi-Level Facility Visibility**: Granular bed-level status tracking categorized by architectural accommodation tiers.
- **Dynamic Capacity Intelligence**: Real-time occupancy calculations, cleaning queues, and maintenance downtime metrics.
- **Clinical Workload Analytics**: Aggregated diagnostic volumes, procedure counts, and department-specific patient loads.
- **Geographic Catchment Intelligence**: Demographic distribution mappings of patient registrations across Indian states and districts.
- **Automated Risk Alerts**: Algorithmic detection of capacity saturation, prolonged discharge delays, and turnover bottlenecks.

---

## 2. System Architecture & Relational Data Model

The platform uses a normalized SQLite operational database with complete relational integrity (`PRAGMA foreign_keys = ON`).

```
                    ┌─────────────────────────┐
                    │      DEPARTMENTS        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     DOCTORS     │     │      STAFF      │     │      ROOMS      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │STAFF_ASSIGNMENTS│     │      BEDS       │
         │              └─────────────────┘     └────────┬────────┘
         │                                               │
         └───────────────────────┐                       │
                                 │                       │
                                 ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    PATIENTS     │────►│   ADMISSIONS    │◄────┤ BED_ASSIGNMENTS │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DISCHARGES    │     │PATIENT_MOVEMENTS│     │   TREATMENTS    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Relational Entity Dictionary
| Table | Primary Key | Foreign Keys | Functional Responsibility |
| :--- | :--- | :--- | :--- |
| `departments` | `department_id` | - | Clinical departments, nominal capacity, and floor allocations |
| `room_types` | `room_type_id` | - | Architectural tiers (Basic, Elite, Premium), amenities, and tariffs |
| `rooms` | `room_id` | `department_id`, `room_type_id` | Structural room units across hospital floor levels |
| `beds` | `bed_id` | `room_id` | Individual physical beds with live operational states |
| `doctors` | `doctor_id` | `department_id` | Attending physicians, specialties, and clinical designations |
| `staff` | `staff_id` | `department_id` | Nursing, technical, and ward administrative workforce |
| `staff_assignments`| `assignment_id` | `staff_id`, `department_id` | Shift-based workforce allocations (Morning, Evening, Night) |
| `diagnoses` | `diagnosis_id` | - | Standardized clinical disease classifications and severity levels |
| `services` | `service_id` | `department_id` | Medical procedures, diagnostics, and intervention catalog |
| `patients` | `patient_id` | - | Master demographic registry with Indian states and districts |
| `admissions` | `admission_id` | `patient_id`, `department_id`, `doctor_id`, `diagnosis_id` | Hospitalization episodes, intake types, and discharge timelines |
| `discharges` | `discharge_id` | `admission_id` | Official discharge records, release categories, and clinical summaries |
| `bed_assignments`| `assignment_id` | `admission_id`, `patient_id`, `bed_id` | Longitudinal bed allocation history per admission episode |
| `patient_movements`| `movement_id` | `admission_id`, `patient_id`, `from_bed_id`, `to_bed_id` | Intra-facility departmental and bed transfer audit trail |
| `treatments` | `treatment_id` | `admission_id`, `patient_id`, `service_id`, `doctor_id` | Executed clinical services and therapeutic interventions |
| `operational_events`| `event_id` | - | System-wide immutable chronological audit ledger |

---

## 3. SQL Analytical Views & KPI Formulation

To eliminate Cartesian join performance overhead, analytical aggregations are computed directly within database views.

### Mathematical KPI Formulations

$$\text{Bed Occupancy Rate (\%)} = \left( \frac{\sum \text{Occupied Beds}}{\sum \text{Total Registered Beds}} \right) \times 100$$

$$\text{Department Occupancy Rate (\%)} = \left( \frac{\text{Occupied Beds}_{\text{Dept}}}{\text{Total Beds}_{\text{Dept}}} \right) \times 100$$

$$\text{Accommodation Tier Utilization (\%)} = \left( \frac{\text{Occupied Beds}_{\text{Tier}}}{\text{Total Beds}_{\text{Tier}}} \right) \times 100$$

### Built-in SQL Views
1. **`v_hospital_overview`**: Instantaneous hospital-wide counts for capacity, active patients, daily admissions, daily discharges, and global occupancy.
2. **`v_floor_summary`**: Level-by-level breakdown of total, occupied, available, cleaning, and maintenance beds.
3. **`v_department_metrics`**: Clinical unit tracking including nominal capacity, doctor counts, nursing staff, active caseloads, and departmental occupancy percentages.
4. **`v_room_type_analytics`**: Resource consumption metrics grouped by room tier specifications (Basic, Elite, Premium).
5. **`v_geographic_distribution`**: State and district patient concentrations for epidemiological and catchment analysis.

---

## 4. Platform Modules & Dashboard Features

### Module 1: Executive Command Center
- Real-time KPI summary tracking total capacity, occupancy rate, cleaning turnover queues, and maintenance downtime.
- 30-Day patient flow velocity tracking admissions versus discharges over time.
- Horizontal bar comparison of departmental bed occupancy pressures.

### Module 2: Floor & Bed Topology (Interactive Blueprints)
- Multi-level architectural navigation with real-time status indicators (Available: Emerald, Occupied: Rose, Cleaning: Amber, Maintenance: Slate).
- Room tier categorization (`Basic (12 rooms) > Elite (5 rooms) > Premium (3 rooms)` per floor).
- Bed-level drawer management: view assigned patient profiles, diagnosis, attending physician, expected discharge date, and perform operational state changes or patient discharges.

### Module 3: Operational Intelligence & Analytics
- Multi-chart analytics hub featuring departmental capacity load, accommodation tier utilization, and global bed status distribution.
- Filterable clinical diagnostic intake distribution by disease classification.
- Filterable clinical service workload and procedure execution volumes.

### Module 4: Risk & Anomaly Alerts
- Automated threshold checking identifying critical capacity saturation ($\ge 85\%$).
- Early detection of discharge delays where active patient stay exceeds expected discharge date.
- Identification of housekeeping turnover backlogs.

### Module 5: Geographic Catchment Intelligence
- Interactive OpenStreetMap integration utilizing Leaflet and React-Leaflet.
- Proportional regional density circle markers based on patient origin volumes across Indian states.
- Ranked tabular breakdown of regional patient inflows and institutional episodes.

### Module 6: System Audit Event Log
- Comprehensive chronological transaction history detailing admissions, discharges, patient transfers, and bed status updates.
- Category-based event filtering (`ADMISSION`, `DISCHARGE`, `PATIENT_TRANSFER`, `BED_STATUS_CHANGE`).

---

## 5. Technology Stack

- **Backend Framework**: Python 3.12+, FastAPI, Uvicorn
- **Database & ORM**: SQLite3 (WAL mode, Foreign Keys enabled), SQLAlchemy Core & ORM
- **Synthetic Data Engine**: Faker (Indian Locale `en_IN`), NumPy, Pandas
- **Frontend Framework**: React 18 (Vite Bundler), React Router DOM v6
- **Styling & Layout**: Tailwind CSS v4, Lucide React Icons
- **Data Visualization**: Recharts (Responsive SVG Charts)
- **Geographic Mapping**: Leaflet, React-Leaflet, OpenStreetMap Tiles

---

## 6. Directory Structure

```text
APP/
├── backend/
│   ├── main.py                     # FastAPI routes, CORS middleware, and API endpoints
│   ├── database.py                 # SQLAlchemy schema, relationships, and SQL analytical views
│   ├── models.py                   # Pydantic schemas (Data Transfer Objects & KPI validation)
│   ├── services/
│   │   ├── analytics_engine.py     # Aggregated analytics, SQL view readers, and risk logic
│   │   └── event_handler.py        # Automated transactional audit logging service
│   ├── scripts/
│   │   └── seed_data.py            # CSV import
│   └── inspect_db.py               # Database inspection and schema verification utility
├── data/
│   ├── hospital_blueprint.db       # Primary SQLite operational database
│   └── processed/                  # CSV data exports generated during database initialization
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                # React root application bootstrap
│       ├── App.jsx                 # Global router and structural layout shell
│       ├── index.css               # Base CSS and Tailwind CSS directives
│       ├── components/
│       │   └── Sidebar.jsx         # Navigation sidebar
│       └── pages/
│           ├── Dashboard.jsx       # Executive command center overview
│           ├── FloorManagement.jsx # Floor summaries and room type definitions table
│           ├── Blueprint.jsx       # Interactive floor map and bed management drawer
│           ├── Analytics.jsx       # Operational analytics and workload charts
│           ├── RiskAlerts.jsx      # Threshold violations and bottleneck alerts
│           ├── OperationalEvents.jsx# Immutable audit transaction ledger
│           └── GeoMap.jsx          # Geographic patient distribution map
├── .gitignore
└── README.md
```

---

## 7. Local Setup & Execution Guide

### Prerequisites
- **Python**: Version 3.10 or higher installed
- **Node.js**: Version 18 or higher with `npm` installed

---

### Step 1: Backend Environment Setup & Seeding

1. Open PowerShell and navigate to the project root:
   ```powershell
   cd "D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP"
   ```

2. Install Python dependencies:
   ```powershell
   pip install fastapi uvicorn sqlalchemy pandas pydantic python-multipart faker
   ```

3. Initialize the database schema, build SQL analytical views, and seed Indian demographic and hospital operational records:
   ```powershell
   python -m backend.scripts.seed_data
   ```

4. Verify database creation and table integrity:
   ```powershell
   python backend\inspect_db.py
   ```

5. Launch the FastAPI backend server:
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```
   *The API will be available at `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`).*

---

### Step 2: Frontend Environment Setup & Launch

1. Open a second PowerShell terminal window and navigate to the `frontend` folder:
   ```powershell
   cd "D:\INTERNSHIP\7TH SEM\INFOSYS SPRINGBOARD\APP\frontend"
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Launch the Vite development server:
   ```powershell
   npm run dev
   ```
   *The web application will be accessible at `http://localhost:5173`.*

---

## 8. Verification & Operational Testing

| Test Scenario | Verification Procedure | Expected Outcome |
| :--- | :--- | :--- |
| **Database Integrity** | Run `python backend\inspect_db.py` | Confirms 13 tables, `539` admissions, `1000` patients, and `Basic > Elite > Premium` room ratios. |
| **API Endpoints** | Visit `http://127.0.0.1:8000/api/overview` | Returns valid JSON with total capacity, active admissions, and occupancy percentage. |
| **Interactive Blueprint** | Click a bed card on the Blueprint page | Opens management modal showing assigned patient data, tariff, and operational action buttons. |
| **State Transitions** | Click "Approve Cleanliness" on a Cleaning bed | Bed state transitions to `Available`, logs an event to `operational_events`, and updates the UI live. |
| **Geographic Mapping** | Open Geographic Coverage page | Interactive map renders Indian state bubble density markers with patient counts. |
| **Audit Log Ledger** | Open Audit Event Log page | Displays chronological event records with category badges and timestamps. |
```
