import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Analytics() {
  const [floorData, setFloorData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [workforceData, setWorkforceData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/analytics/floor-summary').then(res => setFloorData(res.data));
    axios.get('http://127.0.0.1:8000/analytics/status-distribution').then(res => setStatusData(res.data));
    axios.get('http://127.0.0.1:8000/analytics/workforce').then(res => setWorkforceData(res.data));
  }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308'];

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Operational Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Occupancy by Floor */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Occupancy by Floor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorData}>
                <XAxis dataKey="floor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupied" fill="#ef4444" />
                <Bar dataKey="available" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff per Dept */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Staff per Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workforceData}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Bed Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Global Bed Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}