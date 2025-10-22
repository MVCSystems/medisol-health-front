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
import { Upload } from 'lucide-react'
import { buildImageUrl } from '@/lib/image-utils'
import type { Clinica, CreateClinicaData, UpdateClinicaData } from '@/types/clinicas'

interface ClinicaFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateClinicaData | UpdateClinicaData) => Promise<void>
  clinica?: Clinica | null
  loading: boolean
}

type FormData = {
  nombre: string
  direccion: string
  telefono: string
  email: string
  sitio_web: string
  descripcion: string
  activa: boolean
  logo: File | null
}

const initialFormData: FormData = {
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
  sitio_web: '',
  descripcion: '',
  activa: true,
  logo: null,
}

export function ClinicaForm({ open, onClose, onSubmit, clinica, loading }: ClinicaFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const mode = clinica ? 'edit' : 'create'

  useEffect(() => {
    if (open) {
      if (clinica) {
        setFormData({
          nombre: clinica.nombre,
          direccion: clinica.direccion,
          telefono: clinica.telefono,
          email: clinica.email,
          sitio_web: clinica.sitio_web || '',
          descripcion: clinica.descripcion || '',
          activa: clinica.activa,
          logo: null,
        })
        if (clinica.logo) {
          // Construir URL completa usando la utilidad (automáticamente convierte HTTP a HTTPS)
          const logoUrl = buildImageUrl(clinica.logo)
          setLogoPreview(logoUrl)
        }
      } else {
        setFormData(initialFormData)
        setLogoPreview(null)
      }
      setErrors({})
    }
  }, [open, clinica])

  const handleInputChange = (field: keyof FormData, value: string | boolean | File | null) => {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim(),
      sitio_web: formData.sitio_web.trim() || undefined,
      descripcion: formData.descripcion.trim() || undefined,
      activa: formData.activa,
      logo: formData.logo,
    }

    await onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Clínica' : 'Editar Clínica'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa la información para registrar una nueva clínica.' 
              : 'Modifica la información de la clínica.'}
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
              placeholder="Nombre de la clínica"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Dirección completa de la clínica"
              className={errors.direccion ? 'border-red-500' : ''}
            />
            {errors.direccion && (
              <p className="text-sm text-red-600">{errors.direccion}</p>
            )}
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="(01) 234-5678"
                className={errors.telefono ? 'border-red-500' : ''}
              />
              {errors.telefono && (
                <p className="text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contacto@clinica.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Sitio Web */}
          <div className="space-y-2">
            <Label htmlFor="sitio_web">Sitio Web</Label>
            <Input
              id="sitio_web"
              type="url"
              value={formData.sitio_web}
              onChange={(e) => handleInputChange('sitio_web', e.target.value)}
              placeholder="https://www.clinica.com"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción de los servicios y especialidades"
              rows={3}
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-4">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Subir
              </Button>
            </div>
            {logoPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Preview del logo:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Preview del logo"
                  className="h-20 w-20 object-cover rounded border"
                  onError={() => {
                    setLogoPreview(null)
                  }}
                />
              </div>
            )}

          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="activa"
              checked={formData.activa}
              onCheckedChange={(checked) => handleInputChange('activa', checked)}
            />
            <Label htmlFor="activa">Clínica activa</Label>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Clínica' : 'Actualizar Clínica'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}