import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Filter, Bed, Layers } from 'lucide-react';

export default function Analytics() {
  const [departments, setDepartments] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [services, setServices] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const [dpRes, rtRes, dgRes, svRes, stRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/departments/metrics'),
          axios.get('http://127.0.0.1:8000/api/room-types/analytics'),
          axios.get('http://127.0.0.1:8000/api/analytics/diagnostics'),
          axios.get('http://127.0.0.1:8000/api/analytics/services'),
          axios.get('http://127.0.0.1:8000/api/overview')
        ]);
        if (isMounted) {
          setDepartments(dpRes.data);
          setRoomTypes(rtRes.data);
          setDiagnostics(dgRes.data);
          setServices(svRes.data);
          if (stRes.data) {
            setStatusDistribution([
              { name: 'Occupied', value: stRes.data.occupied_beds, color: '#f43f5e' },
              { name: 'Available', value: stRes.data.available_beds, color: '#10b981' },
              { name: 'Cleaning', value: stRes.data.cleaning_beds, color: '#f59e0b' },
              { name: 'Maintenance', value: stRes.data.maintenance_beds, color: '#64748b' }
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  const filteredDiagnostics = useMemo(() => {
    if (selectedCategory === 'ALL') return diagnostics;
    return diagnostics.filter(d => d.category === selectedCategory);
  }, [diagnostics, selectedCategory]);

  const filteredServices = useMemo(() => {
    if (selectedDept === 'ALL') return services;
    return services.filter(s => s.department_name === selectedDept);
  }, [services, selectedDept]);

  const categories = useMemo(() => {
    const set = new Set(diagnostics.map(d => d.category));
    return ['ALL', ...Array.from(set)];
  }, [diagnostics]);

  const deptNames = useMemo(() => {
    const set = new Set(departments.map(d => d.department_name));
    return ['ALL', ...Array.from(set)];
  }, [departments]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Processing Operational Analytics Datasets...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Operational Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Multivariate capacity utilization, clinical diagnostic volume, and service workloads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Departmental Capacity & Patient Load</h2>
              <p className="text-xs text-slate-500 mt-0.5">Total registered beds versus currently admitted patient population</p>
            </div>
            <Bed size={16} className="text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department_code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total_beds" fill="#94a3b8" name="Total Beds" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="occupied_beds" fill="#3b82f6" name="Occupied Beds" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Accommodation Tier Utilization</h2>
              <p className="text-xs text-slate-500 mt-0.5">Utilization efficiency by room specification category</p>
            </div>
            <Layers size={16} className="text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomTypes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="room_type_name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Utilization']}
                />
                <Bar dataKey="utilization_rate" fill="#8b5cf6" name="Utilization Rate" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Global Resource Status</h2>
          <p className="text-xs text-slate-500 mb-4">Institutional infrastructure distribution</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Clinical Diagnostic Volume</h2>
              <p className="text-xs text-slate-500 mt-0.5">Admitted diagnosis distribution by disease classification</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDiagnostics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="diagnosis_name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total_cases" fill="#0284c7" name="Total Admissions" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Treatment & Clinical Service Workloads</h2>
            <p className="text-xs text-slate-500 mt-0.5">Execution volume and cumulative throughput by procedure</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
            >
              {deptNames.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredServices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="service_name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="demand_count" fill="#0d9488" name="Procedures Rendered" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}