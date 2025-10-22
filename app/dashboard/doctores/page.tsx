'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DoctorForm } from '@/components/doctores/DoctorForm';
import { DoctorEditForm } from '@/components/doctores/DoctorEditForm';
import { DoctorTable } from '@/components/doctores/DoctorTable';
import { DoctorDetailView } from '@/components/doctores/DoctorDetailView';
import { DoctorDeleteDialog } from '@/components/doctores/DoctorDeleteDialog';
import { useDoctores } from '@/hooks/useDoctores';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import type { Doctor } from '@/types/clinicas';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function DoctoresPage() {
  const { isAdmin } = useAuthStore();
  const { eliminarDoctor, reactivarDoctor, incluirInactivos, toggleIncluirInactivos, doctores, loading } = useDoctores();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetView = useCallback(() => {
    setViewMode('list');
    setSelectedDoctor(null);
  }, []);

  const handleAdd = () => {
    if (!isAdmin()) return;
    setSelectedDoctor(null);
    setViewMode('create');
  };

  const handleEdit = (doctor: Doctor) => {
    if (!isAdmin()) return;
    setSelectedDoctor(doctor);
    setViewMode('edit');
  };

  const handleView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setViewMode('view');
  };

  const handleDelete = (doctor: Doctor) => {
    if (!isAdmin()) return;
    setDeletingDoctor(doctor);
    setShowDeleteDialog(true);
  };

  const handleReactivar = async (doctor: Doctor) => {
    if (!isAdmin()) return;
    await reactivarDoctor(doctor.id);
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
        resetView();
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Filtro de activos/inactivos (solo admin) */}
      {isAdmin() && viewMode === 'list' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="incluir-inactivos" 
                checked={incluirInactivos}
                onCheckedChange={toggleIncluirInactivos}
              />
              <Label htmlFor="incluir-inactivos" className="flex items-center gap-2 cursor-pointer">
                {incluirInactivos ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Mostrando doctores activos e inactivos
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Mostrando solo doctores activos
                  </>
                )}
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crear Doctor */}
      {viewMode === 'create' && (
        <DoctorForm 
          onSuccess={resetView}
          onCancel={resetView}
        />
      )}

      {/* Editar Doctor */}
      {viewMode === 'edit' && selectedDoctor && (
        <DoctorEditForm 
          doctor={selectedDoctor}
          onSuccess={resetView}
          onCancel={resetView}
        />
      )}

      {/* Ver Detalles del Doctor */}
      {viewMode === 'view' && selectedDoctor && (
        <DoctorDetailView 
          doctor={selectedDoctor}
          onEdit={isAdmin() ? handleEdit : undefined}
          onDelete={isAdmin() ? handleDelete : undefined}
          onBack={resetView}
        />
      )}

      {/* Lista de Doctores */}
      {viewMode === 'list' && (
        <DoctorTable 
          onAdd={isAdmin() ? handleAdd : undefined}
          onEdit={isAdmin() ? handleEdit : undefined}
          onView={handleView}
          onDelete={isAdmin() ? handleDelete : undefined}
          onReactivar={isAdmin() ? handleReactivar : undefined}
          doctores={doctores}
          loading={loading}
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