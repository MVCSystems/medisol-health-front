import { useState, useEffect, useCallback } from 'react';
import { citaService, CitaCreateData, CitaFilters } from '@/services/cita.service';
import type { Cita, DisponibilidadCita } from '@/types/clinicas';

export const useCitas = (filters?: CitaFilters) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await citaService.getCitas(filters);
      setCitas(response.results || response || []);
    } catch (err) {
      setError('Error al cargar citas');
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const crearCita = async (data: CitaCreateData) => {
    try {
      const result = await citaService.createCita(data);
      await cargarCitas(); // Recargar lista
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear cita';
      return { success: false, error: errorMsg };
    }
  };

  const confirmarCita = async (id: number) => {
    try {
      await citaService.confirmarCita(id);
      await cargarCitas(); // Recargar lista
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al confirmar cita';
      return { success: false, error: errorMsg };
    }
  };

  const cancelarCita = async (id: number, razon?: string) => {
    try {
      await citaService.cancelarCita(id, razon);
      await cargarCitas(); // Recargar lista
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cancelar cita';
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  return {
    citas,
    loading,
    error,
    crearCita,
    confirmarCita,
    cancelarCita,
    refetch: cargarCitas
  };
};

export const useDisponibilidadDoctor = () => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{doctorId: number, fecha: string} | null>(null);

  const cargarDisponibilidad = useCallback(async (fecha: string, doctorId?: number) => {
    if (!doctorId) {
      console.warn('No se proporcionó doctorId para cargar disponibilidad');
      return;
    }
    
    // Evitar llamadas duplicadas
    if (lastRequest?.doctorId === doctorId && lastRequest?.fecha === fecha) {
      if (loading) {
        console.log('⏳ Llamada en progreso, ignorando duplicada');
        return;
      }
      // Si la misma request ya terminó recientemente, no volver a cargar
      console.log('🔄 Reutilizando datos existentes');
      return;
    }
    
    console.log(`🔍 Cargando disponibilidad: doctor ${doctorId}, fecha ${fecha}`);
    setLastRequest({ doctorId, fecha });
    
    try {
      setLoading(true);
      setError(null);
      const response = await citaService.getDisponibilidadDoctor(doctorId, fecha);
      
      const disponibilidadData = response.results || response || [];
      setDisponibilidades(disponibilidadData);
      
      console.log(`✅ Hook actualizado: ${disponibilidadData.length} slots cargados`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar disponibilidad';
      setError(errorMessage);
      console.error('Error al cargar disponibilidad:', err);
      setDisponibilidades([]);
    } finally {
      setLoading(false);
    }
  }, [loading, lastRequest]);

  const reservarSlot = useCallback(async (disponibilidadId: number, citaData: CitaCreateData, doctorId?: number) => {
    try {
      const result = await citaService.reservarSlot(disponibilidadId, citaData);
      // Recargar disponibilidad después de reservar
      if (citaData.fecha && doctorId) {
        await cargarDisponibilidad(citaData.fecha, doctorId);
      }
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al reservar cita';
      return { success: false, error: errorMsg };
    }
  }, [cargarDisponibilidad]);

  return {
    disponibilidades,
    loading,
    error,
    cargarDisponibilidad,
    reservarSlot
  };
};