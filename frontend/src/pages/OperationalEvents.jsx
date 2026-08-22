import { useEffect, useState } from 'react';
import axios from 'axios';
import { History, Filter, Clock, Tag, FileText } from 'lucide-react';

export default function OperationalEvents() {
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = selectedType === 'ALL' 
          ? 'http://127.0.0.1:8000/api/events?limit=150'
          : `http://127.0.0.1:8000/api/events?event_type=${selectedType}&limit=150`;
        const res = await axios.get(url);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedType]);

  const eventTypes = [
    'ALL',
    'ADMISSION',
    'DISCHARGE',
    'PATIENT_TRANSFER',
    'BED_STATUS_CHANGE'
  ];

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'ADMISSION': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISCHARGE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PATIENT_TRANSFER': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BED_STATUS_CHANGE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Operational Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Immutable chronological ledger of business transitions, movement events, and status updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 shadow-xs outline-none"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Event Categories' : t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Records</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{events.length} Recorded Transactions</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            Querying Relational Transaction Log...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Entity Reference</th>
                  <th className="px-6 py-3.5">Operation Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {events.map((ev) => (
                  <tr key={ev.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                      #{ev.event_id.toString().padStart(5, '0')}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(ev.event_type)}`}>
                        <Tag size={10} />
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {ev.entity_name} ({ev.entity_id})
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-md">
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{ev.description}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}