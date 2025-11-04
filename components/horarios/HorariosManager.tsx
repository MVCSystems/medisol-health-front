"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Clock, Plus, AlertCircle, Edit3, Trash2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useHorarios, useDisponibilidad } from '@/hooks/useHorarios';
import { doctorService } from '@/services/doctor.service';
import { horarioService } from '@/services/horario.service';
import { formatearFecha } from '@/lib/utils';
import HorarioModal from './HorarioModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Doctor, HorarioDoctor, DisponibilidadCita } from '@/types/clinicas';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/authStore';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function HorariosManager() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState<number | null>(null);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  
  const { isAdmin, isDoctor } = usePermissions();
  const user = useAuthStore(state => state.user);
  
  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [horarioEditando, setHorarioEditando] = useState<HorarioDoctor | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [horarioEliminando, setHorarioEliminando] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disponibilidadModalOpen, setDisponibilidadModalOpen] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [disponibilidadesDia, setDisponibilidadesDia] = useState<DisponibilidadCita[]>([]);
  const [todasDisponibilidades, setTodasDisponibilidades] = useState<DisponibilidadCita[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false);

  const { 
    horarios, 
    loading: loadingHorarios, 
    crearHorario, 
    actualizarHorario, 
    eliminarHorario,
    cargarHorarios 
  } = useHorarios(doctorSeleccionado || undefined);
  
  const { generarDisponibilidad, loading: generandoDisponibilidad } = useDisponibilidad(doctorSeleccionado || undefined);

  // Cargar doctores al montar el componente
  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const response = await doctorService.getAll();
        const listaDoctores = response.results || [];
        setDoctores(listaDoctores);
        
        // Si es doctor, auto-seleccionar su propio perfil
        if (isDoctor() && user) {
          const miPerfil = listaDoctores.find(d => d.usuario === user.id);
          if (miPerfil) {
            setDoctorSeleccionado(miPerfil.id);
          }
        }
      } catch (error) {
        console.error('Error al cargar doctores:', error);
      } finally {
        setLoadingDoctores(false);
      }
    };
    
    cargarDoctores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar horarios cuando cambie el doctor seleccionado
  useEffect(() => {
    if (doctorSeleccionado) {
      console.log('🔄 Doctor seleccionado cambió a:', doctorSeleccionado);
      cargarHorarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorSeleccionado]);

  // Handlers para CRUD
  const handleVerDisponibilidadesDia = async (diaSemana: number) => {
    if (!doctorSeleccionado) return;
    
    setDiaSeleccionado(diaSemana);
    setDisponibilidadModalOpen(true);
    setLoadingDisponibilidades(true);
    
    try {
      // Obtener TODAS las disponibilidades del doctor (todas las páginas)
      const allDisponibilidades = await horarioService.getAllDisponibilidadDoctor(doctorSeleccionado);
      
      // Filtrar por día de la semana (ej: solo lunes, solo martes, etc.)
      const disponibilidadesFiltradas = allDisponibilidades.filter(d => {
        const [year, month, day] = d.fecha.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diaJS = fecha.getDay();
        const diaConvertido = diaJS === 0 ? 6 : diaJS - 1;
        return diaConvertido === diaSemana;
      });
      
      console.log(`📊 Total disponibilidades del doctor: ${allDisponibilidades.length}`);
      console.log(`📊 Disponibilidades de ${DIAS_SEMANA[diaSemana]}: ${disponibilidadesFiltradas.length}`);
      
      // Guardar solo las disponibilidades del día de la semana seleccionado
      setTodasDisponibilidades(disponibilidadesFiltradas);
      setDisponibilidadesDia([]);
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error al cargar disponibilidades:', error);
    } finally {
      setLoadingDisponibilidades(false);
    }
  };

  const handleGenerarDisponibilidad = async (dias: number = 30) => {
    if (!doctorSeleccionado) return;
    
    const fechaInicio = formatearFecha(new Date());
    const fechaFin = formatearFecha(new Date(Date.now() + dias * 24 * 60 * 60 * 1000));
    
    const success = await generarDisponibilidad(fechaInicio, fechaFin);
    if (success) {
      alert(`✅ Disponibilidad generada para los próximos ${dias} días`);
    }
  };

  const handleGenerarMesActual = async () => {
    if (!doctorSeleccionado) return;
    
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    const fechaInicio = formatearFecha(primerDiaMes);
    const fechaFin = formatearFecha(ultimoDiaMes);
    
    const success = await generarDisponibilidad(fechaInicio, fechaFin);
    if (success) {
      alert(`✅ Disponibilidad generada para todo ${primerDiaMes.toLocaleDateString('es-PE', { month: 'long' })}`);
    }
  };

  const handleGenerarProximoMes = async () => {
    if (!doctorSeleccionado) return;
    
    const hoy = new Date();
    const primerDiaProximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const ultimoDiaProximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
    
    const fechaInicio = formatearFecha(primerDiaProximoMes);
    const fechaFin = formatearFecha(ultimoDiaProximoMes);
    
    const success = await generarDisponibilidad(fechaInicio, fechaFin);
    if (success) {
      alert(`✅ Disponibilidad generada para ${primerDiaProximoMes.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`);
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
      activo: true,
      tiene_refrigerio: true,
      hora_refrigerio_inicio: '12:00',
      hora_refrigerio_fin: '13:00'
    });
    setModalOpen(true);
  };

  const handleEditarHorario = (horario: HorarioDoctor) => {
    setModalMode('edit');
    setHorarioEditando(horario);
    setModalOpen(true);
  };

  const handleEliminarHorario = (horarioId: number) => {
    setHorarioEliminando(horarioId);
    setDeleteModalOpen(true);
  };

  const handleSaveHorario = async (data: HorarioDoctor) => {
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
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-PE', {
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
        <h1 className="text-2xl font-bold">
          {isAdmin() ? 'Gestión de Horarios Médicos' : 'Mis Horarios'}
        </h1>
      </div>

      {/* Selector de Doctor - Solo visible para Admin */}
      {isAdmin() && (
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
                        {(doctor.nombres || doctor.usuario_data?.first_name)?.[0] || 'D'}{(doctor.apellidos || doctor.usuario_data?.last_name)?.[0] || 'R'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        Dr. {doctor.nombres || doctor.usuario_data?.first_name} {doctor.apellidos || doctor.usuario_data?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{doctor.titulo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje informativo para doctores */}
      {isDoctor() && !isAdmin() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Solo puedes ver y gestionar tus propios horarios de atención.
          </p>
        </div>
      )}

      {/* Horarios del doctor seleccionado */}
      {doctorSeleccionado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {isAdmin() 
                  ? `Horarios - Dr. ${doctorActual?.nombres || doctorActual?.usuario_data?.first_name} ${doctorActual?.apellidos || doctorActual?.usuario_data?.last_name}`
                  : 'Mis Horarios de Atención'
                }
              </CardTitle>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={generandoDisponibilidad}
                      variant="outline"
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {generandoDisponibilidad ? 'Generando...' : 'Generar Disponibilidad'}
                      <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Período de generación</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleGenerarMesActual}
                      disabled={generandoDisponibilidad}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Mes actual
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleGenerarProximoMes}
                      disabled={generandoDisponibilidad}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Próximo mes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleGenerarDisponibilidad(30)}
                      disabled={generandoDisponibilidad}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Próximos 30 días
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerarDisponibilidad(60)}
                      disabled={generandoDisponibilidad}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Próximos 60 días
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerarDisponibilidad(90)}
                      disabled={generandoDisponibilidad}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Próximos 90 días (3 meses)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {DIAS_SEMANA.map((dia, index) => {
                  const horariosDelDia = horarios.filter(h => h.dia_semana === index);
                  const tieneHorarios = horariosDelDia.length > 0;
                  
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                        tieneHorarios 
                          ? 'bg-card border-primary/30 shadow-sm' 
                          : 'bg-muted/30 border-border'
                      }`}
                      onClick={() => tieneHorarios && handleVerDisponibilidadesDia(index)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            tieneHorarios ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`} />
                          <h3 className="font-semibold text-base">{dia}</h3>
                          {tieneHorarios && (
                            <Badge variant="secondary" className="text-xs">
                              {horariosDelDia.length} {horariosDelDia.length === 1 ? 'horario' : 'horarios'}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant={tieneHorarios ? "ghost" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCrearHorarioConDia(index);
                          }}
                          className="h-7 px-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {tieneHorarios ? 'Agregar' : 'Configurar'}
                        </Button>
                      </div>
                      
                      {horariosDelDia.length === 0 ? (
                        <div className="text-center py-4">
                          <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground text-xs">Sin horarios</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {horariosDelDia.map((horario) => (
                            <div
                              key={horario.id}
                              className={`border rounded-lg p-3 transition-all ${
                                horario.activo 
                                  ? 'bg-primary/5 border-primary/30 dark:bg-primary/10' 
                                  : 'bg-muted/50 border-muted-foreground/20 opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={horario.activo ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {horario.activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                    {horario.tiene_refrigerio && (
                                      <Badge variant="outline" className="text-xs">
                                        Con refrigerio
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-semibold">
                                      {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Citas de {horario.duracion_cita} minutos
                                  </p>
                                  {horario.tiene_refrigerio && (
                                    <p className="text-xs text-muted-foreground/70">
                                      Refrigerio: {formatearHora(horario.hora_refrigerio_inicio || '')} - {formatearHora(horario.hora_refrigerio_fin || '')}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditarHorario(horario)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEliminarHorario(horario.id!)}
                                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
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

      {/* Modal para ver disponibilidades con calendario */}
      {disponibilidadModalOpen && diaSeleccionado !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[85vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Disponibilidades - {DIAS_SEMANA[diaSeleccionado]}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDisponibilidadModalOpen(false);
                    setSelectedDate(undefined);
                    setDisponibilidadesDia([]);
                    setTodasDisponibilidades([]);
                  }}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDisponibilidades ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Cargando disponibilidades...</p>
                </div>
              ) : todasDisponibilidades.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay disponibilidades generadas para este día
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Usa el botón &quot;Generar Horario&quot; para crear slots de citas
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendario */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                      Selecciona una fecha
                    </h3>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        console.log('📅 Fecha seleccionada:', date);
                        setSelectedDate(date);
                        if (date) {
                          // Filtrar slots para la fecha seleccionada
                          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                          console.log('🔍 Buscando slots para fecha:', dateStr);
                          const slotsDelDia = todasDisponibilidades.filter(d => d.fecha === dateStr);
                          console.log('✅ Slots encontrados:', slotsDelDia.length);
                          setDisponibilidadesDia(slotsDelDia);
                        } else {
                          setDisponibilidadesDia([]);
                        }
                      }}
                      disabled={(date) => {
                        // Deshabilitar fechas sin disponibilidad
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        return !todasDisponibilidades.some(d => d.fecha === dateStr);
                      }}
                      className="rounded-md border"
                    />
                    <div className="mt-4 space-y-1 text-xs text-muted-foreground text-center">
                      <p className="font-semibold">{new Set(todasDisponibilidades.map(d => d.fecha)).size} {DIAS_SEMANA[diaSeleccionado]}s disponibles</p>
                      <p className="text-[10px]">{todasDisponibilidades.filter(d => d.disponible).length} de {todasDisponibilidades.length} slots disponibles</p>
                    </div>
                  </div>

                  {/* Slots disponibles del día seleccionado */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                      {selectedDate ? (
                        <>Horarios para {selectedDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</>
                      ) : (
                        <>Selecciona una fecha en el calendario</>
                      )}
                    </h3>
                    
                    {disponibilidadesDia.length > 0 ? (
                      <>
                        <div className="flex gap-3 mb-4 text-xs">
                          <span className="text-green-600 dark:text-green-400">
                            <strong>{disponibilidadesDia.filter(d => d.disponible).length}</strong> disponibles
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            <strong>{disponibilidadesDia.filter(d => !d.disponible).length}</strong> ocupados
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                          {disponibilidadesDia.map((disp, idx) => (
                            <div
                              key={`${disp.id}-${idx}`}
                              className={`px-4 py-2 rounded-md text-sm font-medium border ${
                                disp.disponible
                                  ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                                  : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {disp.hora_inicio.substring(0, 5)} - {disp.hora_fin.substring(0, 5)}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : selectedDate ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay slots para esta fecha</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Haz clic en una fecha del calendario</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
