import { useState, useEffect } from 'react';
import { especialidadService } from '@/services/especialidad.service';
import type { Especialidad, CreateEspecialidadData, UpdateEspecialidadData, EspecialidadFilters, PaginatedResponse } from '@/types/clinicas';

export const useEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEspecialidades = async (filters?: EspecialidadFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedResponse<Especialidad> = await especialidadService.getAll();
      setEspecialidades(response.results);
      setTotalCount(response.count);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las especialidades';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createEspecialidad = async (data: CreateEspecialidadData): Promise<Especialidad | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newEspecialidad = await especialidadService.create(data);
      setEspecialidades(prev => [...prev, newEspecialidad]);
      setTotalCount(prev => prev + 1);
      return newEspecialidad;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la especialidad';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEspecialidad = async (id: number, data: UpdateEspecialidadData): Promise<Especialidad | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedEspecialidad = await especialidadService.update(id, data);
      setEspecialidades(prev => 
        prev.map(especialidad => especialidad.id === id ? updatedEspecialidad : especialidad)
      );
      return updatedEspecialidad;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la especialidad';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEspecialidad = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await especialidadService.delete(id);
      setEspecialidades(prev => prev.filter(especialidad => especialidad.id !== id));
      setTotalCount(prev => prev - 1);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la especialidad';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEspecialidadById = async (id: number): Promise<Especialidad | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const especialidad = await especialidadService.getById(id);
      return especialidad;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la especialidad';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  return {
    especialidades,
    loading,
    error,
    totalCount,
    fetchEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
    getEspecialidadById,
  };
};