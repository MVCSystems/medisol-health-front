import { siteConfig } from "@/config";
import { useAuthStore } from "@/store/authStore";

// Clase para manejar conexiones WebSocket
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private connectionHandlers: (() => void)[] = [];
  private disconnectionHandlers: (() => void)[] = [];
  private url: string;

  constructor(path: string) {
    this.url = `${siteConfig.backend_url.replace('http', 'ws')}${path}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // Obtenemos el token de autenticación
      const { tokens } = useAuthStore.getState();
      const wsUrl = tokens.access 
        ? `${this.url}?token=${tokens.access}` 
        : this.url;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler());
        resolve();
      };

      this.socket.onclose = () => {
        this.disconnectionHandlers.forEach(handler => handler());
        
        // Reconexión automática
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.reconnectTimeout = setTimeout(() => {
            this.connect().catch(() => {});
          }, 3000 * this.reconnectAttempts);
        } else {
          reject(new Error('No se pudo establecer conexión WebSocket'));
        }
      };

      this.socket.onerror = (error) => {
        console.error('Error de WebSocket:', error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const messageType = data.type || 'message';
          
          const handlers = this.messageHandlers.get(messageType) || [];
          handlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };
    });
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public send(data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect().then(() => {
        this.socket?.send(JSON.stringify(data));
      }).catch(error => {
        console.error('Error al enviar mensaje WebSocket:', error);
      });
      return;
    }

    this.socket.send(JSON.stringify(data));
  }

  public onMessage(type: string, callback: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }

    const handlers = this.messageHandlers.get(type)!;
    handlers.push(callback);

    return () => {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  public onConnect(callback: () => void): () => void {
    this.connectionHandlers.push(callback);
    return () => {
      const index = this.connectionHandlers.indexOf(callback);
      if (index !== -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  public onDisconnect(callback: () => void): () => void {
    this.disconnectionHandlers.push(callback);
    return () => {
      const index = this.disconnectionHandlers.indexOf(callback);
      if (index !== -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }
}

// Instancia para el chatbot WebSocket
const chatbotWS = new WebSocketService('/ws/chatbot/');

export { WebSocketService, chatbotWS };
