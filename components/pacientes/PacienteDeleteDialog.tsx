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
import type { Paciente } from '@/types/clinicas';

interface PacienteDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paciente: Paciente | null;
  isLoading?: boolean;
}

export function PacienteDeleteDialog({
  open,
  onClose,
  onConfirm,
  paciente,
  isLoading = false
}: PacienteDeleteDialogProps) {
  if (!paciente) return null;

  const pacienteName = `${paciente.usuario_data?.first_name || ''} ${paciente.usuario_data?.last_name || ''}`.trim() || 
                       paciente.usuario_data?.dni || 'Paciente';

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            ¿Eliminar Paciente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente al paciente{' '}
            <span className="font-semibold">{pacienteName}</span>
            {paciente.usuario_data?.dni && (
              <span> (DNI: {paciente.usuario_data.dni})</span>
            )}
            
            {paciente.fecha_nacimiento && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Edad: {calcularEdad(paciente.fecha_nacimiento)} años
                </span>
              </>
            )}

            {paciente.numero_documento && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Documento: {paciente.tipo_documento} {paciente.numero_documento}
                </span>
              </>
            )}

            {paciente.celular && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Contacto: {paciente.celular}
                </span>
              </>
            )}

            <br /><br />
            <span className="text-destructive font-medium">
              ⚠️ Esta acción no se puede deshacer y eliminará: El perfil del paciente, su usuario asociado, todos los roles y permisos, el historial médico (si existe) y las citas programadas y pasadas.
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
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sí, eliminar paciente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
