import { api } from '@/lib/axios';
import type { 
  Especialidad, 
  CreateEspecialidadData, 
  UpdateEspecialidadData, 
  PaginatedResponse 
} from '@/types/clinicas';

class EspecialidadService {
  private readonly baseUrl = '/api/clinicas/especialidades';

  /**
   * Obtener todas las especialidades
   */
  async getAll(): Promise<PaginatedResponse<Especialidad>> {
    const response = await api.get<PaginatedResponse<Especialidad>>(`${this.baseUrl}/`);
    return response.data;
  }

  /**
   * Obtener especialidad por ID
   */
  async getById(id: number): Promise<Especialidad> {
    const response = await api.get<Especialidad>(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  /**
   * Crear nueva especialidad
   */
  async create(data: CreateEspecialidadData): Promise<Especialidad> {
    const response = await api.post<Especialidad>(`${this.baseUrl}/`, data);
    return response.data;
  }

  /**
   * Actualizar especialidad existente
   */
  async update(id: number, data: UpdateEspecialidadData): Promise<Especialidad> {
    const response = await api.patch<Especialidad>(`${this.baseUrl}/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar especialidad
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }
}

export const especialidadService = new EspecialidadService();