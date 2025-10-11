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
    const response = await api.post(`${this.baseUrl}/registrar/`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  // Listar pacientes
  async getAll(): Promise<{ results: Paciente[]; count: number }> {
    const response = await api.get(`${this.baseUrl}/`);
    return response.data;
  }

  // Obtener paciente por ID
  async getById(id: number): Promise<Paciente> {
    const response = await api.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  // Actualizar paciente
  async update(id: number, data: Partial<PacienteCreateData>): Promise<Paciente> {
    const response = await api.put(`${this.baseUrl}/${id}/`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  // Eliminar paciente
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  // Buscar pacientes
  async buscar(query: string): Promise<Paciente[]> {
    const response = await api.get(`${this.baseUrl}/?search=${encodeURIComponent(query)}`);
    return response.data.results;
  }
}

export const pacienteService = new PacienteService();