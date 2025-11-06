import { siteConfig } from "@/config";
import { useAuthStore } from "@/store/authStore";

type MessageHandler = (data: Record<string, unknown>) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly connectionTimeout = 10000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionTimeoutId: NodeJS.Timeout | null = null;
  private messageHandlers = new Map<string, MessageHandler[]>();
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  private readonly url: string;
  private shouldReconnect = true;

  constructor(path: string) {
    // Detectar si el backend usa https para usar wss://
    const backendUrl = siteConfig.backend_url;
    const isHttps = backendUrl.startsWith('https');
    const wsProtocol = isHttps ? 'wss' : 'ws';
    // Reemplazar http/https con ws/wss
    this.url = `${backendUrl.replace(/^https?:/, `${wsProtocol}:`)}${path}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.shouldReconnect = true;
      const { tokens } = useAuthStore.getState();
      const wsUrl = tokens.access ? `${this.url}?token=${tokens.access}` : this.url;

      this.socket = new WebSocket(wsUrl);

      this.connectionTimeoutId = setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          this.socket?.close();
          reject(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.socket.onopen = () => {
        this.clearConnectionTimeout();
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler());
        resolve();
      };

      this.socket.onclose = () => {
        this.clearConnectionTimeout();
        this.disconnectionHandlers.forEach(handler => handler());
        
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = 3000 * this.reconnectAttempts;
          this.reconnectTimeout = setTimeout(() => {
            this.connect().catch(() => {});
          }, delay);
        }
      };

      this.socket.onerror = () => {
        this.clearConnectionTimeout();
        reject(new Error('WebSocket connection failed'));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(data.type || 'message') || [];
          handlers.forEach(handler => handler(data));
        } catch {
          // Ignore parse errors
        }
      };
    });
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.clearTimeouts();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public send(data: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      this.connect()
        .then(() => this.socket?.send(JSON.stringify(data)))
        .catch(() => {});
    }
  }

  public onMessage(type: string, callback: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(callback);
    
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index !== -1) handlers.splice(index, 1);
      }
    };
  }

  public onConnect(callback: ConnectionHandler): () => void {
    this.connectionHandlers.push(callback);
    return () => this.removeHandler(this.connectionHandlers, callback);
  }

  public onDisconnect(callback: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(callback);
    return () => this.removeHandler(this.disconnectionHandlers, callback);
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
  }

  private clearTimeouts(): void {
    this.clearConnectionTimeout();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private removeHandler(handlers: ConnectionHandler[], callback: ConnectionHandler): void {
    const index = handlers.indexOf(callback);
    if (index !== -1) handlers.splice(index, 1);
  }
}

export const chatbotWS = new WebSocketService('/ws/chatbot/');
