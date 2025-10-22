import { useState, useEffect } from 'react';
import { doctorService, type DoctorCreateData, type DoctorRegistroResponse } from '@/services/doctor.service';
import type { Doctor } from '@/types/clinicas';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      error?: string;
      [key: string]: unknown;
    };
  };
}

export function useDoctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  // Cargar doctores
  const cargarDoctores = async (mostrarInactivos: boolean = incluirInactivos) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useDoctores.cargarDoctores - mostrarInactivos:', mostrarInactivos);
      const data = await doctorService.getAll(mostrarInactivos);
      console.log('useDoctores.cargarDoctores - doctores recibidos:', data.results.length);
      setDoctores(data.results);
    } catch (err) {
      console.error('useDoctores.cargarDoctores - error:', err);
      setError('Error al cargar la lista de doctores');
      toast.error('Error al cargar doctores');
    } finally {
      setLoading(false);
    }
  };

  // Toggle filtro de inactivos
  const toggleIncluirInactivos = () => {
    const nuevoEstado = !incluirInactivos;
    setIncluirInactivos(nuevoEstado);
    cargarDoctores(nuevoEstado);
  };

  // Registrar nuevo doctor
  const registrarDoctor = async (data: DoctorCreateData): Promise<DoctorRegistroResponse | null> => {
    try {
      setError(null);
      const response = await doctorService.registrar(data);
      toast.success('Doctor registrado exitosamente');
      
      // Recargar la lista
      await cargarDoctores();
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al registrar doctor';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  // Actualizar doctor
  const actualizarDoctor = async (id: number, data: Partial<DoctorCreateData>): Promise<boolean> => {
    try {
      setError(null);
      await doctorService.update(id, data);
      toast.success('Doctor actualizado exitosamente');
      
      // Recargar la lista
      await cargarDoctores();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar doctor:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al actualizar doctor';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Eliminar doctor
  const eliminarDoctor = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await doctorService.delete(id);
      toast.success('Doctor desactivado exitosamente', {
        description: 'El doctor ya no aparecerá en los listados activos'
      });
      
      // Recargar la lista
      await cargarDoctores();
      
      return true;
    } catch (error) {
      console.error('Error al desactivar doctor:', error);
      const apiError = error as ApiError;
      const errorMessage = String(apiError?.response?.data?.detail || 
                          apiError?.response?.data?.error || 
                          'Error al desactivar doctor');
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Obtener doctor por ID
  const obtenerDoctor = async (id: number): Promise<Doctor | null> => {
    try {
      setError(null);
      return await doctorService.getById(id);
    } catch (error) {
      console.error('Error al obtener doctor:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al obtener doctor';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  // Filtrar por clínica
  const obtenerDoctoresPorClinica = async (clinicaId: number): Promise<Doctor[]> => {
    try {
      setError(null);
      return await doctorService.getByClinica(clinicaId);
    } catch (error) {
      console.error('Error al filtrar doctores por clínica:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al filtrar doctores';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  // Filtrar por especialidad
  const obtenerDoctoresPorEspecialidad = async (especialidadId: number): Promise<Doctor[]> => {
    try {
      setError(null);
      return await doctorService.getByEspecialidad(especialidadId);
    } catch (error) {
      console.error('Error al filtrar doctores por especialidad:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al filtrar doctores';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  // Reactivar doctor
  const reactivarDoctor = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await doctorService.reactivar(id);
      toast.success('Doctor reactivado exitosamente', {
        description: 'El doctor y su usuario han sido reactivados'
      });
      
      // Recargar la lista
      await cargarDoctores();
      
      return true;
    } catch (error) {
      console.error('Error al reactivar doctor:', error);
      const apiError = error as ApiError;
      const errorMessage = String(apiError?.response?.data?.detail || 
                          apiError?.response?.data?.error || 
                          'Error al reactivar doctor');
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Cargar doctores al montar el componente
  useEffect(() => {
    cargarDoctores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    doctores,
    loading,
    error,
    incluirInactivos,
    cargarDoctores,
    toggleIncluirInactivos,
    registrarDoctor,
    actualizarDoctor,
    eliminarDoctor,
    reactivarDoctor,
    obtenerDoctor,
    obtenerDoctoresPorClinica,
    obtenerDoctoresPorEspecialidad,
  };
}