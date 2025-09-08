"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles, MessageCircle, Zap } from "lucide-react"
import { chatbotWS } from "@/lib/websocket"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  suggestions?: string[]
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [connected, setConnected] = useState(false)
  const [context, setContext] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior })
    }
  }

  // Autoscroll solo si el usuario está cerca del final
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom(messages.length < 3 ? 'auto' : 'smooth')
    }
  }, [messages, autoScroll])

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const el = messagesContainerRef.current
    const distanciaAbajo = el.scrollHeight - (el.scrollTop + el.clientHeight)
    // Si está a menos de 80px del fondo, mantenemos autoscroll
    setAutoScroll(distanciaAbajo < 80)
  }

  // Conectar y configurar WebSocket cuando el componente se monta
  useEffect(() => {
    // Conectar al WebSocket
    chatbotWS.connect()
      .then(() => {
        console.log("WebSocket conectado");
        setConnected(true);
      })
      .catch(error => {
        console.error("Error al conectar WebSocket:", error);
      });

    // Manejar mensajes recibidos
  const unsubscribeWelcome = chatbotWS.onMessage('bienvenida', (data) => {
      setMessages([{
        id: Date.now().toString(),
        content: data.respuesta,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: data.sugerencias
      }]);
    });

  const unsubscribeMessage = chatbotWS.onMessage('mensaje', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.respuesta,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: data.sugerencias
      }]);
      
      // Actualizar contexto si existe
      if (data.contexto_actualizado) {
        setContext(data.contexto_actualizado);
      }
    });

    const unsubscribeInfo = chatbotWS.onMessage('info', (data) => {
      setIsTyping(false);
      // Manejar la información recibida (especialidades, doctores, etc.)
      console.log("Información recibida:", data);
      
      // Por ejemplo, mostrar un mensaje con las especialidades
      if (data.data?.especialidades?.length > 0) {
        const especialidades = data.data.especialidades.map((e: any) => e.nombre).join(", ");
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `Especialidades disponibles: ${especialidades}`,
          sender: 'bot',
          timestamp: new Date(),
        }]);
      }
    });

  const unsubscribeCitaRegistrada = chatbotWS.onMessage('cita_registrada', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `¡Cita registrada exitosamente! Detalles:\nPaciente: ${data.data.paciente}\nDoctor: ${data.data.doctor}\nFecha: ${data.data.fecha}\nHora: ${data.data.hora_inicio}`,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    });

    const unsubscribeError = chatbotWS.onMessage('error', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Error: ${data.mensaje}`,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    });

    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribeWelcome();
      unsubscribeMessage();
      unsubscribeInfo();
      unsubscribeCitaRegistrada();
      unsubscribeError();
      chatbotWS.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !connected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Enviar mensaje al WebSocket
    chatbotWS.send({
      mensaje: inputValue,
      contexto: context,
      accion: 'mensaje'
    });
  };

  const handleRequestInfo = () => {
    setIsTyping(true);
    chatbotWS.send({
      accion: 'obtener_info',
      contexto: context
    });
  };

  const handleRegistrarCita = (datos: any) => {
    setIsTyping(true);
    chatbotWS.send({
      accion: 'registrar_cita',
      ...datos,
      contexto: context
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="min-h-screen gradient-bg animate-gradient">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary/20 rounded-full animate-bounce-gentle" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-primary/10 rounded-full animate-float" />
        <div className="absolute top-1/3 right-10 w-8 h-8 bg-accent/30 rounded-full animate-bounce-gentle" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-left">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Chat Bot AI
          </h1>
          <p className="text-muted-foreground text-lg">Tu asistente inteligente siempre disponible</p>
        </div>

        {/* Chat Container */}
        <Card className="glass-effect border-0 shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarFallback className="bg-white/20 text-white">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Asistente AI</h3>
                <div className="text-sm text-white/80 flex items-center gap-1">
                  <span className={`w-2 h-2 ${connected ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse inline-block`} />
                  <span>{connected ? 'En línea' : 'Conectando...'}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <MessageCircle className="w-5 h-5 text-white/60" />
                <Zap className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/80"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} ${
                  message.sender === "user" ? "animate-slide-in-right" : "animate-slide-in-left"
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-md"
                      : "bg-card border border-border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-secondary text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Sugerencias del último mensaje */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="flex flex-wrap gap-2 justify-start">
                {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-card/50 text-sm text-foreground hover:bg-primary/10"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-slide-in-left">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={!connected}
                  className="border-2 border-border/50 focus:border-accent rounded-xl px-4 py-3 text-sm resize-none transition-all duration-200"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || !connected}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl px-6 py-3 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center animate-slide-in-right">
          <Button
            variant="outline"
            onClick={() => handleRequestInfo()}
            disabled={isTyping || !connected}
            className="glass-effect border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200"
          >
            Ver especialidades
          </Button>
          <Button
            variant="outline"
            onClick={() => setInputValue("Quiero reservar una cita")}
            disabled={isTyping || !connected}
            className="glass-effect border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200"
          >
            Reservar cita
          </Button>
          <Button
            variant="outline"
            onClick={() => setInputValue("¿Qué doctores están disponibles?")}
            disabled={isTyping || !connected}
            className="glass-effect border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200"
          >
            Doctores disponibles
          </Button>
        </div>
      </div>
    </div>
  )
}
