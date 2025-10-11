"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  horarioInfo: {
    dia: string;
    hora_inicio: string;
    hora_fin: string;
  } | null;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  horarioInfo,
  loading = false
}: DeleteConfirmModalProps) {
  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Confirmar Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>¿Estás seguro de que deseas eliminar este horario?</p>
            {horarioInfo && (
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="font-medium">{horarioInfo.dia}</p>
                <p className="text-sm text-gray-600">
                  {formatearHora(horarioInfo.hora_inicio)} - {formatearHora(horarioInfo.hora_fin)}
                </p>
              </div>
            )}
            <p className="text-sm text-red-600 font-medium">
              Esta acción no se puede deshacer. También se eliminarán todos los slots de disponibilidad asociados.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}