
import { api } from '@/lib/axios';

export class ChatbotApiService {
  baseUrl = 'http://localhost:8000/chatbot'; // Ajusta el puerto si es necesario

  async getInfo() {
    try {
  const res = await api.get(`${this.baseUrl}/info/`);
      return res.data;
    } catch (error) {
      throw new Error('Error al obtener información del chatbot');
    }
  }

  async registrarCita(data: {
    nombres: string;
    apellidos: string;
    dni: string;
    celular: string;
    doctor_id: number;
    fecha: string;
    hora_inicio: string;
    motivo: string;
  }) {
    try {
  const res = await api.post(`${this.baseUrl}/registrar-cita/`, data);
      return res.data;
    } catch (error) {
      throw new Error('Error al registrar la cita');
    }
  }
}

export const chatbotApiService = new ChatbotApiService();
