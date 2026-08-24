import { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function GlobalFilterBar() {
  const { 
    filters, 
    metadata, 
    availableDoctors, 
    availableDiagnoses, 
    diagnosisCategories, 
    updateFilter, 
    applyFilters, 
    resetFilters 
  } = useHospital();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs mb-6 select-none">
      <div className="max-w-[1600px] mx-auto px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Filter size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Global Analytical Filter Engine</h2>
            <p className="text-[11px] text-slate-500 font-medium">Multi-dimensional operational slicing and interactive state filtering</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all duration-150 cursor-pointer"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isOpen ? 'Collapse Panel' : 'Expand Panel'}</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-[1600px] mx-auto px-8 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Date Horizon</label>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="ALL">All Time Horizon</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Clinical Department</label>
            <select
              value={filters.department}
              onChange={(e) => updateFilter('department', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Departments</option>
              {metadata.departments.map(d => (
                <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Floor Level</label>
            <select
              value={filters.floor}
              onChange={(e) => updateFilter('floor', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Floors</option>
              {metadata.floors.map(f => (
                <option key={f} value={f}>Floor Level {f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Accommodation Tier</label>
            <select
              value={filters.roomType}
              onChange={(e) => updateFilter('roomType', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Room Specs</option>
              {metadata.room_types.map(rt => (
                <option key={rt.room_type_id} value={rt.room_type_name}>{rt.room_type_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Admission Type</label>
            <select
              value={filters.admissionType}
              onChange={(e) => updateFilter('admissionType', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Admission Types</option>
              {metadata.admission_types.map(at => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Diagnosis Category</label>
            <select
              value={filters.diagnosisCategory}
              onChange={(e) => updateFilter('diagnosisCategory', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Categories</option>
              {diagnosisCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Specific Diagnosis</label>
            <select
              value={filters.diagnosis}
              onChange={(e) => updateFilter('diagnosis', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Diagnoses</option>
              {availableDiagnoses.map(dg => (
                <option key={dg.diagnosis_id} value={dg.diagnosis_name}>{dg.diagnosis_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Severity Rating</label>
            <select
              value={filters.severity}
              onChange={(e) => updateFilter('severity', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Severities</option>
              {metadata.severities.map(sev => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Attending Physician</label>
            <select
              value={filters.doctor}
              onChange={(e) => updateFilter('doctor', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Doctors</option>
              {availableDoctors.map(doc => (
                <option key={doc.doctor_id} value={doc.doctor_name}>{doc.doctor_name} ({doc.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">State Demographics</label>
            <select
              value={filters.state}
              onChange={(e) => updateFilter('state', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Indian States</option>
              {metadata.states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Patient Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => updateFilter('gender', e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}