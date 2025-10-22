'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClinicas } from '@/hooks/useClinicas'
import { ClinicaTable } from '@/components/clinicas/clinica-table'
import { ClinicaForm } from '@/components/clinicas/clinica-form'
import { DeleteConfirmDialog } from '@/components/clinicas/delete-confirm-dialog'
import type { Clinica } from '@/types/clinicas'

export default function ClinicasPage() {
  const {
    clinicas,
    loading,
    error,
    totalCount,
    createClinica,
    updateClinica,
    deleteClinica,
  } = useClinicas()

  const [showForm, setShowForm] = useState(false)
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null)
  const [deletingClinica, setDeletingClinica] = useState<Clinica | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar clínicas por término de búsqueda
  const filteredClinicas = clinicas.filter(clinica =>
    clinica.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinica.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinica.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (clinica: Clinica) => {
    setEditingClinica(clinica)
    setShowForm(true)
  }

  const handleDelete = (clinica: Clinica) => {
    setDeletingClinica(clinica)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingClinica(null)
  }

  const handleDeleteConfirm = async () => {
    if (deletingClinica) {
      const success = await deleteClinica(deletingClinica.id)
      if (success) {
        setDeletingClinica(null)
      }
    }
  }

  const handleFormSubmit = async (data: unknown) => {
    const success = editingClinica
      ? !!(await updateClinica(editingClinica.id, data as never))
      : !!(await createClinica(data as never));

    if (success) {
      handleFormClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clínicas</h1>
          <p className="text-muted-foreground">
            Administra las clínicas del sistema ({totalCount} total)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Clínica
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Buscar por nombre, dirección o email..."
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

      {/* Tabla de clínicas */}
      <ClinicaTable
        clinicas={filteredClinicas}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de formulario */}
      <ClinicaForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        clinica={editingClinica}
        loading={loading}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={!!deletingClinica}
        onClose={() => setDeletingClinica(null)}
        onConfirm={handleDeleteConfirm}
        clinica={deletingClinica}
        loading={loading}
      />
    </div>
  )
}