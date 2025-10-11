"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useDoctores } from '@/hooks/useDoctores';
import { useCitas, useDisponibilidadDoctor } from '@/hooks/useCitas';
import type { Doctor } from '@/types/clinicas';
import type { DisponibilidadCita } from '@/types/clinicas';
import DisponibilidadCalendar from './DisponibilidadCalendar';
import ReservaCitaModal, { DatosCitaReserva } from './ReservaCitaModal';

export default function ReservaCitas() {
  const [busqueda, setBusqueda] = useState('');
  const [doctorSeleccionado, setDoctorSeleccionado] = useState<Doctor | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [slotSeleccionado, setSlotSeleccionado] = useState<DisponibilidadCita | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paso, setPaso] = useState<'doctores' | 'horarios' | 'reserva'>('doctores');
  
  const { doctores, loading: loadingDoctores } = useDoctores();
  const { crearCita, loading: loadingCita } = useCitas();
  const { 
    disponibilidades, 
    loading: loadingDisponibilidad, 
    cargarDisponibilidad 
  } = useDisponibilidadDoctor();

  // Filtrar doctores por búsqueda
  const doctoresFiltrados = doctores.filter(doctor =>
    `${doctor.nombres} ${doctor.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    doctor.especialidades_data.some(esp => 
      esp.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const handleSeleccionarDoctor = (doctor: Doctor) => {
    setDoctorSeleccionado(doctor);
    setPaso('horarios');
    setFechaSeleccionada('');
  };

  const handleSeleccionarSlot = (slot: DisponibilidadCita) => {
    setSlotSeleccionado(slot);
    setModalAbierto(true);
  };

  const handleReservarCita = async (datosCita: DatosCitaReserva) => {
    if (!doctorSeleccionado || !slotSeleccionado) return;

    try {
      // Crear objeto compatible con CitaCreateData
      const citaData = {
        clinica: doctorSeleccionado.clinica, // ID de la clínica
        doctor: doctorSeleccionado.id,
        disponibilidad_id: slotSeleccionado.id,
        fecha: slotSeleccionado.fecha,
        hora_inicio: slotSeleccionado.hora_inicio,
        hora_fin: slotSeleccionado.hora_fin,
        motivo: datosCita.motivo_consulta,
        notas: datosCita.observaciones,
        precio_consulta: doctorSeleccionado.precio_consulta_base,
        // Información del paciente - esto debería ser manejado en el backend
        paciente_datos: {
          nombres: datosCita.paciente_nombre,
          apellidos: datosCita.paciente_apellido,
          email: datosCita.paciente_email,
          telefono: datosCita.paciente_telefono,
          dni: datosCita.paciente_dni
        },
        tipo_cita: datosCita.tipo_cita
      };
      
      await crearCita(citaData);
      
      setModalAbierto(false);
      setSlotSeleccionado(null);
      setPaso('doctores');
      setDoctorSeleccionado(null);
      setFechaSeleccionada('');
    } catch (error) {
      console.error('Error al reservar cita:', error);
    }
  };

  const volverAPaso = (nuevoPaso: 'doctores' | 'horarios') => {
    setPaso(nuevoPaso);
    if (nuevoPaso === 'doctores') {
      setDoctorSeleccionado(null);
      setFechaSeleccionada('');
      setSlotSeleccionado(null);
    }
  };

  // Cargar disponibilidad cuando cambie la fecha seleccionada
  useEffect(() => {
    if (doctorSeleccionado?.id && fechaSeleccionada) {
      cargarDisponibilidad(fechaSeleccionada, doctorSeleccionado.id);
    }
  }, [doctorSeleccionado?.id, fechaSeleccionada, cargarDisponibilidad]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Reservar Cita Médica</h1>
        <p className="text-gray-600">
          Selecciona un doctor y horario disponible para tu consulta
        </p>
      </div>

      {/* Navegación de pasos */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${paso === 'doctores' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso === 'doctores' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span>Seleccionar Doctor</span>
        </div>
        
        <div className="w-8 h-px bg-gray-300"></div>
        
        <div className={`flex items-center space-x-2 ${paso === 'horarios' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso === 'horarios' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span>Elegir Horario</span>
        </div>
      </div>

      {/* Contenido según el paso */}
      {paso === 'doctores' && (
        <div className="space-y-6">
          {/* Buscador */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar doctor o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de doctores */}
          {loadingDoctores ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctoresFiltrados.map((doctor) => (
                <Card 
                  key={doctor.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSeleccionarDoctor(doctor)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {doctor.nombres} {doctor.apellidos}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{doctor.titulo}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Especialidades */}
                    <div className="flex flex-wrap gap-2">
                      {doctor.especialidades_data.map((especialidad) => (
                        <Badge key={especialidad.id} variant="secondary">
                          {especialidad.nombre}
                        </Badge>
                      ))}
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.usuario_data?.telefono || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{doctor.usuario_data?.email || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.clinica_nombre}</span>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-lg">
                          S/ {doctor.precio_consulta_base}
                        </span>
                      </div>
                      <Button size="sm">
                        Seleccionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {doctoresFiltrados.length === 0 && !loadingDoctores && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron doctores</p>
            </div>
          )}
        </div>
      )}

      {paso === 'horarios' && doctorSeleccionado && (
        <div className="space-y-6">
          {/* Header del doctor seleccionado */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {doctorSeleccionado.nombres} {doctorSeleccionado.apellidos}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doctorSeleccionado.especialidades_data.map((especialidad) => (
                        <Badge key={especialidad.id} variant="secondary" className="text-xs">
                          {especialidad.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">S/ {doctorSeleccionado.precio_consulta_base}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => volverAPaso('doctores')}
                  >
                    Cambiar Doctor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendario de disponibilidad */}
          <DisponibilidadCalendar
            doctorId={doctorSeleccionado.id}
            fechaSeleccionada={fechaSeleccionada}
            onFechaSeleccionada={setFechaSeleccionada}
            disponibilidades={disponibilidades}
            loading={loadingDisponibilidad}
            onSlotSeleccionado={handleSeleccionarSlot}
          />
        </div>
      )}

      {/* Modal de reserva */}
      {doctorSeleccionado && (
        <ReservaCitaModal
          isOpen={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setSlotSeleccionado(null);
          }}
          doctor={doctorSeleccionado}
          slot={slotSeleccionado}
          onReservar={handleReservarCita}
          loading={loadingCita}
        />
      )}
    </div>
  );
}