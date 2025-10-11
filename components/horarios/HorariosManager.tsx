"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { useHorarios, useDisponibilidad } from '@/hooks/useHorarios';
import { doctorService } from '@/services/doctor.service';
import HorarioModal from './HorarioModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Doctor } from '@/types/clinicas';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface HorarioData {
  id?: number;
  doctor: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
}

export default function HorariosManager() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState<number | null>(null);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  
  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [horarioEditando, setHorarioEditando] = useState<HorarioData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [horarioEliminando, setHorarioEliminando] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { 
    horarios, 
    loading: loadingHorarios, 
    crearHorario, 
    actualizarHorario, 
    eliminarHorario 
  } = useHorarios(doctorSeleccionado || undefined);
  
  const { generarDisponibilidad, loading: generandoDisponibilidad } = useDisponibilidad(doctorSeleccionado || undefined);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctores(response.results || []);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
    } finally {
      setLoadingDoctores(false);
    }
  };

  // Handlers para CRUD
  const handleGenerarDisponibilidad = async () => {
    if (!doctorSeleccionado) return;
    
    const fechaInicio = new Date().toISOString().split('T')[0];
    const fechaFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const success = await generarDisponibilidad(fechaInicio, fechaFin);
    if (success) {
      alert('Disponibilidad generada para los próximos 30 días');
    }
  };

  const handleCrearHorario = () => {
    setModalMode('create');
    setHorarioEditando(null);
    setModalOpen(true);
  };

  const handleCrearHorarioConDia = (diaSemana: number) => {
    setModalMode('create');
    setHorarioEditando({
      doctor: doctorSeleccionado!,
      dia_semana: diaSemana,
      hora_inicio: '',
      hora_fin: '',
      duracion_cita: 30,
      activo: true
    });
    setModalOpen(true);
  };

  const handleEditarHorario = (horario: HorarioData) => {
    setModalMode('edit');
    setHorarioEditando(horario);
    setModalOpen(true);
  };

  const handleEliminarHorario = (horarioId: number) => {
    setHorarioEliminando(horarioId);
    setDeleteModalOpen(true);
  };

  const handleSaveHorario = async (data: HorarioData) => {
    try {
      let result;
      if (modalMode === 'create') {
        result = await crearHorario(data);
      } else if (horarioEditando?.id) {
        result = await actualizarHorario(horarioEditando.id, data);
      } else {
        return { success: false, error: 'Error inesperado' };
      }
      
      if (result) {
        setModalOpen(false);
        setHorarioEditando(null);
        return { success: true };
      }
      
      return { success: false, error: 'Error al guardar' };
    } catch (error) {
      return { success: false, error: error?.toString() || 'Error desconocido' };
    }
  };

  const handleConfirmDelete = async () => {
    if (!horarioEliminando) return;
    
    setDeleteLoading(true);
    try {
      const result = await eliminarHorario(horarioEliminando);
      if (result) {
        setDeleteModalOpen(false);
        setHorarioEliminando(null);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const doctorActual = doctores.find(d => d.id === doctorSeleccionado);

  if (loadingDoctores) {
    return <div className="flex justify-center p-8">Cargando doctores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Horarios Médicos</h1>
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
                      {doctor.nombres?.[0] || 'D'}{doctor.apellidos?.[0] || 'R'}
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
                Horarios - Dr. {doctorActual?.nombres} {doctorActual?.apellidos}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerarDisponibilidad}
                  disabled={generandoDisponibilidad}
                  variant="outline"
                >
                  {generandoDisponibilidad ? 'Generando...' : 'Generar Disponibilidad'}
                </Button>
                <Button onClick={handleCrearHorario}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Horario
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHorarios ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : horarios.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No hay horarios configurados para este doctor
                </p>
                <Button onClick={handleCrearHorario}>
                  Configurar Primer Horario
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {DIAS_SEMANA.map((dia, index) => {
                  const horariosDelDia = horarios.filter(h => h.dia_semana === index);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{dia}</h3>
                        {horariosDelDia.length === 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCrearHorarioConDia(index)}
                          >
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
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditarHorario(horario)}
                                >
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleEliminarHorario(horario.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
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

      {/* Modal para crear/editar horario */}
      <HorarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        horario={horarioEditando}
        doctorId={doctorSeleccionado || 0}
        onSave={handleSaveHorario}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        horarioInfo={null}
      />
    </div>
  );
}