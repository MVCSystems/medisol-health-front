"use client";

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
import type { Usuario } from '@/types/usuario';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  usuario: Usuario | null;
  isLoading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  usuario,
  isLoading = false
}: DeleteConfirmDialogProps) {
  if (!usuario) return null;

  const userName = `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.dni;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar Usuario?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción desactivará al usuario{' '}
              <span className="font-semibold">{userName}</span> (DNI: {usuario.dni}).
            </p>
            {usuario.roles && usuario.roles.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Roles actuales:</span>{' '}
                {usuario.roles.join(', ')}
              </p>
            )}
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md mt-3">
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                ℹ️ Al desactivar este usuario:
              </p>
              <ul className="text-amber-600 dark:text-amber-500 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>No podrá iniciar sesión en el sistema</li>
                <li>Se conservarán todos sus registros y datos</li>
                <li>El historial de actividad permanecerá intacto</li>
                <li>Puede ser reactivado posteriormente</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
          >
            {isLoading ? 'Desactivando...' : 'Sí, desactivar usuario'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
