import axios from 'axios';
import { api } from '@/lib/axios';

export interface CitaCreateData {
  clinica: number;
  doctor: number;
  paciente?: number; // Opcional si vamos a crear el paciente automáticamente
  disponibilidad_id?: number; // Para reservar un slot específico
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado?: string;
  notas?: string;
  precio_consulta?: number;
  descuento?: number;
  // Campos para crear paciente automáticamente
  paciente_datos?: {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
  };
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

class CitaService {
  // Obtener todas las citas con filtros
  async getCitas(filters?: CitaFilters) {
    const response = await api.get('/api/clinicas/citas/', { params: filters });
    return response.data;
  }

  // Crear nueva cita
  async createCita(data: CitaCreateData) {
    try {
      // Si se proporciona disponibilidad_id, primero verificar que esté disponible
      if (data.disponibilidad_id) {
        const disponibilidad = await this.getDisponibilidad(data.disponibilidad_id);
        if (!disponibilidad.disponible) {
          throw new Error('El horario seleccionado ya no está disponible');
        }
      }

      let pacienteId = data.paciente;

      // Si se proporcionan datos de paciente, crear el paciente primero
      if (data.paciente_datos && !data.paciente) {
        try {
          const pacienteResponse = await api.post('/api/clinicas/pacientes/', {
            nombres: data.paciente_datos.nombres,
            apellidos: data.paciente_datos.apellidos,
            email: data.paciente_datos.email,
            telefono: data.paciente_datos.telefono,
            dni: data.paciente_datos.dni,
            clinica: data.clinica
          });
          pacienteId = pacienteResponse.data.id;
        } catch (pacienteError) {
          console.error('Error al crear paciente:', pacienteError);
          throw new Error('Error al registrar los datos del paciente');
        }
      }

      // Crear objeto para la API de citas sin los campos adicionales
      const citaApiData = {
        clinica: data.clinica,
        doctor: data.doctor,
        paciente: pacienteId,
        disponibilidad_id: data.disponibilidad_id,
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        motivo: data.motivo,
        estado: data.estado,
        notas: data.notas,
        precio_consulta: data.precio_consulta,
        descuento: data.descuento
      };
      
      const response = await api.post('/api/clinicas/citas/', citaApiData);
      return response.data;
    } catch (error) {
      console.error('Error en createCita:', error);
      throw error;
    }
  }

  // Obtener cita por ID
  async getCita(id: number) {
    const response = await api.get(`/api/clinicas/citas/${id}/`);
    return response.data;
  }

  // Actualizar cita
  async updateCita(id: number, data: Partial<CitaCreateData>) {
    const response = await api.put(`/api/clinicas/citas/${id}/`, data);
    return response.data;
  }

  // Cancelar cita
  async cancelarCita(id: number, razon?: string) {
    const response = await api.patch(`/api/clinicas/citas/${id}/`, {
      estado: 'CANCELADA',
      notas: razon ? `Cancelada: ${razon}` : 'Cancelada'
    });
    return response.data;
  }

  // Confirmar cita
  async confirmarCita(id: number) {
    const response = await api.patch(`/api/clinicas/citas/${id}/`, {
      estado: 'CONFIRMADA'
    });
    return response.data;
  }

  // Obtener disponibilidad específica
  async getDisponibilidad(id: number) {
    const response = await api.get(`/api/clinicas/disponibilidad/${id}/`);
    return response.data;
  }

  // Obtener disponibilidad de un doctor para una fecha
  async getDisponibilidadDoctor(doctorId: number, fecha: string) {
    const url = '/api/clinicas/disponibilidad/';
    const params = {
      doctor: doctorId,
      fecha: fecha,
      disponible: true
    };
    
    console.log(`[CitaService] Buscando disponibilidad: doctor ${doctorId}, fecha ${fecha}`);
    
    try {
      const response = await api.get(url, { params });
      
      // Filtrar solo los slots de la fecha exacta solicitada
      const allResults = response.data.results || response.data || [];
      const filteredResults = allResults.filter((slot: {fecha: string}) => slot.fecha === fecha);
      
      console.log(`[CitaService] ✅ Encontrados ${filteredResults.length} slots para ${fecha}`);
      
      if (filteredResults.length === 0 && allResults.length > 0) {
        console.log(`[CitaService] ❌ Sin slots para ${fecha}. Disponibles:`, [...new Set(allResults.map((s: {fecha: string}) => s.fecha))]);
      }
      
      return {
        results: filteredResults,
        count: filteredResults.length
      };
      
    } catch (error) {
      console.error('[CitaService] Error al obtener disponibilidad:', error);
      
      // Si es un error de axios con status 404, devolver array vacío
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('[CitaService] No se encontró disponibilidad (404), devolviendo array vacío');
        return {
          results: [],
          count: 0
        };
      }
      
      // Re-lanzar otros errores
      throw error;
    }
  }

  // Reservar slot de disponibilidad directamente
  async reservarSlot(disponibilidadId: number, citaData: CitaCreateData) {
    // Primero crear la cita asociando la disponibilidad
    const citaCompleta = {
      ...citaData,
      disponibilidad: disponibilidadId
    };

    const response = await api.post('/api/clinicas/citas/', citaCompleta);
    return response.data;
  }

  // Obtener citas del paciente actual
  async getMisCitas() {
    const response = await api.get('/api/clinicas/citas/mis_citas/');
    return response.data;
  }

  // Obtener próximas citas de un doctor
  async getCitasDoctor(doctorId: number, fecha?: string) {
    const params: CitaFilters = { doctor: doctorId };
    if (fecha) {
      params.fecha = fecha;
    }
    
    const response = await api.get('/api/clinicas/citas/', { params });
    return response.data;
  }
}

export const citaService = new CitaService();