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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

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
        console.log("WebSocket conectado");
        setConnected(true);
      })
      .catch((error) => {
        console.error("Error al conectar WebSocket:", error);
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
      console.log("Información recibida:", response);

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
      accion: "mensaje",
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
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={!connected}
                  className="border-2 border-border/50 dark:border-gray-700 focus:border-accent dark:focus:border-accent rounded-xl px-5 py-4 text-base resize-none transition-all duration-200 bg-background dark:bg-background text-foreground dark:text-foreground"
                />
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
