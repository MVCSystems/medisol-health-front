import { api } from '@/lib/axios';
import type { Doctor } from '@/types/clinicas';

export interface DoctorCreateData {
  // Datos del usuario
  dni: string;
  email: string;
  password: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  direccion?: string;
  
  // Datos específicos del doctor
  titulo: string;
  biografia?: string;
  precio_consulta_base: number;
  foto?: File;
  
  // Relaciones
  especialidades: number[];
  clinica_id: number;
}

export interface DoctorRegistroResponse {
  message: string;
  doctor: Doctor;
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

class DoctorService {
  private baseUrl = '/api/clinicas/doctores';

  // Crear doctor con usuario automático
  async registrar(data: DoctorCreateData): Promise<DoctorRegistroResponse> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'foto' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'especialidades' && Array.isArray(value)) {
        value.forEach((id) => formData.append('especialidades', id.toString()));
      } else if (value !== undefined && value !== null && key !== 'foto') {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post(`${this.baseUrl}/registrar/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Listar doctores
  async getAll(): Promise<{ results: Doctor[]; count: number }> {
    const response = await api.get(`${this.baseUrl}/`);
    return response.data;
  }

  // Obtener doctor por ID
  async getById(id: number): Promise<Doctor> {
    const response = await api.get(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  // Actualizar doctor
  async update(id: number, data: Partial<DoctorCreateData>): Promise<Doctor> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'foto' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'especialidades' && Array.isArray(value)) {
        value.forEach((espId) => formData.append('especialidades', espId.toString()));
      } else if (value !== undefined && value !== null && key !== 'foto') {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put(`${this.baseUrl}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Eliminar doctor
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  // Filtrar doctores por clínica
  async getByClinica(clinicaId: number): Promise<Doctor[]> {
    const response = await api.get(`${this.baseUrl}/por_clinica/?clinica_id=${clinicaId}`);
    return response.data;
  }

  // Filtrar doctores por especialidad
  async getByEspecialidad(especialidadId: number): Promise<Doctor[]> {
    const response = await api.get(`${this.baseUrl}/por_especialidad/?especialidad_id=${especialidadId}`);
    return response.data;
  }
}

export const doctorService = new DoctorService();