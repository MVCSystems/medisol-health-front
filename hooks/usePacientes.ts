import { useState, useEffect } from 'react';
import { pacienteService, type PacienteCreateData, type PacienteRegistroResponse } from '@/services/paciente.service';
import type { Paciente } from '@/types/clinicas';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      error?: string;
      [key: string]: unknown;
    };
  };
}

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  // Cargar pacientes
  const cargarPacientes = async (mostrarInactivos: boolean = incluirInactivos) => {
    try {
      setLoading(true);
      setError(null);
      const data = await pacienteService.getAll(mostrarInactivos);
      setPacientes(data.results);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setError('Error al cargar la lista de pacientes');
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Toggle filtro de inactivos
  const toggleIncluirInactivos = () => {
    const nuevoEstado = !incluirInactivos;
    setIncluirInactivos(nuevoEstado);
    cargarPacientes(nuevoEstado);
  };

  // Registrar nuevo paciente
  const registrarPaciente = async (data: PacienteCreateData): Promise<PacienteRegistroResponse | null> => {
    try {
      setError(null);
      const response = await pacienteService.registrar(data);
      toast.success('Paciente registrado exitosamente');
      
      // Recargar la lista
      await cargarPacientes();
      
      return response;
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al registrar paciente';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  // Actualizar paciente
  const actualizarPaciente = async (id: number, data: Partial<PacienteCreateData>): Promise<boolean> => {
    try {
      setError(null);
      await pacienteService.update(id, data);
      toast.success('Paciente actualizado exitosamente');
      
      // Recargar la lista
      await cargarPacientes();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al actualizar paciente';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Eliminar paciente
  const eliminarPaciente = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await pacienteService.delete(id);
      toast.success('Paciente desactivado exitosamente', {
        description: 'El paciente ya no aparecerá en los listados activos'
      });
      
      // Recargar la lista
      await cargarPacientes();
      
      return true;
    } catch (error) {
      console.error('Error al desactivar paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = String(apiError?.response?.data?.detail || 
                          apiError?.response?.data?.error || 
                          'Error al desactivar paciente');
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Obtener paciente por ID
  const obtenerPaciente = async (id: number): Promise<Paciente | null> => {
    try {
      setError(null);
      return await pacienteService.getById(id);
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al obtener paciente';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  // Buscar pacientes
  const buscarPacientes = async (query: string): Promise<Paciente[]> => {
    try {
      setError(null);
      return await pacienteService.buscar(query);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al buscar pacientes';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  // Reactivar paciente
  const reactivarPaciente = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await pacienteService.reactivar(id);
      toast.success('Paciente reactivado exitosamente', {
        description: 'El paciente y su usuario han sido reactivados'
      });
      
      // Recargar la lista
      await cargarPacientes();
      
      return true;
    } catch (error) {
      console.error('Error al reactivar paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = String(apiError?.response?.data?.detail || 
                          apiError?.response?.data?.error || 
                          'Error al reactivar paciente');
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    cargarPacientes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pacientes,
    loading,
    error,
    incluirInactivos,
    cargarPacientes,
    toggleIncluirInactivos,
    registrarPaciente,
    actualizarPaciente,
    eliminarPaciente,
    reactivarPaciente,
    obtenerPaciente,
    buscarPacientes,
  };
}