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
    try {
      const response = await api.post<Especialidad>(`${this.baseUrl}/`, data);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string[]> } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'nombre' ? 'Nombre' :
                               field === 'descripcion' ? 'Descripción' :
                               field === 'icono' ? 'Ícono' :
                               field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          throw new Error(errorMessages || 'Error al crear especialidad');
        }
      }
      throw error;
    }
  }

  /**
   * Actualizar especialidad existente
   */
  async update(id: number, data: UpdateEspecialidadData): Promise<Especialidad> {
    try {
      const response = await api.patch<Especialidad>(`${this.baseUrl}/${id}/`, data);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string[]> } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'nombre' ? 'Nombre' :
                               field === 'descripcion' ? 'Descripción' :
                               field === 'icono' ? 'Ícono' :
                               field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          throw new Error(errorMessages || 'Error al actualizar especialidad');
        }
      }
      throw error;
    }
  }

  /**
   * Eliminar especialidad
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }
}

export const especialidadService = new EspecialidadService();