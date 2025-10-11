import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Stethoscope,
  Building2,
  DollarSign,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import type { Doctor } from '@/types/clinicas';
import { buildImageUrl } from '@/lib/image-utils';

interface DoctorDetailViewProps {
  doctor: Doctor;
  onEdit?: (doctor: Doctor) => void;
  onDelete?: (doctor: Doctor) => void;
  onBack?: () => void;
}

export function DoctorDetailView({ doctor, onEdit, onDelete, onBack }: DoctorDetailViewProps) {
  // Formatear precio
  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  };

  // Obtener iniciales
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

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
            <h1 className="text-2xl font-bold">
              {doctor.usuario_data?.first_name} {doctor.usuario_data?.last_name}
            </h1>
            <p className="text-muted-foreground">
              {doctor.titulo}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(doctor)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(doctor)}>
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
                  <p className="text-sm">{doctor.usuario_data?.dni}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{doctor.usuario_data?.email}</p>
                  </div>
                </div>
                {doctor.usuario_data?.telefono && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{doctor.usuario_data.telefono}</p>
                    </div>
                  </div>
                )}
                {doctor.usuario_data?.direccion && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{doctor.usuario_data.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título Profesional</label>
                <p className="text-sm">{doctor.titulo}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Precio de Consulta Base</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{formatPrecio(doctor.precio_consulta_base)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Clínica</label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">{doctor.clinica_nombre}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Especialidades</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctor.especialidades_data?.map((especialidad) => (
                    <Badge key={especialidad.id} variant="outline" className="flex items-center gap-1">
                      {especialidad.icono && <span>{especialidad.icono}</span>}
                      {especialidad.nombre}
                    </Badge>
                  ))}
                </div>
              </div>

              {doctor.biografia && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Biografía Profesional</label>
                  <div className="flex items-start gap-2 mt-1">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-justify">{doctor.biografia}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={doctor.foto ? buildImageUrl(doctor.foto) || undefined : undefined} 
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(doctor.usuario_data?.first_name, doctor.usuario_data?.last_name)}
                </AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Información general del doctor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Especialidades:</span>
                <Badge variant="secondary">{doctor.especialidades_data?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">#{doctor.id}</span>
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
                <Button variant="outline" className="w-full justify-start" onClick={() => onEdit(doctor)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Información
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Agenda
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver Historiales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}