"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { horarioService } from '@/services/horario.service';
import { formatearFecha } from '@/lib/utils';
import type { DisponibilidadCita } from '@/types/clinicas';

interface DisponibilidadViewProps {
  doctorId: number;
  doctorName: string;
}

export default function DisponibilidadView({ doctorId, doctorName }: DisponibilidadViewProps) {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadCita[]>([]);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const cargarDisponibilidad = useCallback(async () => {
    setLoading(true);
    try {
      const fechaInicio = new Date(fechaActual);
      fechaInicio.setDate(fechaActual.getDate() - fechaActual.getDay()); // Inicio de semana
      
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaInicio.getDate() + 6); // Fin de semana
      
      const response = await horarioService.getDisponibilidad({
        doctor: doctorId,
        fecha: formatearFecha(fechaInicio)
      });
      
      setDisponibilidad(response.results || []);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, fechaActual]);

  useEffect(() => {
    if (doctorId) {
      cargarDisponibilidad();
    }
  }, [doctorId, cargarDisponibilidad]);

  const formatearFechaDisplay = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(fechaActual);
    if (direccion === 'anterior') {
      nuevaFecha.setDate(fechaActual.getDate() - 7);
    } else {
      nuevaFecha.setDate(fechaActual.getDate() + 7);
    }
    setFechaActual(nuevaFecha);
  };

  const agruparPorFecha = () => {
    const grupos: { [fecha: string]: DisponibilidadCita[] } = {};
    
    disponibilidad.forEach(slot => {
      if (!grupos[slot.fecha]) {
        grupos[slot.fecha] = [];
      }
      grupos[slot.fecha].push(slot);
    });

    return grupos;
  };

  const gruposDisponibilidad = agruparPorFecha();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Disponibilidad - {doctorName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarSemana('anterior')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cargarDisponibilidad}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarSemana('siguiente')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : Object.keys(gruposDisponibilidad).length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay disponibilidad para esta semana</p>
            <p className="text-sm text-gray-500 mt-2">
              Genera horarios primero para crear slots de disponibilidad
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(gruposDisponibilidad)
              .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
              .map(([fecha, slots]) => (
                <div key={fecha} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 capitalize">
                    {formatearFechaDisplay(fecha)}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {slots
                      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-2 rounded-lg text-center text-sm border ${
                            slot.disponible
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          <div className="font-medium">
                            {formatearHora(slot.hora_inicio)}
                          </div>
                          <Badge
                            variant={slot.disponible ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {slot.disponible ? "Libre" : "Ocupado"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
