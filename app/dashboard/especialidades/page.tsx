'use client'

import { useState } from 'react'
import { Plus, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEspecialidades } from '@/hooks/useEspecialidades'
import { EspecialidadTable } from '@/components/especialidades/especialidad-table'
import { EspecialidadForm } from '@/components/especialidades/especialidad-form'
import { DeleteConfirmDialog } from '@/components/especialidades/delete-confirm-dialog'
import type { Especialidad, CreateEspecialidadData, UpdateEspecialidadData } from '@/types/clinicas'

export default function EspecialidadesPage() {
  const {
    especialidades,
    loading,
    error,
    totalCount,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
  } = useEspecialidades()

  const [showForm, setShowForm] = useState(false)
  const [editingEspecialidad, setEditingEspecialidad] = useState<Especialidad | null>(null)
  const [deletingEspecialidad, setDeletingEspecialidad] = useState<Especialidad | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar especialidades por término de búsqueda
  const filteredEspecialidades = especialidades.filter(especialidad =>
    especialidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (especialidad.descripcion && especialidad.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEdit = (especialidad: Especialidad) => {
    setEditingEspecialidad(especialidad)
    setShowForm(true)
  }

  const handleDelete = (especialidad: Especialidad) => {
    setDeletingEspecialidad(especialidad)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEspecialidad(null)
  }

  const handleDeleteConfirm = async () => {
    if (deletingEspecialidad) {
      const success = await deleteEspecialidad(deletingEspecialidad.id)
      if (success) {
        setDeletingEspecialidad(null)
      }
    }
  }

  const handleFormSubmit = async (data: CreateEspecialidadData | UpdateEspecialidadData) => {
    const success = editingEspecialidad
      ? !!(await updateEspecialidad(editingEspecialidad.id, data as UpdateEspecialidadData))
      : !!(await createEspecialidad(data as CreateEspecialidadData));

    if (success) {
      handleFormClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gestión de Especialidades</h1>
          </div>
          <p className="text-muted-foreground">
            Administra las especialidades médicas del sistema ({totalCount} total)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Especialidad
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de especialidades */}
      <EspecialidadTable
        especialidades={filteredEspecialidades}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de formulario */}
      <EspecialidadForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        especialidad={editingEspecialidad}
        loading={loading}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={!!deletingEspecialidad}
        onClose={() => setDeletingEspecialidad(null)}
        onConfirm={handleDeleteConfirm}
        especialidad={deletingEspecialidad}
        loading={loading}
      />
    </div>
  )
}