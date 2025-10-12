'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Stethoscope } from 'lucide-react'
import type { Especialidad, CreateEspecialidadData, UpdateEspecialidadData } from '@/types/clinicas'

interface EspecialidadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateEspecialidadData | UpdateEspecialidadData) => Promise<void>
  especialidad?: Especialidad | null
  loading: boolean
}

type FormData = {
  nombre: string
  descripcion: string
  icono: string
  activa: boolean
}

const initialFormData: FormData = {
  nombre: '',
  descripcion: '',
  icono: '',
  activa: true,
}

// Iconos médicos comunes
const iconosSugeridos = [
  '🩺', '❤️', '🧠', '🦷', '👁️', '🦴', '🫁', '🩸',
  '💊', '🔬', '🩹', '🏥', '🚑', '⚕️', '🧬', '🦠'
]

export function EspecialidadForm({ open, onClose, onSubmit, especialidad, loading }: EspecialidadFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mode = especialidad ? 'edit' : 'create'

  useEffect(() => {
    if (open) {
      if (especialidad) {
        setFormData({
          nombre: especialidad.nombre,
          descripcion: especialidad.descripcion || '',
          icono: especialidad.icono || '',
          activa: especialidad.activa !== undefined ? especialidad.activa : true,
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, especialidad])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Limpiar error del campo al editarlo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      icono: formData.icono.trim() || undefined,
      activa: formData.activa,
    }

    await onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {mode === 'create' ? 'Nueva Especialidad' : 'Editar Especialidad'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa la información para registrar una nueva especialidad médica.' 
              : 'Modifica la información de la especialidad.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Cardiología, Neurología, etc."
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción de la especialidad médica"
              rows={3}
            />
          </div>

          {/* Ícono */}
          <div className="space-y-2">
            <Label htmlFor="icono">Ícono</Label>
            <Input
              id="icono"
              value={formData.icono}
              onChange={(e) => handleInputChange('icono', e.target.value)}
              placeholder="Selecciona un emoji o ícono"
              className="text-center text-lg"
            />
            
            {/* Iconos sugeridos */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Iconos sugeridos:</p>
              <div className="flex flex-wrap gap-2">
                {iconosSugeridos.map((icono, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 text-lg"
                    onClick={() => handleInputChange('icono', icono)}
                  >
                    {icono}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Preview del ícono */}
            {formData.icono && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="text-2xl">{formData.icono}</span>
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
            )}
          </div>

          {/* Estado Activa */}
          <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="activa" className="text-sm font-medium">
                Especialidad Activa
              </Label>
              <p className="text-xs text-muted-foreground">
                Determina si la especialidad está disponible para reservas de citas
              </p>
            </div>
            <Switch
              id="activa"
              checked={formData.activa}
              onCheckedChange={(checked) => handleInputChange('activa', checked)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Especialidad' : 'Actualizar Especialidad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}