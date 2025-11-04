import { useState, useEffect, useCallback } from 'react';
import { horarioService } from '@/services/horario.service';
import type { HorarioDoctor, DisponibilidadCita } from '@/types/clinicas';

export const useHorarios = (doctorId?: number) => {
  const [horarios, setHorarios] = useState<HorarioDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHorarios = useCallback(async () => {
    console.log('📥 Cargando horarios para doctor:', doctorId);
    try {
      setLoading(true);
      setError(null);
      const response = await horarioService.getHorarios(doctorId);
      console.log('✅ Horarios recibidos:', response.results?.length || 0, 'horarios');
      setHorarios(response.results || []);
    } catch (err) {
      setError('Error al cargar horarios');
      console.error('❌ Error al cargar horarios:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const crearHorario = async (data: Omit<HorarioDoctor, 'id' | 'doctor_nombre' | 'dia_semana_display'>) => {
    try {
      console.log('📤 Enviando datos al backend:', data);
      await horarioService.createHorario(data);
      await cargarHorarios(); // Recargar lista
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Error completo:', err);
      const responseData = (err as any).response?.data;
      console.error('❌ Response data:', responseData);
      
      // Intentar extraer el mensaje de error más específico
      let errorMsg = 'Error al crear horario';
      
      if (responseData?.detail) {
        errorMsg = responseData.detail;
      } else if (responseData?.non_field_errors && Array.isArray(responseData.non_field_errors)) {
        errorMsg = responseData.non_field_errors[0];
        console.error('❌ non_field_errors:', responseData.non_field_errors);
      } else if (typeof responseData === 'string') {
        errorMsg = responseData;
      }
      
      setError(errorMsg);
      console.error('❌ Mensaje final:', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const actualizarHorario = async (id: number, data: Partial<Omit<HorarioDoctor, 'id' | 'doctor_nombre' | 'dia_semana_display'>>) => {
    try {
      await horarioService.updateHorario(id, data);
      await cargarHorarios(); // Recargar lista
      return { success: true, error: null };
    } catch (err) {
      const errorMsg = (err as any).response?.data?.detail || 'Error al actualizar horario';
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
  }, [doctorId, cargarHorarios]);

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

  const cargarDisponibilidad = useCallback(async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await horarioService.getDisponibilidadDoctor(doctorId, fecha);
      setDisponibilidad(response.results || []);
    } catch (err) {
      setError('Error al cargar disponibilidad');
      console.error('Error al cargar disponibilidad:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId, fecha]);

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
  }, [doctorId, cargarDisponibilidad]);

  return {
    disponibilidad,
    loading,
    error,
    cargarDisponibilidad,
    generarDisponibilidad
  };
};