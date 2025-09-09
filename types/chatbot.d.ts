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
  contexto_actualizado?: any;
};
