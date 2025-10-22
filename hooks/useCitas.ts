import { useState, useEffect, useCallback } from 'react';
import { citaService, CitaCreateData, CitaFilters } from '@/services/cita.service';
import { useAuthStore } from '@/store/authStore';
import type { DisponibilidadCita } from '@/types/clinicas';
import type { CitaWithDetails } from '@/types/citas';

export const useCitas = (filters?: CitaFilters) => {
  const [citas, setCitas] = useState<CitaWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pacientes y doctores usan /mis_citas/, solo admins/staff usan /citas/
      const isStaffOrAdmin = user?.is_staff || user?.is_superuser;
      const response = isStaffOrAdmin 
        ? await citaService.getCitas(filters)
        : await citaService.getMisCitas(filters);
      
      if (response.results) {
        setCitas(response.results);
      } else {
        setCitas([]);
      }
    } catch {
      setError('Error al cargar citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const crearCita = async (data: CitaCreateData) => {
    try {
      const result = await citaService.createCita(data);
      await fetchCitas();
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear cita';
      return { success: false, error: errorMsg };
    }
  };

  const confirmarCita = async (id: number) => {
    try {
      await citaService.confirmarCita(id);
      await fetchCitas();
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al confirmar cita';
      return { success: false, error: errorMsg };
    }
  };

  const cancelarCita = async (id: number, razon?: string) => {
    try {
      await citaService.cancelarCita(id, razon);
      await fetchCitas();
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cancelar cita';
      return { success: false, error: errorMsg };
    }
  };

  return {
    citas,
    loading,
    error,
    crearCita,
    confirmarCita,
    cancelarCita,
    refetch: fetchCitas
  };
};
export const useDisponibilidadDoctor = () => {
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{doctorId: number, fecha: string} | null>(null);

  const [citasExistentes, setCitasExistentes] = useState<DisponibilidadCita[]>([]);

  const cargarDisponibilidad = useCallback(async (fecha: string, doctorId?: number) => {
    if (!doctorId) {
      return;
    }
    
    // Evitar llamadas duplicadas
    if (lastRequest?.doctorId === doctorId && lastRequest?.fecha === fecha) {
      if (loading) {
        return;
      }
      // Si la misma request ya terminó recientemente, no volver a cargar
      return;
    }
    
    setLastRequest({ doctorId, fecha });
    
    try {
      setLoading(true);
      setError(null);
      const response = await citaService.getDisponibilidadDoctor(doctorId, fecha);
      
      const disponibilidadData = response.results || response || [];
      setDisponibilidades(disponibilidadData);
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

  // Cargar citas existentes
  const cargarCitasExistentes = useCallback(async (fecha: string, doctorId: number) => {
    try {
      const response = await citaService.getCitas({
        doctor: doctorId,
        fecha,
        estado: 'PENDIENTE'
      });
      setCitasExistentes(response.results.map((cita: CitaWithDetails) => ({
        id: cita.id,
        doctor: cita.doctor,
        fecha: cita.fecha,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        disponible: false
      })));
    } catch (error) {
      console.error('Error al cargar citas existentes:', error);
    }
  }, []);

  useEffect(() => {
    if (lastRequest?.doctorId && lastRequest?.fecha) {
      cargarCitasExistentes(lastRequest.fecha, lastRequest.doctorId);
    }
  }, [lastRequest, cargarCitasExistentes]);

  return {
    disponibilidades,
    citasExistentes,
    loading,
    error,
    cargarDisponibilidad,
    reservarSlot
  };
};