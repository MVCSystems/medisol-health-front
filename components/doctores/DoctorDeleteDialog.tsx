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
          <AlertDialogDescription>
            Esta acción eliminará permanentemente al doctor{' '}
            <span className="font-semibold">{doctorName}</span>
            {doctor.usuario_data?.dni && (
              <span> (DNI: {doctor.usuario_data.dni})</span>
            )}
            
            {doctor.titulo && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Título: {doctor.titulo}
                </span>
              </>
            )}

            {doctor.especialidades_data && doctor.especialidades_data.length > 0 && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Especialidades: {doctor.especialidades_data.map(e => e.nombre).join(', ')}
                </span>
              </>
            )}

            <br /><br />
            <span className="text-destructive font-medium">
              ⚠️ Esta acción no se puede deshacer y eliminará: El perfil del doctor, su usuario asociado, todos los roles y permisos, y el historial de citas (si las hay).
            </span>
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