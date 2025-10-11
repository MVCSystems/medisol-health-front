'use client';

import React, { useState } from 'react';
import { DoctorForm } from '@/components/doctores/DoctorForm';
import { DoctorEditForm } from '@/components/doctores/DoctorEditForm';
import { DoctorTable } from '@/components/doctores/DoctorTable';
import { DoctorDetailView } from '@/components/doctores/DoctorDetailView';
import { DoctorDeleteDialog } from '@/components/doctores/DoctorDeleteDialog';
import { useDoctores } from '@/hooks/useDoctores';
import type { Doctor } from '@/types/clinicas';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function DoctoresPage() {
  const { eliminarDoctor } = useDoctores();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setSelectedDoctor(null);
    setViewMode('create');
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setViewMode('edit');
  };

  const handleView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setViewMode('view');
  };

  const handleDelete = (doctor: Doctor) => {
    setDeletingDoctor(doctor);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;
    
    setIsDeleting(true);
    const success = await eliminarDoctor(deletingDoctor.id);
    setIsDeleting(false);
    
    if (success) {
      setShowDeleteDialog(false);
      setDeletingDoctor(null);
      if (viewMode === 'view' && selectedDoctor?.id === deletingDoctor.id) {
        setViewMode('list');
        setSelectedDoctor(null);
      }
    }
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedDoctor(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedDoctor(null);
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedDoctor(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Crear Doctor */}
      {viewMode === 'create' && (
        <DoctorForm 
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Editar Doctor */}
      {viewMode === 'edit' && selectedDoctor && (
        <DoctorEditForm 
          doctor={selectedDoctor}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Ver Detalles del Doctor */}
      {viewMode === 'view' && selectedDoctor && (
        <DoctorDetailView 
          doctor={selectedDoctor}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}

      {/* Lista de Doctores */}
      {viewMode === 'list' && (
        <DoctorTable 
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog de Confirmación de Eliminación */}
      <DoctorDeleteDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingDoctor(null);
        }}
        onConfirm={handleConfirmDelete}
        doctor={deletingDoctor}
        isLoading={isDeleting}
      />
    </div>
  );
}