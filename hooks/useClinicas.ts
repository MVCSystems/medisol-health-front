import { useState, useEffect } from 'react';
import { clinicaService } from '@/services/clinica.service';
import type { Clinica, CreateClinicaData, UpdateClinicaData, ClinicaFilters, PaginatedResponse } from '@/types/clinicas';

export const useClinicas = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchClinicas = async (filters?: ClinicaFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedResponse<Clinica> = await clinicaService.getAll();
      setClinicas(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar las clínicas');
    } finally {
      setLoading(false);
    }
  };

  const createClinica = async (data: CreateClinicaData): Promise<Clinica | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newClinica = await clinicaService.create(data);
      setClinicas(prev => [...prev, newClinica]);
      setTotalCount(prev => prev + 1);
      return newClinica;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear la clínica');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClinica = async (id: number, data: UpdateClinicaData): Promise<Clinica | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedClinica = await clinicaService.update(id, data);
      setClinicas(prev => 
        prev.map(clinica => clinica.id === id ? updatedClinica : clinica)
      );
      return updatedClinica;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar la clínica');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteClinica = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await clinicaService.delete(id);
      setClinicas(prev => prev.filter(clinica => clinica.id !== id));
      setTotalCount(prev => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar la clínica');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getClinicaById = async (id: number): Promise<Clinica | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const clinica = await clinicaService.getById(id);
      return clinica;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al obtener la clínica');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicas();
  }, []);

  return {
    clinicas,
    loading,
    error,
    totalCount,
    fetchClinicas,
    createClinica,
    updateClinica,
    deleteClinica,
    getClinicaById,
  };
};