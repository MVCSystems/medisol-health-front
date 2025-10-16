import { api } from '@/lib/axios';
import type { HorarioDoctor, DisponibilidadCita } from '@/types/clinicas';

export interface HorarioCreateData {
  doctor: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
  tiene_refrigerio?: boolean;
  hora_refrigerio_inicio?: string;
  hora_refrigerio_fin?: string;
}

export interface DisponibilidadFilters {
  doctor?: number;
  fecha?: string;
  disponible?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class HorarioService {
  // Horarios regulares del doctor
  async getHorarios(doctorId?: number): Promise<HorarioDoctor[]> {
    const params = doctorId ? { doctor: doctorId } : {};
    const response = await api.get('/api/clinicas/horarios/', { params });
    return response.data;
  }

  async createHorario(data: HorarioCreateData): Promise<HorarioDoctor> {
    const response = await api.post('/api/clinicas/horarios/', data);
    return response.data;
  }

  async updateHorario(id: number, data: Partial<HorarioCreateData>): Promise<HorarioDoctor> {
    const response = await api.put(`/api/clinicas/horarios/${id}/`, data);
    return response.data;
  }

  async deleteHorario(id: number): Promise<void> {
    const response = await api.delete(`/api/clinicas/horarios/${id}/`);
    return response.data;
  }

  // Disponibilidad específica (slots)
  async getDisponibilidad(filters?: DisponibilidadFilters): Promise<PaginatedResponse<DisponibilidadCita>> {
    const response = await api.get('/api/clinicas/disponibilidad/', { params: filters });
    return response.data;
  }

  async generarDisponibilidad(doctorId: number, fechaInicio: string, fechaFin: string): Promise<PaginatedResponse<DisponibilidadCita>> {
    const response = await api.post(`/api/clinicas/horarios/generar_disponibilidad/`, {
      doctor: doctorId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    return response.data;
  }

  // Obtener horarios de un doctor específico
  async getHorariosDoctor(doctorId: number): Promise<HorarioDoctor[]> {
    const response = await api.get('/api/clinicas/horarios/', { params: { doctor: doctorId } });
    return response.data;
  }

  // Obtener disponibilidad de un doctor para una fecha específica
  async getDisponibilidadDoctor(doctorId: number, fecha?: string): Promise<PaginatedResponse<DisponibilidadCita>> {
    const params = { doctor: doctorId, ...(fecha && { fecha }) };
    const response = await api.get('/api/clinicas/disponibilidad/', { params });
    return response.data;
  }
}

export const horarioService = new HorarioService();