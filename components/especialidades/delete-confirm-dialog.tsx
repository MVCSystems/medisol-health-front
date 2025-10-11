'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Especialidad } from '@/types/clinicas'

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  especialidad: Especialidad | null
  loading: boolean
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  especialidad,
  loading,
}: DeleteConfirmDialogProps) {
  if (!especialidad) return null

  const especialidadName = especialidad.nombre

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Esta acción eliminará permanentemente la especialidad{' '}
              <span className="font-semibold">{especialidadName}</span>.
            </div>
            <div className="text-red-600">
              Esta acción no se puede deshacer y también afectará a todos los doctores asociados a esta especialidad.
            </div>
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
  )
}