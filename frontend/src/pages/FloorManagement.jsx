import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Bed, Sparkles, AlertCircle, Wrench } from 'lucide-react';

export default function FloorManagement() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadFloorData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/floors/summary');
        if (isMounted) setFloors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFloorData();
    return () => { isMounted = false; };
  }, []);

  const definitions = [
    { type: 'Basic', size: 'Standard', meals: 'Standard Dietary Plan', amenities: 'AC, TV, Wi-Fi, Attached Bathroom', guest: 'No', visitor: 'No', comfort: 'Standard Medical Grade' },
    { type: 'Elite', size: 'Large', meals: 'Enhanced Nutrition Choices', amenities: 'AC, Smart TV, High-speed Wi-Fi, Refrigerator, Ergonomic Recliner', guest: 'No', visitor: 'No', comfort: 'High Comfort / Reduced Noise' },
    { type: 'Premium', size: 'Largest', meals: 'Custom Gourmet Room Service', amenities: 'AC, Smart TV, Dedicated Wi-Fi, Refrigerator, Mini Lounge, En-suite Bathroom', guest: 'Yes', visitor: 'Yes', comfort: 'Highest / Private Suite' }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Retrieving Floor and Infrastructure Metrics...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Floor & Bed Infrastructure</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Multi-level facility layout, operational status distribution, and room type definitions</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Hospital Level Hierarchy</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{floors.length} Operational Floors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Floor Level</th>
                <th className="px-6 py-3.5">Total Bed Capacity</th>
                <th className="px-6 py-3.5">Occupied</th>
                <th className="px-6 py-3.5">Available</th>
                <th className="px-6 py-3.5">Cleaning Hold</th>
                <th className="px-6 py-3.5">Maintenance</th>
                <th className="px-6 py-3.5">Occupancy Rate</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {floors.map((f) => (
                <tr key={f.floor} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-6 w-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                      L{f.floor}
                    </span>
                    <span>Floor Level {f.floor}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{f.total_beds} Beds</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                      <Bed size={12} /> {f.occupied_beds}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Sparkles size={12} /> {f.available_beds}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      <AlertCircle size={12} /> {f.cleaning_beds}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <Wrench size={12} /> {f.maintenance_beds}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${f.occupancy_rate > 85 ? 'bg-rose-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min(f.occupancy_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{f.occupancy_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/floor/${f.floor}`)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all duration-150"
                    >
                      <span>Interactive Blueprint</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Room Type Master & Standard Specifications</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Predefined architectural tiers, amenities allocation, and base tariffs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Category Tier</th>
                <th className="px-6 py-3.5">Dimensions</th>
                <th className="px-6 py-3.5">Dietary / Meals</th>
                <th className="px-6 py-3.5">Amenities Specification</th>
                <th className="px-6 py-3.5">Guest Accompaniment</th>
                <th className="px-6 py-3.5">Visitor Bed Included</th>
                <th className="px-6 py-3.5">Privacy Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {definitions.map((d) => (
                <tr key={d.type} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      d.type === 'Premium' ? 'bg-purple-100 text-purple-800' :
                      d.type === 'Elite' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{d.size}</td>
                  <td className="px-6 py-4">{d.meals}</td>
                  <td className="px-6 py-4 text-slate-500 text-[11px] max-w-xs">{d.amenities}</td>
                  <td className="px-6 py-4 font-semibold">{d.guest}</td>
                  <td className="px-6 py-4 font-semibold">{d.visitor}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{d.comfort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}