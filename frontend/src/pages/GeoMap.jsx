import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users } from 'lucide-react';

export default function GeoMap() {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const stateCoords = {
    'Maharashtra': [19.7515, 75.7139],
    'Karnataka': [15.3173, 75.7139],
    'Tamil Nadu': [11.1271, 78.6569],
    'Gujarat': [22.2587, 71.1924],
    'Delhi': [28.7041, 77.1025],
    'West Bengal': [22.9868, 87.8550],
    'Rajasthan': [27.0238, 74.2179],
    'Uttar Pradesh': [26.8467, 80.9462]
  };

  useEffect(() => {
    let isMounted = true;
    const fetchGeo = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/geographic/distribution');
        if (isMounted) setGeoData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGeo();
    return () => { isMounted = false; };
  }, []);

  const totalRegisteredPatients = geoData.reduce((acc, curr) => acc + curr.total_patients, 0);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Compiling Regional Geographic Datasets...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Geographic Patient Demographics</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">State-level patient origin volume, intake density, and regional distribution</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <Users size={14} className="text-blue-600" />
          <span>Total Mapped Registry: <strong className="text-slate-900">{totalRegisteredPatients} Patients</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs h-[600px] flex flex-col">
          <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Catchment Radius Topology</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">OpenStreetMap Integration</span>
          </div>

          <div className="flex-1 w-full rounded-lg overflow-hidden border border-slate-100">
            <MapContainer center={[22.5937, 78.9629]} zoom={4.8} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoData.map((d, i) => {
                const coords = stateCoords[d.state] || [20.5937, 78.9629];
                const radius = Math.max(12, Math.min(d.total_patients / 3.5, 35));
                return (
                  <CircleMarker
                    key={i}
                    center={coords}
                    radius={radius}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.55,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1 text-xs">
                        <h4 className="font-bold text-slate-900 text-sm border-b pb-1">{d.state}</h4>
                        <div className="flex justify-between gap-4 text-slate-600 pt-1">
                          <span>Total Patients:</span>
                          <strong className="text-slate-900">{d.total_patients}</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600">
                          <span>Admissions Recorded:</span>
                          <strong className="text-blue-600">{d.total_admissions}</strong>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Regional Inflow Rankings</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Patients sorted by state concentration</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {geoData.map((st, idx) => (
              <div key={st.state} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-slate-400 font-mono text-[11px]">{idx + 1}</span>
                  <div>
                    <h3 className="font-bold text-slate-800">{st.state}</h3>
                    <span className="text-[11px] text-slate-500">{st.total_admissions} Institutional Episodes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{st.total_patients}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Patients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}