import { api } from '@/lib/axios';
import { doctorService } from './doctor.service';
import { AxiosError } from 'axios';

interface RawCitaData {
  id: number;
  clinica: number;
  clinica_nombre: string;
  doctor: number;
  doctor_nombre: string;
  doctor_precio_base: string;
  doctor_especialidades: Array<{
    id: number;
    nombre: string;
  }>;
  estado: string;
  fecha: string;
  fecha_creacion: string;
  hora_fin: string;
  hora_inicio: string;
  motivo: string;
  notas: string;
  paciente: number;
  paciente_nombre: string;
  paciente_documento: string;
  precio_consulta: string;
  precio_total: string;
  descuento: string;
}

export interface CitaCreateData {
  clinica: number;
  doctor: number;
  paciente?: number;
  disponibilidad_id?: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado?: string;
  notas?: string;
  precio_consulta?: number;
  descuento?: number;
  paciente_datos?: {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
  };
  tipo_cita?: string;
}

export interface CitaFilters {
  doctor?: number;
  paciente?: number;
  clinica?: number;
  fecha?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export const citaService = {
  getCitas: async (filters?: CitaFilters) => {
    try {
      console.log('🔍 Solicitando citas con filtros:', filters);
      const response = await api.get('/api/clinicas/citas/', { params: filters });
      console.log('📦 Respuesta completa del backend:', response.data);
      const citasData = response.data.results || [];
      
      // Obtener detalles de doctores
      const doctorPromises = citasData.map((cita: RawCitaData) =>
        doctorService.getDoctor(cita.doctor)
          .catch(error => {
            console.error(`Error al obtener detalles del doctor ${cita.doctor}:`, error);
            return null;
          })
      );

      const doctores = await Promise.all(doctorPromises);
      console.log('👨‍⚕️ Detalles de doctores obtenidos:', doctores);

      // Procesar las citas con los detalles de los doctores
      const citasProcesadas = citasData.map((cita: RawCitaData, index: number) => {
        const doctor = doctores[index];
        console.log(`🏥 Procesando cita ${cita.id}:`, {
          datosOriginales: cita,
          detallesDoctor: doctor
        });

        return {
          id: cita.id,
          fecha: cita.fecha,
          hora_inicio: cita.hora_inicio,
          hora_fin: cita.hora_fin,
          estado: cita.estado,
          motivo: cita.motivo,
          notas: cita.notas,
          precio_consulta: parseFloat(cita.precio_consulta),
          precio_total: parseFloat(cita.precio_total),
          descuento: parseFloat(cita.descuento || '0'),
          doctor: {
            id: cita.doctor,
            nombres: cita.doctor_nombre?.split(' ')[0] || '',
            apellidos: cita.doctor_nombre?.split(' ').slice(1).join(' ') || '',
            especialidades: cita.doctor_especialidades || []
          },
          paciente: {
            id: cita.paciente,
            nombres: cita.paciente_nombre?.split(' ')[0] || '',
            apellidos: cita.paciente_nombre?.split(' ').slice(1).join(' ') || '',
            numero_documento: cita.paciente_documento || ''
          },
          clinica: {
            id: cita.clinica,
            nombre: cita.clinica_nombre
          }
        };
      });

      console.log('✅ Citas procesadas:', citasProcesadas);

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: citasProcesadas
      };
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  createCita: async (data: CitaCreateData) => {
    try {
      const citaApiData = {
        clinica: Number(data.clinica),
        doctor: Number(data.doctor),
        paciente: Number(data.paciente),
        fecha: data.fecha,
        hora_inicio: data.hora_inicio.length === 5 ? data.hora_inicio + ':00' : data.hora_inicio,
        hora_fin: data.hora_fin.length === 5 ? data.hora_fin + ':00' : data.hora_fin,
        motivo: data.motivo?.trim() || '',
        estado: 'PENDIENTE',
        notas: data.notas || ''
      };

      const response = await api.post('/api/clinicas/citas/', citaApiData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        if (error.response.data.paciente) {
          throw new Error('Ya tienes una cita registrada para este horario. Por favor selecciona otro horario disponible.');
        }
      }
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  getCita: async (id: number) => {
    try {
      const response = await api.get(`/api/clinicas/citas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  },

  updateCita: async (id: number, data: Partial<CitaCreateData>) => {
    try {
      const response = await api.put(`/api/clinicas/citas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  cancelarCita: async (id: number, razon?: string) => {
    try {
      const response = await api.patch(`/api/clinicas/citas/${id}/`, {
        estado: 'CANCELADA',
        notas: razon ? `Cancelada: ${razon}` : 'Cancelada'
      });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  },

  confirmarCita: async (id: number) => {
    try {
      const response = await api.patch(`/api/clinicas/citas/${id}/`, {
        estado: 'CONFIRMADA'
      });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      throw error;
    }
  },

  deleteCita: async (id: number) => {
    try {
      const response = await api.delete(`/api/clinicas/citas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  },

  getDisponibilidadDoctor: async (doctorId: number, fecha: string) => {
    try {
      console.log(`🔍 Buscando disponibilidad para doctor ${doctorId} en fecha ${fecha}`);
      const response = await api.get('/api/clinicas/disponibilidad/', {
        params: {
          doctor: doctorId,
          fecha: fecha,
          disponible: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  },

  reservarSlot: async (disponibilidadId: number, citaData: CitaCreateData) => {
    try {
      console.log(`🎯 Reservando slot ${disponibilidadId}`, citaData);
      const citaCompleta = {
        ...citaData,
        disponibilidad: disponibilidadId
      };
      const response = await api.post('/api/clinicas/citas/', citaCompleta);
      return response.data;
    } catch (error) {
      console.error('Error al reservar slot:', error);
      throw error;
    }
  }
};