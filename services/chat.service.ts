import { api } from '@/lib/axios';
import type { DniValidationResult, CitaRegistradaData, RegistrarCitaRequest, ChatbotInfo } from '@/types/chatbot';

class ChatService {
  private baseUrl = '/api/chatbot';

  /**
   * Obtiene información de especialidades, doctores, horarios y disponibilidades
   */
  async getInfo(): Promise<ChatbotInfo> {
    const response = await api.get(`${this.baseUrl}/info/`);
    return response.data;
  }

  /**
   * Valida un DNI y verifica si ya existe en el sistema
   */
  async validarDNI(dni: string): Promise<DniValidationResult> {
    try {
      const response = await api.post<DniValidationResult>(
        `${this.baseUrl}/validar-dni/`,
        { dni }
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: DniValidationResult } };
        if (axiosError.response?.data) {
          return axiosError.response.data;
        }
      }
      throw error;
    }
  }

  /**
   * Registra una cita médica
   */
  async registrarCita(data: RegistrarCitaRequest): Promise<CitaRegistradaData> {
    const response = await api.post<CitaRegistradaData>(
      `${this.baseUrl}/registrar-cita/`,
      data
    );
    return response.data;
  }

  /**
   * Valida el formato de un DNI (8 dígitos)
   */
  validarFormatoDNI(dni: string): { valido: boolean; error?: string } {
    if (!dni) {
      return { valido: false, error: 'El DNI es requerido.' };
    }
    
    if (dni.length !== 8) {
      return { valido: false, error: 'El DNI debe tener 8 dígitos.' };
    }
    
    if (!/^\d+$/.test(dni)) {
      return { valido: false, error: 'El DNI solo debe contener números.' };
    }
    
    return { valido: true };
  }

  /**
   * Valida formato de email
   */
  validarEmail(email: string): { valido: boolean; error?: string } {
    if (!email) {
      return { valido: false, error: 'El email es requerido.' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valido: false, error: 'El formato del email no es válido.' };
    }
    
    return { valido: true };
  }

  /**
   * Valida formato de celular (9 dígitos en Perú)
   */
  validarCelular(celular: string): { valido: boolean; error?: string } {
    if (!celular) {
      return { valido: false, error: 'El celular es requerido.' };
    }
    
    if (celular.length !== 9) {
      return { valido: false, error: 'El celular debe tener 9 dígitos.' };
    }
    
    if (!/^9\d{8}$/.test(celular)) {
      return { valido: false, error: 'El celular debe empezar con 9.' };
    }
    
    return { valido: true };
  }

  /**
   * Formatea la fecha para mostrar (DD/MM/YYYY)
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea la hora para mostrar (HH:MM)
   */
  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }
}

export const chatService = new ChatService();
