'use client';

import { useState, useCallback } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { PacienteForm } from '@/components/pacientes/PacienteForm';
import { PacienteEditForm } from '@/components/pacientes/PacienteEditForm';
import { PacienteTable } from '@/components/pacientes/PacienteTable';
import { PacienteDetailView } from '@/components/pacientes/PacienteDetailView';
import { PacienteDeleteDialog } from '@/components/pacientes/PacienteDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';
import type { Paciente } from '@/types/clinicas';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function PacientesPage() {
  const { eliminarPaciente, incluirInactivos, toggleIncluirInactivos, reactivarPaciente, pacientes, loading } = usePacientes();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPaciente, setDeletingPaciente] = useState<Paciente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetView = useCallback(() => {
    setViewMode('list');
    setSelectedPaciente(null);
  }, []);

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

  const handleReactivar = async (paciente: Paciente) => {
    await reactivarPaciente(paciente.id);
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
        resetView();
      }
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Crear Paciente */}
        {viewMode === 'create' && (
          <PacienteForm 
            onSuccess={resetView}
            onCancel={resetView}
          />
        )}

      {/* Editar Paciente */}
      {viewMode === 'edit' && selectedPaciente && (
        <PacienteEditForm 
          paciente={selectedPaciente}
          onSuccess={resetView}
          onCancel={resetView}
        />
      )}

      {/* Ver Detalles del Paciente */}
      {viewMode === 'view' && selectedPaciente && (
        <PacienteDetailView 
          paciente={selectedPaciente}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={resetView}
        />
      )}

      {/* Lista de Pacientes */}
      {viewMode === 'list' && (
        <>
          {/* Filtro de Inactivos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <span>Mostrando pacientes activos e inactivos</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Mostrando solo pacientes activos</span>
                    </>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          <PacienteTable 
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onReactivar={handleReactivar}
            pacientes={pacientes}
            loading={loading}
          />
        </>
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
    </RoleGuard>
  );
}