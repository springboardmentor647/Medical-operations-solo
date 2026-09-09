import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHospital } from '../context/HospitalContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { IndianRupee, Bed, Stethoscope, Users, TrendingUp, Layers, Activity } from 'lucide-react';

export default function Turnover() {
  const { appliedFilters } = useHospital();
  const [data, setData] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatINR = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTurnoverData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          department: appliedFilters.department || 'ALL',
          floor: appliedFilters.floor || 'ALL',
          room_type: appliedFilters.roomType || 'ALL',
          admission_type: appliedFilters.admissionType || 'ALL',
          diagnosis_category: appliedFilters.diagnosisCategory || 'ALL',
          diagnosis: appliedFilters.diagnosis || 'ALL',
          severity: appliedFilters.severity || 'ALL',
          doctor: appliedFilters.doctor || 'ALL',
          state: appliedFilters.state || 'ALL',
          gender: appliedFilters.gender || 'ALL',
          date_range: appliedFilters.dateRange || '30D'
        }).toString();

        const [turnRes, rtRes, svRes, dgRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/analytics/turnover?${queryParams}`),
          axios.get(`http://127.0.0.1:8000/api/room-types/analytics?${queryParams}`),
          axios.get(`http://127.0.0.1:8000/api/analytics/services?${queryParams}`),
          axios.get(`http://127.0.0.1:8000/api/analytics/diagnostics?${queryParams}`)
        ]);

        if (isMounted) {
          setData(turnRes.data);
          setRoomTypes(rtRes.data);
          setServices(svRes.data);
          setDiagnostics(dgRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTurnoverData();

    return () => {
      isMounted = false;
    };
  }, [appliedFilters]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Compiling Institutional Revenue & Turnover Analytics...
      </div>
    );
  }

  const kpis = [
    { label: "Gross Turnover", val: `₹${formatINR(data.gross_turnover)}`, sub: "Accommodation + Clinical Services", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Accommodation Revenue", val: `₹${formatINR(data.accommodation_revenue)}`, sub: "Bed Tariff Billed", icon: Bed, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Procedure & Service Yield", val: `₹${formatINR(data.procedure_revenue)}`, sub: `${data.total_procedures} Clinical Interventions`, icon: Stethoscope, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Average Revenue / Patient", val: `₹${formatINR(data.average_revenue_per_patient)}`, sub: `Across ${data.total_admissions} Filtered Episodes`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" }
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Turnover & Revenue Analytics</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Billed inpatient accommodation tariffs, clinical intervention yield, and department financial throughput</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <TrendingUp size={14} className="text-emerald-600" />
          <span>Operational Financial Engine Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</span>
              <div className={`p-2 rounded-lg ${k.bg}`}>
                <k.icon size={16} className={k.color} />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{k.val}</h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">30-Day Procedure Revenue Run-rate</h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily clinical procedure and diagnostic service billing timeline</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`₹${formatINR(val)}`, 'Daily Billed Revenue']}
                />
                <Area type="monotone" dataKey="daily_revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Departmental Revenue Share</h2>
              <p className="text-xs text-slate-500 mt-0.5">Gross turnover generated per clinical unit</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_revenue_breakdown} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#0f172a" fontSize={10} fontWeight={600} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="department_name" type="category" stroke="#0f172a" fontSize={10} fontWeight={600} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`₹${formatINR(value)}`, 'Billed Revenue']}
                />
                <Bar dataKey="department_revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Room Tier Tariff Rate Specifications</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{roomTypes.length} Active Categories</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Accommodation Tier</th>
                  <th className="px-6 py-3.5">Dimensions Profile</th>
                  <th className="px-6 py-3.5">Standard Base Tariff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {roomTypes.map((rt) => (
                  <tr key={rt.room_type_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{rt.room_type_name}</td>
                    <td className="px-6 py-4 text-slate-600">{rt.room_size}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-sm">₹{formatINR(rt.base_tariff)} / Day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clinical Procedure Catalog & Tariffs</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{services.length} Listed Interventions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Procedure Description</th>
                  <th className="px-6 py-3.5">Clinical Department</th>
                  <th className="px-6 py-3.5 text-right">Standard Fee / Procedure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {services.map((sv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{sv.service_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{sv.department_name}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600 text-right text-sm">₹{formatINR(sv.total_revenue / (sv.demand_count || 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-rose-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Diagnostic Disease Classification & Intake Volumes</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{diagnostics.length} Tracked Diagnoses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Clinical Diagnosis</th>
                  <th className="px-6 py-3.5">Disease Category</th>
                  <th className="px-6 py-3.5 text-right">Total Admitted Inpatients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {diagnostics.map((dg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{dg.diagnosis_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{dg.category}</td>
                    <td className="px-6 py-4 font-bold text-rose-600 text-right text-sm">{dg.total_cases} Cases</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}