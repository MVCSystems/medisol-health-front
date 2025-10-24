// Definir tipos para los mensajes y el estado del chat
export type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
};

export type ApiResponse = {
  respuesta: string;
  sugerencias?: string[];
  contexto_actualizado?: Record<string, unknown>;
};

export type DniValidationResult = {
  valido: boolean;
  existe: boolean;
  usuario?: {
    nombres: string;
    apellidos: string;
    email: string;
    celular?: string;
  };
  mensaje: string;
  error?: string;
  sugerencias?: string[];
};

export type CitaRegistradaData = {
  mensaje?: string;
  cita_id?: number;
  paciente?: string;
  doctor?: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  usuario_nuevo?: boolean;
  usuario?: string;
  contraseña?: string;
  nota?: string;
};

export type RegistrarCitaRequest = {
  dni: string;
  nombres?: string;
  apellidos?: string;
  celular?: string;
  email?: string;
  genero?: string;
  doctor_id: number;
  fecha: string;
  hora_inicio: string;
  motivo: string;
};

export type ChatbotInfo = {
  especialidades: Array<{
    id: number;
    nombre: string;
    descripcion: string;
  }>;
  doctores: Array<{
    id: number;
    nombres: string;
    apellidos: string;
    clinica_id: number;
    titulo: string;
    precio_consulta_base: string;
  }>;
  horarios: Array<{
    id: number;
    doctor_id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    duracion_cita: number;
  }>;
  disponibilidades: Array<{
    id: number;
    doctor_id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  }>;
};
