"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { useCitas } from '@/hooks/useCitas';
import type { CitaWithDetails } from '@/types/citas';
import { citaService } from '@/services/cita.service';
import { useToast } from "@/components/ui/use-toast";
import { DetallesCita } from './DetallesCita';
import { EditarCita } from './EditarCita';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const estadoColors = {
  PENDIENTE: 'bg-yellow-500',
  CONFIRMADA: 'bg-blue-500',
  COMPLETADA: 'bg-green-500',
  CANCELADA: 'bg-red-500'
};

export default function ListadoCitas() {
  const { toast } = useToast();
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    fecha: ''
  });
  
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaWithDetails | null>(null);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const handleVerDetalles = (cita: CitaWithDetails) => {
    setCitaSeleccionada(cita);
    setMostrarModalDetalles(true);
  };

  const handleEditarCita = (cita: CitaWithDetails) => {
    setCitaSeleccionada(cita);
    setMostrarModalEditar(true);
  };

  const handleEliminarCita = async (id: number) => {
    try {
      await citaService.deleteCita(id);
      refetch();
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive",
      });
    }
  };

  const { citas, loading, refetch } = useCitas();
  
  // Debug: Ver los datos que recibimos de forma detallada
  useEffect(() => {
    if (citas.length > 0) {
      console.log('🔍 Datos completos de la primera cita:', citas[0]);
    }
  }, [citas]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar citas basado en los criterios de búsqueda
  const citasFiltradas = citas.filter(cita => {
    const terminoBusqueda = filtros.busqueda.toLowerCase();
    const cumpleBusqueda = 
      cita.paciente.nombres?.toLowerCase().includes(terminoBusqueda) ||
      cita.paciente.apellidos?.toLowerCase().includes(terminoBusqueda) ||
      cita.doctor.nombres?.toLowerCase().includes(terminoBusqueda) ||
      cita.doctor.apellidos?.toLowerCase().includes(terminoBusqueda) ||
      cita.motivo.toLowerCase().includes(terminoBusqueda);

    const cumpleEstado = !filtros.estado || cita.estado === filtros.estado;
    const cumpleFecha = !filtros.fecha || cita.fecha === filtros.fecha;

    return cumpleBusqueda && cumpleEstado && cumpleFecha;
  });

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Listado de Citas Médicas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, doctor o motivo..."
                  className="pl-8"
                  value={filtros.busqueda}
                  onChange={e => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                />
              </div>
            </div>
            <Select
              value={filtros.estado}
              onValueChange={value => setFiltros(prev => ({ ...prev, estado: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                <SelectItem value="COMPLETADA">Completada</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[180px]"
              value={filtros.fecha}
              onChange={e => setFiltros(prev => ({ ...prev, fecha: e.target.value }))}
            />
          </div>

          {/* Tabla de citas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Cargando citas...
                    </TableCell>
                  </TableRow>
                ) : citasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No se encontraron citas
                    </TableCell>
                  </TableRow>
                ) : (
                  citasFiltradas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatearFecha(cita.fecha)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {cita.paciente.nombres} {cita.paciente.apellidos}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            DNI: {cita.paciente.numero_documento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Dr. {cita.doctor.nombres} {cita.doctor.apellidos}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">
                            {cita.doctor.especialidades?.[0]?.nombre || 'Sin especialidad'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="line-clamp-2">{cita.motivo}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoColors[cita.estado]}>
                          {cita.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">S/ {cita.precio_total}</span>
                          {cita.descuento > 0 && (
                            <span className="text-sm text-green-600">
                              -{cita.descuento} descuento
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleVerDetalles(cita)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditarCita(cita)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. La cita será eliminada permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleEliminarCita(cita.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DetallesCita
        cita={citaSeleccionada}
        isOpen={mostrarModalDetalles}
        onClose={() => {
          setMostrarModalDetalles(false);
          setCitaSeleccionada(null);
        }}
      />

      <EditarCita
        cita={citaSeleccionada}
        isOpen={mostrarModalEditar}
        onClose={() => {
          setMostrarModalEditar(false);
          setCitaSeleccionada(null);
        }}
        onSuccess={refetch}
      />
    </div>
  );
}