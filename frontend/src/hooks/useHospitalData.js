import { useContext } from 'react';
import { HospitalContext } from '../context/HospitalContext';

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}