'use client';

import React, { useState } from 'react';
import { PacienteForm } from '@/components/pacientes/PacienteForm';
import { PacienteEditForm } from '@/components/pacientes/PacienteEditForm';
import { PacienteTable } from '@/components/pacientes/PacienteTable';
import { PacienteDetailView } from '@/components/pacientes/PacienteDetailView';
import { PacienteDeleteDialog } from '@/components/pacientes/PacienteDeleteDialog';
import { usePacientes } from '@/hooks/usePacientes';
import type { Paciente } from '@/types/clinicas';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function PacientesPage() {
  const { eliminarPaciente } = usePacientes();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPaciente, setDeletingPaciente] = useState<Paciente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setSelectedPaciente(null);
    setViewMode('create');
  };

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setViewMode('edit');
  };

  const handleView = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setViewMode('view');
  };

  const handleDelete = (paciente: Paciente) => {
    setDeletingPaciente(paciente);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaciente) return;
    
    setIsDeleting(true);
    const success = await eliminarPaciente(deletingPaciente.id);
    setIsDeleting(false);
    
    if (success) {
      setShowDeleteDialog(false);
      setDeletingPaciente(null);
      if (viewMode === 'view' && selectedPaciente?.id === deletingPaciente.id) {
        setViewMode('list');
        setSelectedPaciente(null);
      }
    }
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedPaciente(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedPaciente(null);
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedPaciente(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Crear Paciente */}
      {viewMode === 'create' && (
        <PacienteForm 
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Editar Paciente */}
      {viewMode === 'edit' && selectedPaciente && (
        <PacienteEditForm 
          paciente={selectedPaciente}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Ver Detalles del Paciente */}
      {viewMode === 'view' && selectedPaciente && (
        <PacienteDetailView 
          paciente={selectedPaciente}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}

      {/* Lista de Pacientes */}
      {viewMode === 'list' && (
        <PacienteTable 
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog de Confirmación de Eliminación */}
      <PacienteDeleteDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingPaciente(null);
        }}
        onConfirm={handleConfirmDelete}
        paciente={deletingPaciente}
        isLoading={isDeleting}
      />
    </div>
  );
}