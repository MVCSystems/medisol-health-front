import { useState, useEffect } from 'react';
import { horarioService } from '@/services/horario.service';

interface HorarioDoctor {
  id: number;
  doctor: number;
  doctor_nombre: string;
  dia_semana: number;
  dia_semana_display: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
}

interface DisponibilidadCita {
  id: number;
  doctor: number;
  doctor_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

export const useHorarios = (doctorId?: number) => {
  const [horarios, setHorarios] = useState<HorarioDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await horarioService.getHorarios(doctorId);
      setHorarios(response.results || response || []);
    } catch (err) {
      setError('Error al cargar horarios');
      console.error('Error al cargar horarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const crearHorario = async (data: Omit<HorarioDoctor, 'id' | 'doctor_nombre' | 'dia_semana_display'>) => {
    try {
      await horarioService.createHorario(data);
      await cargarHorarios(); // Recargar lista
      return { success: true, error: null };
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al crear horario';
      setError(errorMsg);
      console.error('Error al crear horario:', err);
      return { success: false, error: errorMsg };
    }
  };

  const actualizarHorario = async (id: number, data: Partial<Omit<HorarioDoctor, 'id' | 'doctor_nombre' | 'dia_semana_display'>>) => {
    try {
      await horarioService.updateHorario(id, data);
      await cargarHorarios(); // Recargar lista
      return { success: true, error: null };
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar horario';
      setError(errorMsg);
      console.error('Error al actualizar horario:', err);
      return { success: false, error: errorMsg };
    }
  };

  const eliminarHorario = async (id: number) => {
    try {
      await horarioService.deleteHorario(id);
      await cargarHorarios(); // Recargar lista
      return true;
    } catch (err) {
      setError('Error al eliminar horario');
      console.error('Error al eliminar horario:', err);
      return false;
    }
  };

  useEffect(() => {
    if (doctorId) {
      cargarHorarios();
    }
  }, [doctorId]);

  return {
    horarios,
    loading,
    error,
    cargarHorarios,
    crearHorario,
    actualizarHorario,
    eliminarHorario
  };
};

export const useDisponibilidad = (doctorId?: number, fecha?: string) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDisponibilidad = async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await horarioService.getDisponibilidadDoctor(doctorId, fecha);
      setDisponibilidad(response || []);
    } catch (err) {
      setError('Error al cargar disponibilidad');
      console.error('Error al cargar disponibilidad:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarDisponibilidad = async (fechaInicio: string, fechaFin: string) => {
    if (!doctorId) return false;

    try {
      setLoading(true);
      await horarioService.generarDisponibilidad(doctorId, fechaInicio, fechaFin);
      await cargarDisponibilidad(); // Recargar
      return true;
    } catch (err) {
      setError('Error al generar disponibilidad');
      console.error('Error al generar disponibilidad:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      cargarDisponibilidad();
    }
  }, [doctorId, fecha]);

  return {
    disponibilidad,
    loading,
    error,
    cargarDisponibilidad,
    generarDisponibilidad
  };
};