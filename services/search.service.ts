import { api } from '@/lib/axios';
import type { 
  Clinica, 
  Especialidad, 
  Doctor, 
  Cita,
  PaginatedResponse 
} from '@/types/clinicas';

// Interfaces para los resultados de búsqueda
export interface SearchResults {
  especialidades: Especialidad[];
  doctores: Doctor[];
  clinicas: Clinica[];
  citas: Cita[];
}

class SearchService {
  private readonly baseUrls = {
    especialidades: '/api/clinicas/especialidades',
    doctores: '/api/clinicas/doctores',
    clinicas: '/api/clinicas/clinicas',
    citas: '/api/clinicas/citas',
  };

  /**
   * Búsqueda universal en todas las entidades
   */
  async searchAll(query: string): Promise<SearchResults> {
    if (query.length < 2) {
      return {
        especialidades: [],
        doctores: [],
        clinicas: [],
        citas: [],
      };
    }

    try {
      const [
        especialidadesRes,
        doctoresRes,
        clinicasRes,
        citasRes,
      ] = await Promise.allSettled([
        this.searchEspecialidades(query),
        this.searchDoctores(query),
        this.searchClinicas(query),
        this.searchCitas(query),
      ]);

      return {
        especialidades: especialidadesRes.status === 'fulfilled' ? especialidadesRes.value : [],
        doctores: doctoresRes.status === 'fulfilled' ? doctoresRes.value : [],
        clinicas: clinicasRes.status === 'fulfilled' ? clinicasRes.value : [],
        citas: citasRes.status === 'fulfilled' ? citasRes.value : [],
      };
    } catch (error) {
      console.error('Error en búsqueda universal:', error);
      return {
        especialidades: [],
        doctores: [],
        clinicas: [],
        citas: [],
      };
    }
  }

  /**
   * Buscar especialidades por nombre o descripción
   */
  async searchEspecialidades(query: string): Promise<Especialidad[]> {
    try {
      const response = await api.get<PaginatedResponse<Especialidad>>(
        `${this.baseUrls.especialidades}/?search=${encodeURIComponent(query)}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error buscando especialidades:', error);
      return [];
    }
  }

  /**
   * Buscar doctores por nombre, apellido o título
   */
  async searchDoctores(query: string): Promise<Doctor[]> {
    try {
      const response = await api.get<PaginatedResponse<Doctor>>(
        `${this.baseUrls.doctores}/?search=${encodeURIComponent(query)}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error buscando doctores:', error);
      return [];
    }
  }

  /**
   * Buscar clínicas por nombre o dirección
   */
  async searchClinicas(query: string): Promise<Clinica[]> {
    try {
      const response = await api.get<PaginatedResponse<Clinica>>(
        `${this.baseUrls.clinicas}/?search=${encodeURIComponent(query)}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error buscando clínicas:', error);
      return [];
    }
  }

  /**
   * Buscar citas por motivo o notas
   */
  async searchCitas(query: string): Promise<Cita[]> {
    try {
      const response = await api.get<PaginatedResponse<Cita>>(
        `${this.baseUrls.citas}/?search=${encodeURIComponent(query)}`
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Error buscando citas:', error);
      return [];
    }
  }

  /**
   * Obtener doctores por especialidad
   */
  async getDoctoresByEspecialidad(especialidadId: number): Promise<Doctor[]> {
    try {
      const response = await api.get<Doctor[]>(
        `${this.baseUrls.doctores}/por_especialidad/?especialidad_id=${especialidadId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo doctores por especialidad:', error);
      return [];
    }
  }

  /**
   * Obtener doctores por clínica
   */
  async getDoctoresByClinica(clinicaId: number): Promise<Doctor[]> {
    try {
      const response = await api.get<Doctor[]>(
        `${this.baseUrls.doctores}/por_clinica/?clinica_id=${clinicaId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo doctores por clínica:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();