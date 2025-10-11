import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  User,
  Stethoscope,
  Phone,
  Mail
} from 'lucide-react';
import { useDoctores } from '@/hooks/useDoctores';
import type { Doctor } from '@/types/clinicas';
import { buildImageUrl } from '@/lib/image-utils';

interface DoctorTableProps {
  onEdit?: (doctor: Doctor) => void;
  onView?: (doctor: Doctor) => void;
  onDelete?: (doctor: Doctor) => void;
  onAdd?: () => void;
}

export function DoctorTable({ onEdit, onView, onDelete, onAdd }: DoctorTableProps) {
  const { doctores, loading } = useDoctores();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar doctores por término de búsqueda
  const doctoresFiltrados = doctores.filter(doctor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doctor.usuario_data?.first_name?.toLowerCase().includes(searchLower) ||
      doctor.usuario_data?.last_name?.toLowerCase().includes(searchLower) ||
      doctor.usuario_data?.email?.toLowerCase().includes(searchLower) ||
      doctor.titulo?.toLowerCase().includes(searchLower) ||
      doctor.clinica_nombre?.toLowerCase().includes(searchLower) ||
      doctor.especialidades_data?.some(esp => 
        esp.nombre.toLowerCase().includes(searchLower)
      )
    );
  });

  // Manejar eliminación
  const handleDelete = (doctor: Doctor) => {
    onDelete?.(doctor);
  };

  // Formatear precio
  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctores
            </CardTitle>
            <CardDescription>
              Gestión de doctores de la plataforma
            </CardDescription>
          </div>
          {onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Doctor
            </Button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar doctores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="secondary" className="ml-auto">
            {doctoresFiltrados.length} de {doctores.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No se encontraron doctores' : 'No hay doctores registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                doctoresFiltrados.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={doctor.foto ? buildImageUrl(doctor.foto) ?? undefined : undefined} 
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {doctor.usuario_data?.first_name} {doctor.usuario_data?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.titulo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          DNI: {doctor.usuario_data?.dni}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {doctor.usuario_data?.email}
                        </div>
                        {doctor.usuario_data?.telefono && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {doctor.usuario_data.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doctor.especialidades_data?.map((especialidad) => (
                          <Badge key={especialidad.id} variant="outline" className="text-xs">
                            {especialidad.icono && <span className="mr-1">{especialidad.icono}</span>}
                            {especialidad.nombre}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {doctor.clinica_nombre}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">
                        {formatPrecio(doctor.precio_consulta_base)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(doctor)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(doctor)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(doctor)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {doctoresFiltrados.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {doctoresFiltrados.length} de {doctores.length} doctores
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}