import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { Doctor } from '@/types/clinicas';

interface DoctorDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doctor: Doctor | null;
  isLoading?: boolean;
}

export function DoctorDeleteDialog({
  open,
  onClose,
  onConfirm,
  doctor,
  isLoading = false
}: DoctorDeleteDialogProps) {
  if (!doctor) return null;

  const doctorName = `${doctor.usuario_data?.first_name || ''} ${doctor.usuario_data?.last_name || ''}`.trim() || 
                    doctor.usuario_data?.dni || 'Doctor';

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            ¿Eliminar Doctor?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Esta acción eliminará permanentemente al doctor{' '}
              <span className="font-semibold">{doctorName}</span>
              {doctor.usuario_data?.dni && (
                <span> (DNI: {doctor.usuario_data.dni})</span>
              )}
            </div>
            
            {doctor.titulo && (
              <div className="text-sm text-muted-foreground">
                Título: {doctor.titulo}
              </div>
            )}

            {doctor.especialidades_data && doctor.especialidades_data.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Especialidades: {doctor.especialidades_data.map(e => e.nombre).join(', ')}
              </div>
            )}

            <div className="text-red-600 font-medium">
              ⚠️ Esta acción no se puede deshacer y eliminará:
            </div>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>El perfil del doctor</li>
              <li>Su usuario asociado en el sistema</li>
              <li>Todos los roles y permisos</li>
              <li>El historial de citas (si las hay)</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sí, eliminar doctor
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}