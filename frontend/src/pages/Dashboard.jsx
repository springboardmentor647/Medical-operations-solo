import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHospital } from '../context/HospitalContext';
import { 
  Bed, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Wrench, 
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { appliedFilters } = useHospital();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchDashboardData = async () => {
      try {
        const [ovRes, trRes, dpRes, rkRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/overview'),
          axios.get('http://127.0.0.1:8000/api/trends/patient-flow'),
          axios.get('http://127.0.0.1:8000/api/departments/metrics'),
          axios.get('http://127.0.0.1:8000/api/risks/alerts')
        ]);
        if (isSubscribed) {
          setOverview(ovRes.data);
          setTrends(trRes.data);
          setDepartments(dpRes.data);
          setRisks(rkRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isSubscribed = false;
    };
  }, [appliedFilters]);

  if (loading || !overview) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold animate-pulse">
          <Clock size={20} />
          <span>Synchronizing Institutional State...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Bed Capacity", val: overview.total_beds, icon: Bed, sub: "Registered Infrastructure", color: "text-slate-900", bg: "bg-blue-50/60" },
    { label: "Occupied Beds", val: overview.occupied_beds, icon: Activity, sub: `${overview.occupancy_rate}% Global Rate`, color: "text-rose-600", bg: "bg-rose-50/60" },
    { label: "Available Operational", val: overview.available_beds, icon: Sparkles, sub: "Immediate Placement", color: "text-emerald-600", bg: "bg-emerald-50/60" },
    { label: "Housekeeping Turnover", val: overview.cleaning_beds, icon: Clock, sub: "Cleaning In-Progress", color: "text-amber-600", bg: "bg-amber-50/60" },
    { label: "Maintenance Downtime", val: overview.maintenance_beds, icon: Wrench, sub: "Facility Hold", color: "text-slate-600", bg: "bg-slate-100" },
    { label: "Active Admissions", val: overview.active_patients, icon: Users, sub: "Hospitalized Population", color: "text-indigo-600", bg: "bg-indigo-50/60" }
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Executive Command Center</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Real-time situational intelligence and institutional capacity tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-2">
            <ArrowUpRight size={14} className="text-emerald-600" />
            <span>Admissions Today: <strong className="text-slate-900">{overview.admissions_today}</strong></span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-2">
            <ArrowDownRight size={14} className="text-blue-600" />
            <span>Discharges Today: <strong className="text-slate-900">{overview.discharges_today}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">{k.label}</span>
              <div className={`p-1.5 rounded-md ${k.bg}`}>
                <k.icon size={16} className={k.color} />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-bold tracking-tight ${k.color}`}>{k.val}</span>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">30-Day Patient Flow Velocity</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Daily admissions intake volume versus official discharge completion</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAdm)" name="Admissions" />
                <Area type="monotone" dataKey="discharges" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDis)" name="Discharges" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Departmental Bed Load</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Occupancy percentage across clinical units</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} domain={[0, 100]} unit="%" />
                <YAxis dataKey="department_code" type="category" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'Occupancy Rate']}
                />
                <Bar dataKey="bed_occupancy_rate" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Critical Operational Bottlenecks & Anomaly Alerts</h2>
          </div>
          <button 
            onClick={() => navigate('/risks')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Anomaly Records</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {risks.slice(0, 3).map((r, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {r.severity}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{r.category}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{r.entity}</h4>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{r.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}