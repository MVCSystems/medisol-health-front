"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash,
  Smile,

} from "lucide-react";
// ...existing code...
import { chatbotWS } from "@/lib/websocket";
import type { DniValidationResult } from "@/types/chatbot";
import { 
  validarDNI, 
  validarNombre, 
  validarCelular, 
  validarEmail, 
  // validarMotivo,
  formatearDNI,
  formatearCelular,
  formatearNombre,
  formatearEmail
} from "@/lib/validations";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}

interface EspecialidadData {
  nombre: string;
}

interface ChatbotApiResponse {
  respuesta: string;
  sugerencias?: string[];
  contexto_actualizado?: Record<string, unknown>;
  data?: {
    especialidades?: EspecialidadData[];
    paciente?: string;
    doctor?: string;
    fecha?: string;
    hora_inicio?: string;
  };
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [inputError, setInputError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 🎨 Función para obtener placeholder inteligente basado en el último mensaje
  const getSmartPlaceholder = (): string => {
    if (messages.length === 0) return "Escribe tu mensaje aquí...";
    
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
    if (!lastBotMessage) return "Escribe tu mensaje aquí...";
    
    const content = lastBotMessage.content.toLowerCase();
    
    // Detectar qué está pidiendo el bot
    if (content.includes('dni') && !context.dni_validado) {
      return "Ingresa tu DNI (8 dígitos)...";
    } else if (content.includes('nombre') && !content.includes('apellido')) {
      return "Ingresa tus nombres...";
    } else if (content.includes('apellido')) {
      return "Ingresa tus apellidos...";
    } else if (content.includes('celular') || content.includes('teléfono')) {
      return "Ingresa tu celular (ej: 987654321)...";
    } else if (content.includes('correo') || content.includes('email')) {
      return "Ingresa tu email (ej: usuario@correo.com)...";
    } else if (content.includes('motivo')) {
      return "Describe el motivo de tu cita...";
    } else if (content.includes('fecha')) {
      return "Ingresa la fecha (DD/MM/YYYY)...";
    } else if (content.includes('hora')) {
      return "Ingresa la hora (HH:MM)...";
    }
    
    return "Escribe tu mensaje aquí...";
  };

  // ✅ Función para validar en tiempo real mientras el usuario escribe
  const getInputValidationStatus = (value: string): { valid: boolean; message: string } => {
    if (!value.trim()) return { valid: false, message: "" };

    // Detectar tipo de input basado en el contenido
    if (/^\d+$/.test(value)) {
      // Solo números - puede ser DNI o celular
      if (value.length === 8) {
        const result = validarDNI(value);
        return { valid: result.valido, message: result.error || "✓ DNI válido" };
      } else if (value.length >= 7 && value.length <= 15) {
        const result = validarCelular(value);
        return { valid: result.valido, message: result.error || "✓ Celular válido" };
      }
      return { valid: false, message: "" };
    } else if (value.includes('@')) {
      // Email
      const result = validarEmail(value);
      return { valid: result.valido, message: result.error || "✓ Email válido" };
    } else if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value) && value.length >= 2) {
      // Nombre
      const result = validarNombre(value);
      return { valid: result.valido, message: result.error || "✓ Nombre válido" };
    }
    
