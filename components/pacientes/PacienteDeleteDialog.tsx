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
            <Trash2 className="h-5 w-5 text-amber-600" />
            ¿Desactivar Paciente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción desactivará al paciente{' '}
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
            <span className="text-amber-600 font-medium">
              ℹ️ El paciente será desactivado y ya no aparecerá en los listados activos.
              <br />
              • No podrá iniciar sesión en el sistema
              <br />
              • Se conservará su historial médico completo
              <br />
              • Las citas pasadas permanecerán registradas
              <br />
              • Los datos se mantienen para auditoría
              <br />
              • Puede ser reactivado posteriormente por un administrador
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
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desactivando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sí, desactivar paciente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
