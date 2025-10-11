'use client'

import { Edit, Trash2, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Clinica } from '@/types/clinicas'

interface ClinicaTableProps {
  clinicas: Clinica[]
  loading: boolean
  onEdit: (clinica: Clinica) => void
  onDelete: (clinica: Clinica) => void
}

export function ClinicaTable({ clinicas, loading, onEdit, onDelete }: ClinicaTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (clinicas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No se encontraron clínicas
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clínicas Registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicas.map((clinica) => (
                <TableRow key={clinica.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{clinica.nombre}</div>
                      {clinica.descripcion && (
                        <div className="text-sm text-muted-foreground">
                          {clinica.descripcion.slice(0, 100)}
                          {clinica.descripcion.length > 100 && '...'}
                        </div>
                      )}
                      {clinica.sitio_web && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={clinica.sitio_web} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Sitio Web
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {clinica.telefono}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {clinica.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      <span className="max-w-[200px] truncate" title={clinica.direccion}>
                        {clinica.direccion}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={clinica.activa ? "default" : "secondary"}>
                      {clinica.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(clinica.fecha_registro)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(clinica)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(clinica)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}