import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  User,
  CreditCard,
  Clock
} from 'lucide-react';
import type { Paciente } from '@/types/clinicas';

interface PacienteDetailViewProps {
  paciente: Paciente;
  onEdit?: (paciente: Paciente) => void;
  onDelete?: (paciente: Paciente) => void;
  onBack?: () => void;
}

export function PacienteDetailView({ paciente, onEdit, onDelete, onBack }: PacienteDetailViewProps) {
  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Obtener iniciales
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Formatear género
  const formatGenero = (genero?: string) => {
    switch(genero) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  };

  const pacienteName = `${paciente.usuario_data?.first_name || ''} ${paciente.usuario_data?.last_name || ''}`.trim() || 
                      paciente.usuario_data?.dni || 'Paciente';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{pacienteName}</h1>
            <p className="text-muted-foreground">
              {paciente.fecha_nacimiento ? `${calcularEdad(paciente.fecha_nacimiento)} años` : 'Edad no especificada'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(paciente)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(paciente)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">DNI</label>
                  <p className="text-sm">{paciente.usuario_data?.dni}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{paciente.usuario_data?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {paciente.fecha_nacimiento ? formatFecha(paciente.fecha_nacimiento) : 'No especificada'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Género</label>
                  <Badge variant="outline">{formatGenero(paciente.genero)}</Badge>
                </div>
                {paciente.usuario_data?.telefono && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{paciente.usuario_data.telefono}</p>
                    </div>
                  </div>
                )}
                {paciente.celular && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Celular</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{paciente.celular}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {paciente.usuario_data?.direccion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{paciente.usuario_data.direccion}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Documentación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Documento</label>
                  <p className="text-sm">{paciente.tipo_documento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Documento</label>
                  <p className="text-sm font-mono">{paciente.numero_documento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          {(paciente.departamento || paciente.provincia || paciente.distrito) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paciente.departamento && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                      <p className="text-sm">{paciente.departamento}</p>
                    </div>
                  )}
                  {paciente.provincia && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Provincia</label>
                      <p className="text-sm">{paciente.provincia}</p>
                    </div>
                  )}
                  {paciente.distrito && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Distrito</label>
                      <p className="text-sm">{paciente.distrito}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-2xl">
                  {getInitials(paciente.usuario_data?.first_name, paciente.usuario_data?.last_name)}
                </AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos básicos del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Edad:</span>
                <Badge variant="secondary">
                  {paciente.fecha_nacimiento ? `${calcularEdad(paciente.fecha_nacimiento)} años` : 'No especificada'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">#{paciente.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onEdit && (
                <Button variant="outline" className="w-full justify-start" onClick={() => onEdit(paciente)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Información
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver Historial Médico
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Historial de Citas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}