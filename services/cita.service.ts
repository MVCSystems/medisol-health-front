import { api } from '@/lib/axios';
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
  paciente: number;
  disponibilidad_id?: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado?: string;
  notas?: string;
  precio_consulta?: number;
  descuento?: number;
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
      const response = await api.get('/api/clinicas/citas/', { params: filters });
      const citasData = response.data.results || [];

      const citasProcesadas = citasData.map((cita: RawCitaData) => {
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

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: citasProcesadas
      };
    } catch (error) {
      throw error;
    }
  },

  getMisCitas: async (filters?: CitaFilters) => {
    try {
      // Usar el endpoint regular /citas/ que filtra automáticamente por usuario en el backend
      const response = await api.get('/api/clinicas/citas/', { params: filters });
      const citasData = response.data.results || [];

      const citasProcesadas = citasData.map((cita: RawCitaData) => {
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

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: citasProcesadas
      };
    } catch (error) {
      throw error;
    }
  },

  createCita: async (data: CitaCreateData) => {
    try {
      const citaApiData: CitaCreateData = {
        clinica: Number(data.clinica),
        doctor: Number(data.doctor),
        paciente: Number(data.paciente),
        fecha: data.fecha,
        hora_inicio: data.hora_inicio.length === 5 ? data.hora_inicio + ':00' : data.hora_inicio,
        hora_fin: data.hora_fin.length === 5 ? data.hora_fin + ':00' : data.hora_fin,
        motivo: data.motivo?.trim() || '',
        estado: data.estado || 'PENDIENTE',
        notas: data.notas || '',
        precio_consulta: data.precio_consulta || 0,
        descuento: data.descuento || 0
      };

      const response = await api.post('/api/clinicas/citas/', citaApiData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          if (error.response.data.paciente) {
            throw new Error('Ya tienes una cita registrada para este horario. Por favor selecciona otro horario disponible.');
          }
          const errorMsg = JSON.stringify(error.response.data);
          throw new Error(`Error de validación: ${errorMsg}`);
        }
        
        if (error.response?.status === 500) {
          throw new Error('Error interno del servidor. Por favor contacta al administrador.');
        }
      }
      throw error;
    }
  },

  getCita: async (id: number) => {
    try {
      const response = await api.get(`/api/clinicas/citas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCita: async (id: number, data: Partial<CitaCreateData>) => {
    try {
      const response = await api.put(`/api/clinicas/citas/${id}/`, data);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  cambiarEstado: async (id: number, nuevoEstado: string) => {
    try {
      const response = await api.post(`/api/clinicas/citas/${id}/cambiar_estado/`, {
        estado: nuevoEstado
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCita: async (id: number) => {
    try {
      const response = await api.delete(`/api/clinicas/citas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDisponibilidadDoctor: async (doctorId: number, fecha: string) => {
    try {
      const response = await api.get('/api/clinicas/disponibilidad/', {
        params: {
          doctor: doctorId,
          fecha: fecha,
          disponible: true
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  reservarSlot: async (disponibilidadId: number, citaData: CitaCreateData) => {
    try {
      const citaCompleta = {
        ...citaData,
        disponibilidad: disponibilidadId
      };
      const response = await api.post('/api/clinicas/citas/', citaCompleta);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};