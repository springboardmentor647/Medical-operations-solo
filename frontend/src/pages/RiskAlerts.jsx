import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/risks/alerts');
        setAlerts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />;
      case 'INFO':
        return <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />;
      default:
        return <AlertCircle size={18} className="text-slate-600 shrink-0 mt-0.5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Running Clinical Operational Safety Checks...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Risk & Anomaly Alerts</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Automated threshold violations, capacity bottlenecks, and delayed patient transitions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-rose-600" />
            <span>Active Threshold Violations: <strong className="text-slate-900">{alerts.length}</strong></span>
          </span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">All Operations Operating Within Normal Tolerance</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No capacity pressures, discharge delays, or housekeeping turnover backlogs identified across any floor level.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((al, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex items-start gap-4 hover:border-slate-300 transition-colors">
              {getSeverityIcon(al.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(al.severity)}`}>
                    {al.severity}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {al.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    • {al.entity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {al.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}