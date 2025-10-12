'use client'

import { Edit, Trash2, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Especialidad } from '@/types/clinicas'

interface EspecialidadTableProps {
  especialidades: Especialidad[]
  loading: boolean
  onEdit: (especialidad: Especialidad) => void
  onDelete: (especialidad: Especialidad) => void
}

export function EspecialidadTable({ especialidades, loading, onEdit, onDelete }: EspecialidadTableProps) {
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

  if (especialidades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No se encontraron especialidades
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Especialidades Médicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Ícono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {especialidades.map((especialidad) => (
                <TableRow key={especialidad.id}>
                  <TableCell>
                    <div className="font-semibold">{especialidad.nombre}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      {especialidad.descripcion ? (
                        <p className="text-sm text-muted-foreground">
                          {especialidad.descripcion.length > 100
                            ? `${especialidad.descripcion.slice(0, 100)}...`
                            : especialidad.descripcion
                          }
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Sin descripción
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {especialidad.icono ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{especialidad.icono}</span>
                          <span className="text-xs text-muted-foreground">
                            {especialidad.icono}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Sin ícono
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        especialidad.activa 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          especialidad.activa 
                            ? 'bg-primary animate-pulse' 
                            : 'bg-muted-foreground'
                        }`}></div>
                        {especialidad.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(especialidad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(especialidad)}
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