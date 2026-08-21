import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

export default function Blueprint() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const [beds, setBeds] = useState([]);
  useEffect(() => { axios.get(`http://127.0.0.1:8000/rooms/${floorId}`).then(res => setBeds(res.data)); }, [floorId]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <button onClick={() => navigate('/floors')} className="flex items-center text-slate-700 mb-6 font-bold"><ArrowLeft className="mr-2"/> Back</button>
      {['Basic', 'Elite', 'Premium'].map(type => (
        <div key={type} className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6 border-b pb-2">{type} Rooms</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {beds.filter(r => r.room_type === type).map((bed) => (
              <div key={bed.bed_id} className={`p-4 rounded-xl border text-white ${bed.status === 'Occupied' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                <div className="flex justify-between"><span className="font-bold">Rm {bed.room_number}</span><Info size={14} /></div>
                <p className="text-[10px] font-semibold">{bed.status}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}