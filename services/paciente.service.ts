import { api } from '@/lib/axios';
import type { Paciente } from '@/types/clinicas';

export interface PacienteCreateData {
  // Datos del usuario
  dni: string;
  email: string;
  password: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  direccion?: string;
  celular?: string;
  
  // Datos específicos del paciente
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string; // Format: YYYY-MM-DD
  genero: 'Masculino' | 'Femenino' | 'Otro';
  
  // Campos opcionales
  departamento?: string;
  provincia?: string;
  distrito?: string;
  clinica_id?: number;
}

export interface PacienteRegistroResponse {
  message: string;
  paciente: Paciente;
  usuario: {
    id: number;
    dni: string;
    email: string;
    nombres: string;
    apellidos: string;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

class PacienteService {
  private baseUrl = '/api/clinicas/pacientes';

  // Crear paciente con usuario automático
  async registrar(data: PacienteCreateData): Promise<PacienteRegistroResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/registrar/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string[]> } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'dni' ? 'DNI' :
                               field === 'email' ? 'Email' :
                               field === 'password' ? 'Contraseña' :
                               field === 'nombres' ? 'Nombres' :
                               field === 'apellido_paterno' ? 'Apellido Paterno' :
                               field === 'apellido_materno' ? 'Apellido Materno' :
                               field === 'telefono' ? 'Teléfono' :
                               field === 'celular' ? 'Celular' :
                               field === 'fecha_nacimiento' ? 'Fecha de Nacimiento' :
                               field === 'genero' ? 'Género' :
                               field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          throw new Error(errorMessages || 'Error al registrar paciente');
        }
      }
      throw error;
    }
  }

  // Listar pacientes (carga todas las páginas automáticamente)
  async getAll(incluirInactivos: boolean = false): Promise<{ results: Paciente[]; count: number }> {
    let allResults: Paciente[] = [];
    let page = 1;
    let totalCount = 0;
    let hasMore = true;
    
    while (hasMore) {
      const params = {
        ...(incluirInactivos ? { incluir_inactivos: 'true' } : {}),
        page
      };
      const response = await api.get(`${this.baseUrl}/`, { params });
      const data = response.data;
      
      if (data.results && data.results.length > 0) {
        allResults = [...allResults, ...data.results];
        totalCount = data.count || allResults.length;
        hasMore = data.next !== null;
        page++;
      } else {
        hasMore = false;
      }
      
      if (page > 20) break; // Límite de seguridad
    }
    
    return { results: allResults, count: totalCount };
  }

  // Obtener paciente por ID
  async getById(id: number): Promise<Paciente> {
    const response = await api.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  // Actualizar paciente
  async update(id: number, data: Partial<PacienteCreateData>): Promise<Paciente> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Record<string, string[]> } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'dni' ? 'DNI' :
                               field === 'email' ? 'Email' :
                               field === 'telefono' ? 'Teléfono' :
                               field === 'celular' ? 'Celular' :
                               field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          throw new Error(errorMessages || 'Error al actualizar paciente');
        }
      }
      throw error;
    }
  }

  // Eliminar paciente (soft delete)
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  // Reactivar paciente
  async reactivar(id: number): Promise<{ detail: string }> {
    const response = await api.post(`${this.baseUrl}/${id}/reactivar/`);
    return response.data;
  }

  // Buscar pacientes
  async buscar(query: string): Promise<Paciente[]> {
    const response = await api.get(`${this.baseUrl}/?search=${encodeURIComponent(query)}`);
    return response.data.results;
  }
}

export const pacienteService = new PacienteService();