import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHospital } from '../context/HospitalContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Bed, Layers, Stethoscope, Briefcase } from 'lucide-react';

export default function Analytics() {
  const { appliedFilters } = useHospital();

  const [departments, setDepartments] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [services, setServices] = useState([]);
  const [trends, setTrends] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [los, setLos] = useState(null);
  const [delays, setDelays] = useState([]);
  const [turnover, setTurnover] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [workforceRatios, setWorkforceRatios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchAnalytics = async () => {
      try {
        const [dpRes, rtRes, dgRes, svRes, trRes, fnRes, loRes, dlRes, toRes, docRes, wfRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/departments/metrics'),
          axios.get('http://127.0.0.1:8000/api/room-types/analytics'),
          axios.get(`http://127.0.0.1:8000/api/analytics/diagnostics?category=${appliedFilters.diagnosisCategory}`),
          axios.get(`http://127.0.0.1:8000/api/analytics/services?department_name=${appliedFilters.department}`),
          axios.get('http://127.0.0.1:8000/api/trends/patient-flow'),
          axios.get('http://127.0.0.1:8000/api/analytics/flow-funnel'),
          axios.get('http://127.0.0.1:8000/api/analytics/los'),
          axios.get('http://127.0.0.1:8000/api/analytics/discharge-delays'),
          axios.get('http://127.0.0.1:8000/api/analytics/bed-turnover'),
          axios.get('http://127.0.0.1:8000/api/analytics/doctors'),
          axios.get('http://127.0.0.1:8000/api/analytics/workforce-ratios')
        ]);

        if (isSubscribed) {
          setDepartments(dpRes.data);
          setRoomTypes(rtRes.data);
          setDiagnostics(dgRes.data);
          setServices(svRes.data);
          setTrends(trRes.data);
          setFunnel(fnRes.data);
          setLos(loRes.data);
          setDelays(dlRes.data);
          setTurnover(toRes.data);
          setDoctors(docRes.data);
          setWorkforceRatios(wfRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isSubscribed = false;
    };
  }, [appliedFilters]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Processing Multivariate Intelligence Datasets...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Operational Intelligence Hub</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Advanced patient flow, length of stay, discharge delays, bed turnover, and workforce workload metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Length of Stay</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{los?.overall_avg_los} <span className="text-sm font-medium text-slate-500">Days</span></h2>
          <p className="text-[11px] text-slate-500 mt-1">Institutional Admission Duration</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Maximum Stay Recorded</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{los?.longest_stay_days} <span className="text-sm font-medium text-slate-500">Days</span></h2>
          <p className="text-[11px] text-slate-500 mt-1">Longest active/historical stay</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue Discharges</span>
          <h2 className="text-3xl font-bold text-rose-600 mt-2">{los?.overdue_discharge_patients}</h2>
          <p className="text-[11px] text-slate-500 mt-1">Patients exceeding expected LOS</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Patient Change</span>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {trends.reduce((acc, curr) => acc + curr.net_patient_change, 0)}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">30-Day cumulative intake flux</p>
        </div>
      </div>

      {funnel && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Patient Flow Conversion Funnel</h2>
          <p className="text-xs text-slate-500 mb-6">Macro-level transition pipeline from registry intake to official discharge</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{funnel.total_registered}</span>
              <span className="text-[10px] text-blue-600 font-semibold">100% Base</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admitted</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">{funnel.total_admissions}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{Math.round((funnel.total_admissions/funnel.total_registered)*100)}% Conversion</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bed Assigned</span>
              <span className="text-2xl font-bold text-indigo-600 mt-1 block">{funnel.total_bed_assignments}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{Math.round((funnel.total_bed_assignments/funnel.total_registered)*100)}% Placement</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Treated</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">{funnel.total_treatments}</span>
              <span className="text-[10px] text-slate-500 font-semibold">Procedures Executed</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discharged</span>
              <span className="text-2xl font-bold text-slate-700 mt-1 block">{funnel.total_discharges}</span>
              <span className="text-[10px] text-slate-500 font-semibold">Completed Episodes</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Departmental Capacity & Load</h2>
              <p className="text-xs text-slate-500 mt-0.5">Total beds versus active patient admissions</p>
            </div>
            <Bed size={16} className="text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department_code" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="total_beds" fill="#94a3b8" name="Total Beds" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="occupied_beds" fill="#3b82f6" name="Occupied Beds" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Accommodation Tier Utilization</h2>
              <p className="text-xs text-slate-500 mt-0.5">Efficiency percentage by room specification tier</p>
            </div>
            <Layers size={16} className="text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomTypes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="room_type_name" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} formatter={(val) => [`${val}%`, 'Utilization']} />
                <Bar dataKey="utilization_rate" fill="#8b5cf6" name="Utilization Rate" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Discharge Delay Analysis</h2>
          <p className="text-xs text-slate-500 mb-6">Percentage of admissions exceeding expected discharge date</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department_name" stroke="#0f172a" fontSize={10} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} formatter={(val) => [`${val}%`, 'Delay Rate']} />
                <Bar dataKey="delay_rate_percentage" fill="#f43f5e" name="Delay Rate %" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Bed Turnover Efficiency</h2>
          <p className="text-xs text-slate-500 mb-6">Average bed reassignment count per department</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnover} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department_code" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="turnover_count" fill="#10b981" name="Turnover Count" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Attending Physician Performance & Workload</h2>
            <p className="text-xs text-slate-500 mt-0.5">Caseload distribution, active patient load, and procedural throughput by doctor</p>
          </div>
          <Stethoscope size={18} className="text-blue-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Physician Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Specialization</th>
                <th className="px-6 py-3.5">Total Admissions</th>
                <th className="px-6 py-3.5">Active Caseload</th>
                <th className="px-6 py-3.5">Procedures Executed</th>
                <th className="px-6 py-3.5">Avg Patient Stay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {doctors.map((doc) => (
                <tr key={doc.doctor_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{doc.doctor_name}</td>
                  <td className="px-6 py-4">{doc.department_name}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">{doc.specialization}</td>
                  <td className="px-6 py-4">{doc.total_admissions}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                      {doc.active_patients}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{doc.procedures_performed}</td>
                  <td className="px-6 py-4">{doc.avg_patient_stay_days} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Workforce Deployment & Staff-to-Patient Ratios</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active patient load versus nursing and medical personnel allocation</p>
          </div>
          <Briefcase size={18} className="text-indigo-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Active Inpatients</th>
                <th className="px-6 py-3.5">Total Staff Allocated</th>
                <th className="px-6 py-3.5">Nursing Personnel</th>
                <th className="px-6 py-3.5">Active Physicians</th>
                <th className="px-6 py-3.5">Patient-to-Staff Ratio</th>
                <th className="px-6 py-3.5">Patient-to-Doctor Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {workforceRatios.map((wf) => (
                <tr key={wf.department_code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{wf.department_name}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">{wf.active_patients}</td>
                  <td className="px-6 py-4">{wf.total_staff}</td>
                  <td className="px-6 py-4">{wf.nursing_staff}</td>
                  <td className="px-6 py-4">{wf.active_doctors}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{wf.patient_to_staff_ratio} : 1</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{wf.patient_to_doctor_ratio} : 1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Clinical Diagnostic Volume</h2>
          <p className="text-xs text-slate-500 mb-6">Admitted diagnosis distribution by disease classification</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnostics} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis dataKey="diagnosis_name" type="category" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} width={180} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="total_cases" fill="#0284c7" name="Total Admissions" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Treatment & Clinical Service Workloads</h2>
          <p className="text-xs text-slate-500 mb-6">Execution volume and cumulative throughput by procedure</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={services} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis dataKey="service_name" type="category" stroke="#0f172a" fontSize={11} fontWeight={600} tickLine={false} width={220} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="demand_count" fill="#0d9488" name="Procedures Rendered" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}