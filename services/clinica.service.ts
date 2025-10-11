import { api } from '@/lib/axios';
import type { 
  Clinica, 
  CreateClinicaData, 
  UpdateClinicaData, 
  PaginatedResponse 
} from '@/types/clinicas';

class ClinicaService {
  private readonly baseUrl = '/api/clinicas/clinicas';

  /**
   * Obtener todas las clínicas (solo admin)
   */
  async getAll(): Promise<PaginatedResponse<Clinica>> {
    const response = await api.get<PaginatedResponse<Clinica>>(`${this.baseUrl}/`);
    return response.data;
  }

  /**
   * Obtener clínica por ID
   */
  async getById(id: number): Promise<Clinica> {
    const response = await api.get<Clinica>(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  /**
   * Crear nueva clínica
   */
  async create(data: CreateClinicaData): Promise<Clinica> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.keys(data).forEach(key => {
      const value = data[key as keyof CreateClinicaData];
      if (value !== null && value !== undefined && key !== 'logo') {
        formData.append(key, value.toString());
      }
    });

    // Agregar logo si existe
    if (data.logo && data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    const response = await api.post<Clinica>(`${this.baseUrl}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Actualizar clínica existente
   */
  async update(id: number, data: UpdateClinicaData): Promise<Clinica> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UpdateClinicaData];
      if (value !== null && value !== undefined && key !== 'logo') {
        formData.append(key, value.toString());
      }
    });

    // Agregar logo si existe
    if (data.logo && data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    const response = await api.patch<Clinica>(`${this.baseUrl}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Eliminar clínica
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  /**
   * Obtener clínicas activas (público)
   */
  async getPublicClinics(): Promise<Clinica[]> {
    const response = await api.get<Clinica[]>(`${this.baseUrl}/public/`);
    return response.data;
  }
}

export const clinicaService = new ClinicaService();