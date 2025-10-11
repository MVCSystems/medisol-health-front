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

  // Cargar pacientes
  const cargarPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pacienteService.getAll();
      setPacientes(data.results);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setError('Error al cargar la lista de pacientes');
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
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
      toast.success('Paciente eliminado exitosamente');
      
      // Recargar la lista
      await cargarPacientes();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Error al eliminar paciente';
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

  // Cargar pacientes al montar el componente
  useEffect(() => {
    cargarPacientes();
  }, []);

  return {
    pacientes,
    loading,
    error,
    cargarPacientes,
    registrarPaciente,
    actualizarPaciente,
    eliminarPaciente,
    obtenerPaciente,
    buscarPacientes,
  };
}