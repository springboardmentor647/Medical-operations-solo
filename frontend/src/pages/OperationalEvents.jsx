import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OperationalEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/events/')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Operational Event Log</h1>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800">
            {events.map((e) => (
              <tr key={e.event_id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">{e.event_type}</td>
                <td className="px-6 py-4">{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}