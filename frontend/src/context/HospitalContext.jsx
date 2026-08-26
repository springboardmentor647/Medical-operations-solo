/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const initialFilters = {
    dateRange: '30D',
    department: 'ALL',
    floor: 'ALL',
    roomType: 'ALL',
    admissionType: 'ALL',
    diagnosisCategory: 'ALL',
    severity: 'ALL',
    doctor: 'ALL',
    state: 'ALL',
    gender: 'ALL'
  };

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [metadata, setMetadata] = useState({
    departments: [],
    doctors: [],
    room_types: [],
    diagnoses: [],
    states: [],
    floors: [1, 2, 3, 4, 5],
    admission_types: ['Urgent', 'Emergency', 'Elective'],
    severities: ['Mild', 'Moderate', 'Severe', 'Critical'],
    shifts: ['Morning', 'Evening', 'Night']
  });

  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/filters/metadata');
        if (isMounted && res.data) {
          setMetadata({
            departments: res.data.departments || [],
            doctors: res.data.doctors || [],
            room_types: res.data.room_types || [],
            diagnoses: res.data.diagnoses || [],
            states: res.data.states || [],
            floors: res.data.floors || [1, 2, 3, 4, 5],
            admission_types: res.data.admission_types || ['Urgent', 'Emergency', 'Elective'],
            severities: res.data.severities || ['Mild', 'Moderate', 'Severe', 'Critical'],
            shifts: res.data.shifts || ['Morning', 'Evening', 'Night']
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
    return () => { isMounted = false; };
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };

      if (key === 'department') {
        if (value !== 'ALL' && metadata.departments && metadata.departments.length > 0) {
          const deptObj = metadata.departments.find(d => d && d.department_name === value);
          if (deptObj && deptObj.floor !== undefined) {
            updated.floor = deptObj.floor.toString();
          }
          if (metadata.doctors && metadata.doctors.length > 0 && deptObj) {
            const docInDept = metadata.doctors.some(doc => doc && doc.department_id === deptObj.department_id && doc.doctor_name === prev.doctor);
            if (!docInDept) {
              updated.doctor = 'ALL';
            }
          }
        } else if (value === 'ALL') {
          updated.floor = 'ALL';
          updated.doctor = 'ALL';
        }
      }

      if (key === 'floor') {
        if (value !== 'ALL' && metadata.departments && metadata.departments.length > 0) {
          const floorNum = parseInt(value, 10);
          const deptObj = metadata.departments.find(d => d && d.floor === floorNum);
          if (deptObj) {
            updated.department = deptObj.department_name;
          }
        } else if (value === 'ALL') {
          updated.department = 'ALL';
        }
      }

      return updated;
    });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const availableDoctors = (!filters.department || filters.department === 'ALL' || !metadata.departments)
    ? (metadata.doctors || [])
    : (metadata.doctors || []).filter(d => {
        const deptObj = metadata.departments.find(dept => dept && dept.department_name === filters.department);
        return deptObj ? d.department_id === deptObj.department_id : true;
      });

  const availableDiagnoses = (!filters.diagnosisCategory || filters.diagnosisCategory === 'ALL' || !metadata.diagnoses)
    ? (metadata.diagnoses || [])
    : (metadata.diagnoses || []).filter(d => d && d.category === filters.diagnosisCategory);

  const diagnosisCategories = Array.from(new Set((metadata.diagnoses || []).map(d => d.category)));

  return (
    <HospitalContext.Provider value={{
      filters,
      appliedFilters,
      metadata,
      availableDoctors,
      availableDiagnoses,
      diagnosisCategories,
      updateFilter,
      applyFilters,
      resetFilters
    }}>
      {children}
    </HospitalContext.Provider>
  );
}

export const useHospital = () => useContext(HospitalContext);