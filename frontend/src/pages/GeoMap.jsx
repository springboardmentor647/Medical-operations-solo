import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function GeoMap() {
  const [data, setData] = useState([]);

  const stateCoords = {
    'Maharashtra': [19.7515, 75.7139], 'Karnataka': [15.3173, 75.7139],
    'Tamil Nadu': [11.1271, 78.6569], 'Delhi': [28.7041, 77.1025],
    'West Bengal': [22.9868, 87.8550], 'Rajasthan': [27.0238, 74.2179],
    'Gujarat': [22.2587, 71.1924], 'Uttar Pradesh': [26.8467, 80.9462]
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/analytics/geo').then(res => setData(res.data));
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Patient Geographic Distribution</h1>
      <div className="h-[600px] w-full rounded-2xl overflow-hidden border shadow-lg">
        <MapContainer center={[22.5937, 78.9629]} zoom={5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data.map((d, i) => (
            <Marker key={i} position={stateCoords[d.state] || [20.59, 78.96]}>
              <Popup>
                <div className="font-bold">{d.state}</div>
                <div>{d.count} Patients</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}