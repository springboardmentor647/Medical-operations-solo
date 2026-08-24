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
        if (isMounted) {
          setMetadata(res.data);
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
      if (key === 'department' && value !== 'ALL') {
        const deptObj = metadata.departments.find(d => d.department_name === value);
        if (deptObj) {
          const docInDept = metadata.doctors.some(doc => doc.department_id === deptObj.department_id && doc.doctor_name === prev.doctor);
          if (!docInDept) {
            updated.doctor = 'ALL';
          }
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

  const availableDoctors = filters.department === 'ALL'
    ? metadata.doctors
    : metadata.doctors.filter(d => {
        const deptObj = metadata.departments.find(dept => dept.department_name === filters.department);
        return deptObj ? d.department_id === deptObj.department_id : true;
      });

  const availableDiagnoses = filters.diagnosisCategory === 'ALL'
    ? metadata.diagnoses
    : metadata.diagnoses.filter(d => d.category === filters.diagnosisCategory);

  const diagnosisCategories = Array.from(new Set(metadata.diagnoses.map(d => d.category)));

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