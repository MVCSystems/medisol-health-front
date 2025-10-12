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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Users,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';
import type { Paciente } from '@/types/clinicas';

interface PacienteTableProps {
  onEdit?: (paciente: Paciente) => void;
  onView?: (paciente: Paciente) => void;
  onAdd?: () => void;
  onDelete?: (paciente: Paciente) => void;
}

export function PacienteTable({ onEdit, onView, onAdd, onDelete }: PacienteTableProps) {
  const { pacientes, loading } = usePacientes();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar pacientes por término de búsqueda
  const pacientesFiltrados = pacientes.filter(paciente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      paciente.usuario_data?.first_name?.toLowerCase().includes(searchLower) ||
      paciente.usuario_data?.last_name?.toLowerCase().includes(searchLower) ||
      paciente.usuario_data?.email?.toLowerCase().includes(searchLower) ||
      paciente.usuario_data?.dni?.toLowerCase().includes(searchLower) ||
      paciente.numero_documento?.toLowerCase().includes(searchLower) ||
      paciente.celular?.toLowerCase().includes(searchLower)
    );
  });

  // Manejar eliminación
  const handleDelete = (paciente: Paciente) => {
    onDelete?.(paciente);
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pacientes
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
              <Users className="h-5 w-5" />
              Pacientes
            </CardTitle>
            <CardDescription>
              Gestión de pacientes de la plataforma
            </CardDescription>
          </div>
          {onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="secondary" className="ml-auto">
            {pacientesFiltrados.length} de {pacientes.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                pacientesFiltrados.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(paciente.usuario_data?.first_name, paciente.usuario_data?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {paciente.usuario_data?.first_name} {paciente.usuario_data?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          DNI: {paciente.usuario_data?.dni}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {paciente.usuario_data?.email}
                        </div>
                        {paciente.celular && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {paciente.celular}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          {paciente.tipo_documento}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {paciente.numero_documento}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {paciente.fecha_nacimiento ? calcularEdad(paciente.fecha_nacimiento) : '?'} años
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {paciente.fecha_nacimiento ? formatFecha(paciente.fecha_nacimiento) : 'No especificada'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={
                        paciente.genero === 'M' ? 'default' : 
                        paciente.genero === 'F' ? 'secondary' : 'outline'
                      }>
                        {paciente.genero === 'M' ? 'Masculino' : 
                         paciente.genero === 'F' ? 'Femenino' : 'Otro'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {paciente.distrito && (
                          <div>{paciente.distrito}</div>
                        )}
                        {paciente.provincia && (
                          <div className="text-xs text-muted-foreground">
                            {paciente.provincia}
                            {paciente.departamento && `, ${paciente.departamento}`}
                          </div>
                        )}
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
                            <DropdownMenuItem onClick={() => onView(paciente)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(paciente)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(paciente)}
                            className="text-destructive"
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

        {pacientesFiltrados.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
