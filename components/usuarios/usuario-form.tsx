"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Usuario, CreateUsuarioData, UpdateUsuarioData } from '@/types/usuario';

interface UsuarioFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUsuarioData | UpdateUsuarioData) => Promise<Usuario | null>;
  usuario?: Usuario | null;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export default function UsuarioForm({
  open,
  onClose,
  onSubmit,
  usuario,
  isLoading = false,
  mode
}: UsuarioFormProps) {
  const [formData, setFormData] = useState({
    dni: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    telefono: '',
    direccion: '',
    is_active: true,
    rol: 'Paciente' // Por defecto será Paciente
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Limpiar formulario cuando se abre/cierra
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && usuario) {
        setFormData({
          dni: usuario.dni,
          email: usuario.email,
          password: '',
          password2: '',
          first_name: usuario.first_name,
          last_name: usuario.last_name,
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          is_active: usuario.is_active,
          rol: usuario.roles?.[0]?.rol_nombre || 'Paciente'
        });
      } else {
        setFormData({
          dni: '',
          email: '',
          password: '',
          password2: '',
          first_name: '',
          last_name: '',
          telefono: '',
          direccion: '',
          is_active: true,
          rol: 'Paciente'
        });
      }
      setErrors({});
    }
  }, [open, mode, usuario]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (mode === 'create') {
      if (!formData.dni.trim()) {
        newErrors.dni = 'El DNI es requerido';
      } else if (!/^\d{8}$/.test(formData.dni)) {
        newErrors.dni = 'El DNI debe tener 8 dígitos';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.password2) {
        newErrors.password2 = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let submitData: CreateUsuarioData | UpdateUsuarioData;

    if (mode === 'create') {
      submitData = {
        dni: formData.dni,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        rol: formData.rol,
      };
    } else {
      submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        is_active: formData.is_active,
      };
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa los datos para crear un nuevo usuario'
              : 'Modifica los datos del usuario'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI - Solo en modo crear */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                type="text"
                value={formData.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                placeholder="12345678"
                maxLength={8}
                className={errors.dni ? 'border-destructive' : ''}
              />
              {errors.dni && (
                <p className="text-sm text-destructive">{errors.dni}</p>
              )}
            </div>
          )}

          {/* Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Juan"
                className={errors.first_name ? 'border-destructive' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Pérez"
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="juan@ejemplo.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Contraseñas - Solo en modo crear */}
          {mode === 'create' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">Confirmar Contraseña *</Label>
                <Input
                  id="password2"
                  type="password"
                  value={formData.password2}
                  onChange={(e) => handleInputChange('password2', e.target.value)}
                  placeholder="••••••••"
                  className={errors.password2 ? 'border-destructive' : ''}
                />
                {errors.password2 && (
                  <p className="text-sm text-destructive">{errors.password2}</p>
                )}
              </div>
            </div>
          )}

          {/* Rol - Solo en modo crear */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => handleInputChange('rol', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paciente">Paciente</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && (
                <p className="text-sm text-destructive">{errors.rol}</p>
              )}
            </div>
          )}

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="999123456"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Av. Principal 123, Lima"
              rows={2}
            />
          </div>

          {/* Estado activo - Solo en modo editar */}
          {mode === 'edit' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Usuario activo</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