    return { valid: false, message: "" };
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  // Autoscroll solo si el usuario está cerca del final
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom(messages.length < 3 ? "auto" : "smooth");
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    const distanciaAbajo = el.scrollHeight - (el.scrollTop + el.clientHeight);
    // Si está a menos de 80px del fondo, mantenemos autoscroll
    setAutoScroll(distanciaAbajo < 80);
  };

  // Conectar y configurar WebSocket cuando el componente se monta
  useEffect(() => {
    // Conectar al WebSocket
    chatbotWS
      .connect()
      .then(() => {
        setConnected(true);
      })
      .catch((error) => {
        console.error("Error al conectar WebSocket:", error);
        setConnected(false);
        // Agregar mensaje informativo si falla la conexión
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "⚠️ El servidor está iniciando, por favor espera unos segundos...",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      });

    // Manejar eventos de conexión
    const unsubscribeConnect = chatbotWS.onConnect(() => {
      setConnected(true);
      console.log("✅ WebSocket conectado");
    });

    const unsubscribeDisconnect = chatbotWS.onDisconnect(() => {
      setConnected(false);
      console.log("❌ WebSocket desconectado");
    });

    // Manejar mensajes recibidos
    const unsubscribeWelcome = chatbotWS.onMessage("bienvenida", (data) => {
      const response = data as unknown as ChatbotApiResponse;
      setMessages([
        {
          id: Date.now().toString(),
          content: response.respuesta,
          sender: "bot",
          timestamp: new Date(),
          suggestions: response.sugerencias,
        },
      ]);
    });

    const unsubscribeMessage = chatbotWS.onMessage("mensaje", (data) => {
      const response = data as unknown as ChatbotApiResponse;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.respuesta,
          sender: "bot",
          timestamp: new Date(),
          suggestions: response.sugerencias,
        },
      ]);

      // Actualizar contexto si existe
      if (response.contexto_actualizado) {
        setContext(response.contexto_actualizado);
      }
    });

    const unsubscribeInfo = chatbotWS.onMessage("info", (data) => {
      const response = data as unknown as ChatbotApiResponse;
      setIsTyping(false);
      // Manejar la información recibida (especialidades, doctores, etc.)

      // Por ejemplo, mostrar un mensaje con las especialidades
      if (response.data?.especialidades && response.data.especialidades.length > 0) {
        const especialidades = response.data.especialidades
          .map((e: EspecialidadData) => e.nombre)
          .join(", ");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `Especialidades disponibles: ${especialidades}`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    });

    const unsubscribeCitaRegistrada = chatbotWS.onMessage(
      "cita_registrada",
      (data) => {
        const response = data as unknown as ChatbotApiResponse;
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: `¡Cita registrada exitosamente! Detalles:\nPaciente: ${response.data?.paciente || 'N/A'}\nDoctor: ${response.data?.doctor || 'N/A'}\nFecha: ${response.data?.fecha || 'N/A'}\nHora: ${response.data?.hora_inicio || 'N/A'}`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    );

    const unsubscribeError = chatbotWS.onMessage("error", (data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Error: ${data.mensaje}`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    });

    const unsubscribeDniValidado = chatbotWS.onMessage("dni_validado", (data: Record<string, unknown>) => {
      setIsTyping(false);
      
      // El backend envía el resultado dentro de 'data'
      const validationResult = (data.data || data) as unknown as DniValidationResult;
      let responseMessage = validationResult.mensaje || "DNI validado";
      let sugerencias = validationResult.sugerencias;
      
      // Si el usuario existe, mostramos sus datos y preguntamos para quién es la cita
      if (validationResult.existe && validationResult.usuario) {
        const { nombres, apellidos, email, celular } = validationResult.usuario;
        responseMessage = `¡Perfecto! Encontré tu registro:\n\nNombres: ${nombres}\nApellidos: ${apellidos}\nEmail: ${email}${celular ? `\nCelular: ${celular}` : ''}\n\n¿La cita es para ti o para otra persona?`;
        sugerencias = ["Para mí", "Para otra persona"];
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: responseMessage,
          sender: "bot",
          timestamp: new Date(),
          suggestions: sugerencias,
        },
      ]);

      // Actualizar contexto con la información del usuario
      if (validationResult.existe && validationResult.usuario) {
        const usuario = validationResult.usuario;
        setContext((prev) => ({
          ...prev,
          dni_validado: true,
          usuario_existente: true,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          celular: usuario.celular,
          flujo_cita: {
            fase: 'esperando_confirmacion_usuario',
            data: {
              dni_usuario: prev.dni || '',
              nombres: usuario.nombres,
              apellidos: usuario.apellidos,
              email: usuario.email,
              celular: usuario.celular,
            }
          }
        }));
      } else if (validationResult.valido && !validationResult.existe) {
        // DNI válido pero usuario no existe
        setContext((prev) => ({
          ...prev,
          dni_validado: true,
          usuario_existente: false,
          flujo_cita: {
            fase: 'solicitando_datos_usuario',
            data: {}
          }
        }));
      }
    });

    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeWelcome();
      unsubscribeMessage();
      unsubscribeInfo();
      unsubscribeCitaRegistrada();
      unsubscribeError();
      unsubscribeDniValidado();
      chatbotWS.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !connected) return;

    const mensaje = inputValue.trim();
    let mensajeProcesado = mensaje;
    
    // 🔒 VALIDACIÓN Y FORMATEO inteligente según el tipo de dato
    // Detectar si estamos esperando un DNI
    const esperaDNI = !context.dni_validado && !context.usuario_existente;
    const esDNI = /^\d{8}$/.test(mensaje);
    
    // Validar DNI si detectamos que es uno
    if (esDNI && esperaDNI) {
      const validacion = validarDNI(mensaje);
      if (!validacion.valido) {
        setInputError(validacion.error || "DNI inválido");
        setTimeout(() => setInputError(""), 3000);
        return;
      }
      mensajeProcesado = formatearDNI(mensaje);
    }
    // Validar nombres si detectamos solo letras y espacios (al menos 2 palabras)
    else if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/.test(mensaje) && mensaje.includes(' ')) {
      const validacion = validarNombre(mensaje);
      if (!validacion.valido) {
        setInputError(validacion.error || "Nombre inválido");
        setTimeout(() => setInputError(""), 3000);
        return;
      }
      mensajeProcesado = formatearNombre(mensaje);
    }
    // Validar celular si detectamos solo números (7-15 dígitos)
    else if (/^\d{7,15}$/.test(mensaje.replace(/\D/g, ''))) {
      const soloNumeros = mensaje.replace(/\D/g, '');
      if (soloNumeros.length >= 7) {
        const validacion = validarCelular(soloNumeros);
        if (!validacion.valido) {
          setInputError(validacion.error || "Celular inválido");
          setTimeout(() => setInputError(""), 3000);
          return;
        }
        mensajeProcesado = formatearCelular(soloNumeros);
      }
    }
    // Validar email si detectamos @ en el mensaje
    else if (mensaje.includes('@')) {
      const validacion = validarEmail(mensaje);
      if (!validacion.valido) {
        setInputError(validacion.error || "Email inválido");
        setTimeout(() => setInputError(""), 3000);
        return;
      }
      mensajeProcesado = formatearEmail(mensaje);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: mensaje,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setInputError("");
    setIsTyping(true);

    // Enviar mensaje al WebSocket
    if (esDNI && esperaDNI) {
      // Guardar DNI en el contexto antes de validar
      const nuevoContexto = { ...context, dni: mensajeProcesado };
      setContext(nuevoContexto);
      
      // Validar DNI
      chatbotWS.send({
        accion: "validar_dni",
        dni: mensajeProcesado,
        contexto: nuevoContexto,
      });
    } else {
      // Mensaje normal
      chatbotWS.send({
        mensaje: mensajeProcesado,
        contexto: context,
        accion: "mensaje",
      });
    }
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

  // Valoración del chat
  const [showRating, setShowRating] = useState(false);
  const [ratingStep, setRatingStep] = useState<
    "score" | "comment" | "done"
  >("score");

  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");

  const handleOpenRating = () => {
    setShowRating(true);
    setRatingStep("score");
    setSelectedScore(null);
    setRatingComment("");
  };

  const handleSelectScore = (score: number) => {
    setSelectedScore(score);
    setRatingStep("comment");
  };
      const handleSendRating = () => {
        setRatingStep("done");
        setTimeout(() => setShowRating(false), 1500);
      };
      const handleClearChat = () => {
        setMessages([]);
      };
      const handleCloseRating = () => {
        setShowRating(false);
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
                <Bot className="w-8 h-8 text-primary-foreground drop-shadow" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-secondary dark:bg-secondary/80 rounded-full flex items-center justify-center shadow animate-bounce">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 tracking-tight drop-shadow">
            Chat Bot AI
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 text-lg font-medium">
            Tu asistente inteligente siempre disponible
          </p>
        </div>

        {/* Chat Container */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-card dark:bg-background dark:shadow-gray-800 transition-colors duration-300">
          {/* Chat Header */}
          <div className="bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-accent p-5 text-primary-foreground rounded-t-3xl shadow-md">
            <div className="flex items-center gap-4">
              <Avatar className="w-11 h-11 border-2 border-white/30 shadow">
                <AvatarFallback className="bg-background/20 dark:bg-gray-800 text-primary-foreground">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">Asistente AI</h3>
                <div className="text-sm text-primary-foreground/80 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 ${
                      connected ? "bg-green-400" : "bg-red-400"
                    } rounded-full animate-pulse inline-block`}
                  />
                  <span>{connected ? "En línea" : "Conectando..."}</span>
                </div>
              </div>
              {/* Iconos funcionales */}
              <div className="ml-auto flex gap-3">
                <button
                  type="button"
                  title="Valorar"
                  onClick={handleOpenRating}
                  className="p-2 rounded-full hover:bg-background/20 dark:hover:bg-gray-800 transition"
                >
                  <Smile className="w-6 h-6 text-primary-foreground" />
                </button>
                <button
                  type="button"
                  title="Limpiar chat"
                  onClick={handleClearChat}
                  className="p-2 rounded-full hover:bg-background/20 dark:hover:bg-gray-800 transition"
                >
                  <Trash className="w-5 h-5 text-primary-foreground/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-96 overflow-y-auto p-6 space-y-5 bg-background dark:bg-background transition-colors duration-300"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } ${
                  message.sender === "user"
                    ? "animate-slide-in-right"
                    : "animate-slide-in-left"
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-primary dark:bg-gradient-to-br dark:from-primary dark:to-accent text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg transition-all duration-200 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-bl-md"
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-secondary dark:bg-secondary/80 text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Sugerencias del último mensaje */}
            {messages.length > 0 &&
              messages[messages.length - 1].suggestions && (
                <div className="flex flex-wrap gap-2 justify-start mt-2">
                  {messages[messages.length - 1].suggestions!.map(
                    (suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-card dark:bg-gray-800 text-sm text-foreground dark:text-foreground hover:bg-primary/20 dark:hover:bg-primary/30 border-accent/30 rounded-xl shadow"
                      >
                        {suggestion}
                      </Button>
                    )
                  )}
                </div>
              )}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-slide-in-left">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-primary dark:bg-gradient-to-br dark:from-primary dark:to-accent text-primary-foreground">
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
          <div className="p-5 bg-card dark:bg-background/80 backdrop-blur-md border-t border-border dark:border-gray-700 rounded-b-3xl transition-colors duration-300">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);
                    setInputError(""); // Limpiar error al escribir
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={getSmartPlaceholder()}
                  disabled={!connected}
                  className={`border-2 ${
                    inputError 
                      ? 'border-red-500 dark:border-red-400' 
                      : inputValue.trim() && getInputValidationStatus(inputValue).valid
                        ? 'border-green-500 dark:border-green-400'
                        : 'border-border/50 dark:border-gray-700'
                  } focus:border-accent dark:focus:border-accent rounded-xl px-5 py-4 text-base resize-none transition-all duration-200 bg-background dark:bg-background text-foreground dark:text-foreground`}
                />
                {inputError && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 animate-slide-in-left">
                    ⚠️ {inputError}
                  </p>
                )}
                {!inputError && inputValue.trim() && getInputValidationStatus(inputValue).message && (
                  <p className={`text-sm mt-2 animate-slide-in-left ${
                    getInputValidationStatus(inputValue).valid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {getInputValidationStatus(inputValue).message}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || !connected}
                className="bg-primary hover:bg-primary/90 dark:bg-gradient-to-r dark:from-primary dark:to-accent text-primary-foreground rounded-xl px-7 py-4 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="bg-background dark:bg-gray-950 rounded-3xl shadow-2xl px-10 py-12 w-full max-w-xl relative flex flex-col items-center border border-gray-200 dark:border-gray-800">
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-primary dark:hover:text-accent text-3xl font-bold transition"
              onClick={handleCloseRating}
              aria-label="Cerrar"
            >
              ×
            </button>
            {ratingStep === "score" && (
              <div className="flex flex-col items-center gap-6 w-full">
                <span className="font-semibold text-2xl mb-2 text-gray-900 dark:text-gray-100">
                  Califica tu experiencia
                </span>
                <div className="flex gap-2 items-center w-full justify-center flex-nowrap overflow-x-auto pb-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                    <button
                      key={score}
                      onClick={() => handleSelectScore(score)}
                      className={`px-3 py-2 rounded-full border font-bold text-base focus:outline-none transition-all duration-150 min-w-[2.2rem] shadow-sm ${
                        selectedScore === score
                          ? "bg-primary text-primary-foreground scale-110 shadow-lg border-primary"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-foreground border-gray-300 dark:border-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20"
                      }`}
                      style={{ boxShadow: selectedScore === score ? "0 2px 8px rgba(0,0,0,0.12)" : undefined }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex w-full justify-between px-2">
                  <span className="text-base text-gray-400">Deficiente</span>
                  <span className="text-base text-gray-400">Excelente</span>
                </div>
              </div>
            )}
            {ratingStep === "comment" && (
              <div className="flex flex-col gap-6 w-full">
                <span className="font-semibold text-xl mb-2 text-gray-900 dark:text-gray-100">
                ¿Cómo podemos mejorar tu experiencia?
                </span>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-foreground dark:text-primary-foreground text-lg focus:ring-2 focus:ring-primary/40"
                  rows={4}
                  placeholder="Escribe tu comentario..."
                />
                <Button onClick={handleSendRating} className="w-full text-lg py-3 bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90">
                  Enviar
                </Button>
              </div>
            )}
            {ratingStep === "done" && (
              <div className="flex flex-col items-center gap-6">
                <span className="text-3xl text-primary dark:text-accent font-bold">¡Gracias por tu valoración!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
