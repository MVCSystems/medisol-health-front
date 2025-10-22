"use client"

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DisponibilidadCita } from '@/types/clinicas';

interface DisponibilidadCalendarProps {
  doctorId: number;
  fechaSeleccionada: string;
  onFechaSeleccionada: (fecha: string) => void;
  disponibilidades: DisponibilidadCita[];
  loading: boolean;
  onSlotSeleccionado: (slot: DisponibilidadCita) => void;
  citasExistentes?: DisponibilidadCita[];
}

export default function DisponibilidadCalendar({
  doctorId,
  fechaSeleccionada,
  onFechaSeleccionada,
  disponibilidades,
  loading,
  onSlotSeleccionado,
  citasExistentes = []
}: DisponibilidadCalendarProps) {
  const [mesActual, setMesActual] = useState(new Date());

  // Generar fechas del mes actual
  const generarFechasDelMes = () => {
    const fechas = [];
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    
    // Agregar días del mes anterior para completar la semana
    const diasAnterior = primerDia.getDay();
    for (let i = diasAnterior - 1; i >= 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - (i + 1));
      fechas.push({ fecha, esMesActual: false });
    }
    
    // Agregar días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
      fechas.push({ fecha, esMesActual: true });
    }
    
    // Agregar días del mes siguiente para completar la semana
    const diasRestantes = 42 - fechas.length; // 6 semanas x 7 días
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(ultimoDia);
      fecha.setDate(fecha.getDate() + i);
      fechas.push({ fecha, esMesActual: false });
    }
    
    return fechas;
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toISOString().split('T')[0];
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    setMesActual(prev => {
      const nuevaFecha = new Date(prev);
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1);
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1);
      }
      return nuevaFecha;
    });
  };

  const esFechaDisponible = (fecha: Date) => {
    const fechaStr = formatearFecha(fecha);
    return disponibilidades.some(d => d.fecha === fechaStr && d.disponible);
  };

  const esFechaPasada = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const fechas = generarFechasDelMes();
  // Verificar si un slot está ocupado
  const esSlotOcupado = (slot: DisponibilidadCita) => {
    return citasExistentes?.some(cita => 
      cita.fecha === slot.fecha && 
      cita.hora_inicio === slot.hora_inicio
    ) ?? false;
  };

  const slotsDelDia = disponibilidades.filter(d => 
    d.fecha === fechaSeleccionada && (d.disponible || esSlotOcupado(d))
  );

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Navegación del calendario */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => cambiarMes('anterior')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cambiarMes('siguiente')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {diasSemana.map(dia => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {dia}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {fechas.map(({ fecha, esMesActual }, index) => {
              const fechaStr = formatearFecha(fecha);
              const esSeleccionada = fechaSeleccionada === fechaStr;
              const esDisponible = esFechaDisponible(fecha);
              const esPasada = esFechaPasada(fecha);
              
              return (
                <button
                  key={index}
                  className={`
                    p-2 text-sm rounded-lg transition-all relative border
                    ${!esMesActual ? 'text-muted-foreground/50 border-transparent' : 'text-foreground border-transparent'}
                    ${esPasada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-border'}
                    ${esSeleccionada ? 'bg-primary text-primary-foreground shadow-lg border-primary' : ''}
                    ${esDisponible && !esSeleccionada ? 'bg-secondary/20 text-foreground border-secondary/50' : ''}
                    ${!esDisponible && !esPasada && esMesActual ? 'bg-muted text-muted-foreground' : ''}
                  `}
                  disabled={esPasada || !esMesActual}
                  onClick={() => {
                    if (!esPasada && esMesActual) {
                      onFechaSeleccionada(fechaStr);
                    }
                  }}
                >
                  {fecha.getDate()}
                  {esDisponible && !esSeleccionada && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Horarios disponibles del día seleccionado */}
      {fechaSeleccionada && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-foreground">
                Horarios disponibles - {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
            </div>
            

            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-muted-foreground">Cargando horarios disponibles...</p>
              </div>
            ) : slotsDelDia.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-muted/50 border border-border rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No hay horarios disponibles</p>
                  <p className="text-muted-foreground text-sm">
                    El doctor no tiene horarios configurados para esta fecha o todos los slots están ocupados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {slotsDelDia.map((slot) => {
                  const ocupado = esSlotOcupado(slot);
                  return (
                    <Button
                      key={slot.id}
                      variant="outline"
                      size="sm"
                      className={`
                        h-auto p-3 flex flex-col items-center gap-1 border-border transition-all duration-200
                        ${ocupado 
                          ? 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed hover:bg-red-50 hover:text-red-500 hover:border-red-200' 
                          : 'bg-card text-card-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary'
                        }
                      `}
                      onClick={() => !ocupado && onSlotSeleccionado(slot)}
                      disabled={ocupado}
                    >
                      <span className="font-medium text-foreground">
                        {formatearHora(slot.hora_inicio)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatearHora(slot.hora_fin)}
                      </span>
                      {ocupado && (
                        <span className="text-xs text-red-500 mt-1">No disponible</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-card border border-border rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
          <span>Ya reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-50 rounded"></div>
          <span>Sin horarios</span>
        </div>
      </div>
    </div>
  );
}