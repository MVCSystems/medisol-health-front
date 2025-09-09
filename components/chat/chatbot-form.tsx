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
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Elementos decorativos flotantes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-24 left-12 w-20 h-20 bg-accent/20 dark:bg-accent/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-48 right-24 w-14 h-14 bg-secondary/20 dark:bg-secondary/30 rounded-full blur-lg animate-bounce-gentle" />
        <div className="absolute bottom-36 left-1/3 w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/2 right-16 w-10 h-10 bg-accent/30 dark:bg-accent/40 rounded-full blur-md animate-bounce-gentle" />
      </div>
  
      <div className="container mx-auto px-4 py-10 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary dark:bg-gradient-to-br dark:from-primary dark:to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Bot className="w-8 h-8 text-white drop-shadow" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-secondary dark:bg-secondary/80 rounded-full flex items-center justify-center shadow animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 tracking-tight drop-shadow">
            Chat Bot AI
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 text-lg font-medium">Tu asistente inteligente siempre disponible</p>
        </div>
  
        {/* Chat Container */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-card dark:bg-gray-900 dark:shadow-gray-800 transition-colors duration-300">
          {/* Chat Header */}
          <div className="bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-accent p-5 text-white rounded-t-3xl shadow-md">
            <div className="flex items-center gap-4">
              <Avatar className="w-11 h-11 border-2 border-white/30 shadow">
                <AvatarFallback className="bg-white/20 dark:bg-gray-800 text-white">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">Asistente AI</h3>
                <div className="text-sm text-white/80 flex items-center gap-2">
                  <span className={`w-2 h-2 ${connected ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse inline-block`} />
                  <span>{connected ? 'En línea' : 'Conectando...'}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-3">
                <MessageCircle className="w-5 h-5 text-white/70" />
                <Zap className="w-5 h-5 text-white/70" />
              </div>
            </div>
          </div>
  
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-96 overflow-y-auto p-6 space-y-5 bg-background dark:bg-gray-900 transition-colors duration-300"
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
                    <AvatarFallback className="bg-primary dark:bg-gradient-to-br dark:from-primary dark:to-accent text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
  
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg transition-all duration-200 ${
                    message.sender === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-bl-md"
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground dark:text-gray-400"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
  
                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-secondary dark:bg-secondary/80 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
  
            {/* Sugerencias del último mensaje */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="flex flex-wrap gap-2 justify-start mt-2">
                {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-card dark:bg-gray-800 text-sm text-foreground dark:text-gray-200 hover:bg-primary/20 dark:hover:bg-primary/30 border-accent/30 rounded-xl shadow"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-slide-in-left">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-primary dark:bg-gradient-to-br dark:from-primary dark:to-accent text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 px-5 py-4 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground dark:bg-gray-400 rounded-full animate-typing" />
                    <div
                      className="w-2 h-2 bg-muted-foreground dark:bg-gray-400 rounded-full animate-typing"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground dark:bg-gray-400 rounded-full animate-typing"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
  
          {/* Input Area */}
          <div className="p-5 bg-card dark:bg-gray-900/80 backdrop-blur-md border-t border-border dark:border-gray-700 rounded-b-3xl transition-colors duration-300">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={!connected}
                  className="border-2 border-border/50 dark:border-gray-700 focus:border-accent dark:focus:border-accent rounded-xl px-5 py-4 text-base resize-none transition-all duration-200 bg-white dark:bg-gray-900 text-black dark:text-gray-200"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || !connected}
                className="bg-primary hover:bg-primary/90 dark:bg-gradient-to-r dark:from-primary dark:to-accent text-white rounded-xl px-7 py-4 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
