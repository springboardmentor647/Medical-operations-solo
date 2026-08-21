import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_capacity: 0, occupied_beds: 0, occupancy_rate: 0 });

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/analytics/occupancy')
      .then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-panel">
          <p className="text-slate-500 text-sm">Total Capacity</p>
          <h2 className="text-3xl font-bold mt-2">{stats.total_capacity}</h2>
        </div>
        <div className="card-panel">
          <p className="text-slate-500 text-sm">Occupancy Rate</p>
          <h2 className="text-3xl font-bold mt-2">{stats.occupancy_rate.toFixed(1)}%</h2>
        </div>
        <div className="card-panel">
          <p className="text-slate-500 text-sm">Active Patients</p>
          <h2 className="text-3xl font-bold mt-2">{stats.occupied_beds}</h2>
        </div>
      </div>
    </div>
  );
}