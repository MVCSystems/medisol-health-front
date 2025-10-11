import { api } from '@/lib/axios';
import type { HorarioDoctor, DisponibilidadCita } from '@/types/clinicas';

export interface HorarioCreateData {
  doctor: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
}

export interface DisponibilidadFilters {
  doctor?: number;
  fecha?: string;
  disponible?: boolean;
}

class HorarioService {
  // Horarios regulares del doctor
  async getHorarios(doctorId?: number) {
    const params = doctorId ? { doctor: doctorId } : {};
    const response = await api.get('/api/clinicas/horarios/', { params });
    return response.data;
  }

  async createHorario(data: HorarioCreateData) {
    const response = await api.post('/api/clinicas/horarios/', data);
    return response.data;
  }

  async updateHorario(id: number, data: Partial<HorarioCreateData>) {
    const response = await api.put(`/api/clinicas/horarios/${id}/`, data);
    return response.data;
  }

  async deleteHorario(id: number) {
    const response = await api.delete(`/api/clinicas/horarios/${id}/`);
    return response.data;
  }

  // Disponibilidad específica (slots)
  async getDisponibilidad(filters?: DisponibilidadFilters) {
    const response = await api.get('/api/clinicas/disponibilidad/', { params: filters });
    return response.data;
  }

  async generarDisponibilidad(doctorId: number, fechaInicio: string, fechaFin: string) {
    const response = await api.post(`/api/clinicas/horarios/generar_disponibilidad/`, {
      doctor: doctorId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    return response.data;
  }

  // Obtener horarios de un doctor específico
  async getHorariosDoctor(doctorId: number) {
    const response = await api.get('/api/clinicas/horarios/', { params: { doctor: doctorId } });
    return response.data;
  }

  // Obtener disponibilidad de un doctor para una fecha específica
  async getDisponibilidadDoctor(doctorId: number, fecha?: string) {
    const params = { doctor: doctorId, ...(fecha && { fecha }) };
    const response = await api.get('/api/clinicas/disponibilidad/', { params });
    return response.data;
  }
}

export const horarioService = new HorarioService();