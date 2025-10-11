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
import type { Clinica } from '@/types/clinicas'

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  clinica: Clinica | null
  loading: boolean
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  clinica,
  loading,
}: DeleteConfirmDialogProps) {
  if (!clinica) return null

  const clinicaName = clinica.nombre

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Esta acción eliminará permanentemente la clínica{' '}
              <span className="font-semibold">{clinicaName}</span>.
            </div>
            <div className="text-red-600">
              Esta acción no se puede deshacer y también eliminará todos los datos relacionados.
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