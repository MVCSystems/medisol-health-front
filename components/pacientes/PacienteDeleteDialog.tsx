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
            <Trash2 className="h-5 w-5 text-red-600" />
            ¿Eliminar Paciente?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Esta acción eliminará permanentemente al paciente{' '}
              <span className="font-semibold">{pacienteName}</span>
              {paciente.usuario_data?.dni && (
                <span> (DNI: {paciente.usuario_data.dni})</span>
              )}
            </div>
            
            {paciente.fecha_nacimiento && (
              <div className="text-sm text-muted-foreground">
                Edad: {calcularEdad(paciente.fecha_nacimiento)} años
              </div>
            )}

            {paciente.numero_documento && (
              <div className="text-sm text-muted-foreground">
                Documento: {paciente.tipo_documento} {paciente.numero_documento}
              </div>
            )}

            {paciente.celular && (
              <div className="text-sm text-muted-foreground">
                Contacto: {paciente.celular}
              </div>
            )}

            <div className="text-red-600 font-medium">
              ⚠️ Esta acción no se puede deshacer y eliminará:
            </div>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>El perfil del paciente</li>
              <li>Su usuario asociado en el sistema</li>
              <li>Todos los roles y permisos</li>
              <li>El historial médico (si existe)</li>
              <li>Las citas programadas y pasadas</li>
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
                Sí, eliminar paciente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}