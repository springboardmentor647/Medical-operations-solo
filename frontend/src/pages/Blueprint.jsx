import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Blueprint() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/rooms/${floorId}`)
      .then(res => setRooms(res.data));
  }, [floorId]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <button onClick={() => navigate('/floors')} className="flex items-center text-slate-700 mb-6 font-bold hover:text-blue-600">
        <ArrowLeft className="mr-2"/> Back to Floors
      </button>
      
      {['Basic', 'Elite', 'Premium'].map(type => (
        <div key={type} className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-300 pb-2">{type} Rooms</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {rooms.filter(r => r.room_type === type).map((room) => (
              <div key={room.room_id} className={`p-4 rounded-xl border text-white ${room.status === 'Occupied' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                <span className="font-bold text-lg">Rm {room.room_number}</span>
                <p className="text-[10px] font-semibold">{room.status}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}