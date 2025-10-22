"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { horarioService } from '@/services/horario.service';
import { doctorService } from '@/services/doctor.service';
import { formatearFecha } from '@/lib/utils';
import type { Doctor, HorarioDoctor } from '@/types/clinicas';

const DIAS_SEMANA = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' }
];

export default function GestionHorarios() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<HorarioDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const cargarDoctores = useCallback(async () => {
    try {
      const response = await doctorService.getAll();
      setDoctores(response.results || []);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDoctores();
  }, [cargarDoctores]);

  const cargarHorariosDoctor = useCallback(async (doctorId: number) => {
    try {
      setLoading(true);
      const response = await horarioService.getHorarios(doctorId);
      setHorarios(response.results || []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doctorSeleccionado) {
      cargarHorariosDoctor(doctorSeleccionado);
    }
  }, [doctorSeleccionado, cargarHorariosDoctor]);

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiaNombre = (dia: number) => {
    return DIAS_SEMANA.find(d => d.value === dia)?.label || 'Desconocido';
  };

  const generarDisponibilidad = async () => {
    if (!doctorSeleccionado) return;
    
    try {
      const fechaInicio = formatearFecha(new Date());
      const fechaFin = formatearFecha(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      await horarioService.generarDisponibilidad(doctorSeleccionado, fechaInicio, fechaFin);
      alert('Disponibilidad generada para los próximos 30 días');
    } catch (error) {
      console.error('Error al generar disponibilidad:', error);
      alert('Error al generar disponibilidad');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Horarios</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Horario
        </Button>
      </div>

      {/* Selector de Doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seleccionar Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctores.map((doctor) => (
              <div
                key={doctor.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  doctorSeleccionado === doctor.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDoctorSeleccionado(doctor.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {doctor.nombres?.[0]}{doctor.apellidos?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      Dr. {doctor.nombres} {doctor.apellidos}
                    </p>
                    <p className="text-sm text-gray-600">{doctor.titulo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horarios del doctor seleccionado */}
      {doctorSeleccionado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios de Atención
              </CardTitle>
              <Button
                onClick={generarDisponibilidad}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Generar Disponibilidad (30 días)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {horarios.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No hay horarios configurados para este doctor
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Configurar Primer Horario
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {DIAS_SEMANA.map((dia) => {
                  const horariosDelDia = horarios.filter(h => h.dia_semana === dia.value);
                  
                  return (
                    <div key={dia.value} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{dia.label}</h3>
                        {horariosDelDia.length === 0 && (
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        )}
                      </div>
                      
                      {horariosDelDia.length === 0 ? (
                        <p className="text-gray-500 text-sm">Sin horarios configurados</p>
                      ) : (
                        <div className="space-y-2">
                          {horariosDelDia.map((horario) => (
                            <div
                              key={horario.id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <Badge variant={horario.activo ? "default" : "secondary"}>
                                  {horario.activo ? "Activo" : "Inactivo"}
                                </Badge>
                                <span className="font-medium">
                                  {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  Citas de {horario.duracion_cita} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
