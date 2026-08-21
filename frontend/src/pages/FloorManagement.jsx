import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FloorManagement() {
  const [floors, setFloors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/analytics/floor-summary')
      .then(res => setFloors(res.data))
      .catch(err => console.error(err));
  }, []);

  const roomTypes = [
    { type: 'Basic', size: 'Standard', meals: 'Standard', amenities: 'AC, TV, Wi-Fi, Bathroom', guest: 'No', visitor: 'No', comfort: 'Standard' },
    { type: 'Elite', size: 'Large', meals: 'Enhanced', amenities: 'AC, Smart TV, Wi-Fi, Refrigerator', guest: 'No', visitor: 'No', comfort: 'High' },
    { type: 'Premium', size: 'Largest', meals: 'Premium', amenities: 'AC, Smart TV, Wi-Fi, Mini Lounge', guest: 'Yes', visitor: 'Yes', comfort: 'Highest' }
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Floor Management</h1>
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
            <tr><th className="px-6 py-4">Floor</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Occupied</th><th className="px-6 py-4">Available</th><th className="px-6 py-4">Action</th></tr>
          </thead>
          <tbody className="divide-y text-slate-800">
            {floors.map((f) => (
              <tr key={f.floor}>
                <td className="px-6 py-4 font-bold">Floor {f.floor}</td>
                <td className="px-6 py-4">{f.total}</td>
                <td className="px-6 py-4 text-red-600">{f.occupied}</td>
                <td className="px-6 py-4 text-emerald-600">{f.available}</td>
                <td className="px-6 py-4"><button onClick={() => navigate(`/floor/${f.floor}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-900">Room Type Definitions</h3>
        <table className="w-full text-left text-sm"><thead className="text-slate-500 uppercase text-xs border-b"><tr><th className="py-3">Type</th><th className="py-3">Size</th><th className="py-3">Meals</th><th className="py-3">Amenities</th><th className="py-3">Guest Accomm.</th><th className="py-3">Visitor Bed</th><th className="py-3">Comfort / Privacy</th></tr></thead><tbody className="divide-y text-slate-800">{roomTypes.map(d => (<tr key={d.type}><td className="py-4 font-bold">{d.type}</td><td className="py-4">{d.size}</td><td className="py-4">{d.meals}</td><td className="py-4 text-xs">{d.amenities}</td><td className="py-4">{d.guest}</td><td className="py-4">{d.visitor}</td><td className="py-4">{d.comfort}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}