import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bed, 
  Info, 
  X, 
  User 
} from 'lucide-react';

export default function Blueprint() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
    const fetchBlueprintData = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/floors/${floorId}/blueprint`);
        if (isSubscribed) {
          setBeds(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchBlueprintData();

    return () => {
      isSubscribed = false;
    };
  }, [floorId, refreshTrigger]);

  const handleStatusChange = async (bedId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.post(`http://127.0.0.1:8000/api/operations/beds/${bedId}/status?status=${newStatus}`);
      setRefreshTrigger(prev => prev + 1);
      if (selectedBed && selectedBed.bed_id === bedId) {
        setSelectedBed(prev => ({ ...prev, bed_status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDischarge = async (admissionId) => {
    if (!admissionId) return;
    setActionLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/operations/discharge', {
        admission_id: admissionId,
        discharge_type: "Routine Clinical Discharge",
        discharge_summary: "Clinical parameters stabilized; home recovery approved."
      });
      setRefreshTrigger(prev => prev + 1);
      setSelectedBed(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const tiers = ['Basic', 'Elite', 'Premium'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied':
        return 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-300';
      case 'Available':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-300';
      case 'Cleaning':
        return 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-300';
      case 'Maintenance':
        return 'bg-slate-100 border-slate-300 text-slate-900 hover:border-slate-400';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Occupied': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Available': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cleaning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Maintenance': return 'bg-slate-200 text-slate-800 border-slate-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        Compiling Interactive Floor Level {floorId} Topology...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/floors')}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Floor Level {floorId} Architectural Topology</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Individual Room & Bed Allocation Hierarchy by Specification Tier</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span> Occupied
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Cleaning
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-500"></span> Maintenance
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {tiers.map((tier) => {
          const tierBeds = beds.filter((b) => b.room_type_name === tier);
          if (tierBeds.length === 0) return null;

          return (
            <div key={tier} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{tier} Category Accommodations</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
                    {tierBeds.length} Registered Beds
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {tierBeds.map((bed) => (
                  <div
                    key={bed.bed_id}
                    onClick={() => setSelectedBed(bed)}
                    className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-150 relative ${getStatusColor(
                      bed.bed_status
                    )} ${selectedBed?.bed_id === bed.bed_id ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Room {bed.room_number}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Bed size={15} />
                          <span className="text-sm font-extrabold tracking-tight">Bed {bed.bed_number}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(bed.bed_status)}`}>
                        {bed.bed_status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 truncate max-w-[90px]">
                        {bed.patient_name || 'Unassigned'}
                      </span>
                      <Info size={13} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedBed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Level {selectedBed.floor} • Room {selectedBed.room_number}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Bed {selectedBed.bed_number} ({selectedBed.room_type_name} Tier)
                </h3>
              </div>
              <button
                onClick={() => setSelectedBed(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Department Assignment</span>
                  <span className="font-bold text-slate-900">{selectedBed.department_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Daily Tariff Rate</span>
                  <span className="font-bold text-slate-900">₹{selectedBed.base_tariff.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Visitor Bed Capability</span>
                  <span className="font-bold text-slate-900">{selectedBed.visitor_bed_available ? 'Equipped' : 'Not Available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Privacy Profile</span>
                  <span className="font-bold text-slate-900">{selectedBed.comfort_privacy}</span>
                </div>
              </div>

              {selectedBed.bed_status === 'Occupied' && selectedBed.patient_name ? (
                <div className="border border-rose-100 bg-rose-50/40 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <User size={16} />
                    <span>{selectedBed.patient_name} ({selectedBed.gender}, {selectedBed.age} yrs)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-rose-100/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Identifier</span>
                      <span className="font-semibold text-slate-800 font-mono">{selectedBed.patient_id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Admitted Diagnosis</span>
                      <span className="font-semibold text-slate-800">{selectedBed.diagnosis_name || 'Under Evaluation'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Attending Consultant</span>
                      <span className="font-semibold text-slate-800">{selectedBed.doctor_name || 'Staff On-Duty'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Discharge</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBed.expected_discharge_date ? new Date(selectedBed.expected_discharge_date).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No patient currently assigned to this bed infrastructure.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2 justify-end">
              {selectedBed.bed_status === 'Occupied' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleDischarge(selectedBed.admission_id)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Execute Patient Discharge
                </button>
              )}
              {selectedBed.bed_status === 'Cleaning' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedBed.bed_id, 'Available')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Approve Cleanliness & Set Available
                </button>
              )}
              {selectedBed.bed_status === 'Available' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBed.bed_id, 'Cleaning')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Flag For Sanitization
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedBed.bed_id, 'Maintenance')}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Set Maintenance Hold
                  </button>
                </>
              )}
              {selectedBed.bed_status === 'Maintenance' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedBed.bed_id, 'Cleaning')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Clear Maintenance to Cleaning
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}