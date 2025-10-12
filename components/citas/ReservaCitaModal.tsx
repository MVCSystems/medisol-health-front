"use client"

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, Clock, User, DollarSign, FileText } from 'lucide-react';
import type { DisponibilidadCita } from '@/types/clinicas';
import type { Doctor } from '@/types/clinicas';

interface ReservaCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  slot: DisponibilidadCita | null;
  onReservar: (datosCita: DatosCitaReserva) => Promise<void>;
  loading: boolean;
}

export interface DatosCitaReserva {
  paciente_nombre: string;
  paciente_apellido: string;
  paciente_email: string;
  paciente_telefono: string;
  paciente_dni: string;
  motivo_consulta: string;
  tipo_cita: 'primera_vez' | 'control' | 'urgencia';
  observaciones?: string;
}

export default function ReservaCitaModal({
  isOpen,
  onClose,
  doctor,
  slot,
  onReservar,
  loading
}: ReservaCitaModalProps) {
  const [formData, setFormData] = useState<DatosCitaReserva>({
    paciente_nombre: '',
    paciente_apellido: '',
    paciente_email: '',
    paciente_telefono: '',
    paciente_dni: '',
    motivo_consulta: '',
    tipo_cita: 'primera_vez',
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validarFormulario = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente_nombre.trim()) {
      newErrors.paciente_nombre = 'El nombre es requerido';
    }

    if (!formData.paciente_apellido.trim()) {
      newErrors.paciente_apellido = 'El apellido es requerido';
    }

    if (!formData.paciente_email.trim()) {
      newErrors.paciente_email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.paciente_email)) {
      newErrors.paciente_email = 'Email inválido';
    }

    if (!formData.paciente_telefono.trim()) {
      newErrors.paciente_telefono = 'El teléfono es requerido';
    } else if (!/^\d{8,9}$/.test(formData.paciente_telefono.replace(/\s+/g, ''))) {
      newErrors.paciente_telefono = 'Teléfono debe tener 8-9 dígitos';
    }

    if (!formData.paciente_dni.trim()) {
      newErrors.paciente_dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.paciente_dni)) {
      newErrors.paciente_dni = 'DNI debe tener 8 dígitos';
    }

    if (!formData.motivo_consulta.trim()) {
      newErrors.motivo_consulta = 'El motivo de consulta es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      await onReservar(formData);
      // Limpiar formulario
      setFormData({
        paciente_nombre: '',
        paciente_apellido: '',
        paciente_email: '',
        paciente_telefono: '',
        paciente_dni: '',
        motivo_consulta: '',
        tipo_cita: 'primera_vez',
        observaciones: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error al reservar cita:', error);
    }
  };

  const handleInputChange = (field: keyof DatosCitaReserva, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!slot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reservar Cita Médica
          </DialogTitle>
        </DialogHeader>

        {/* Resumen de la cita */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
          <h3 className="font-medium text-foreground">Resumen de la cita</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{doctor.nombres} {doctor.apellidos}</p>
                <p className="text-sm text-muted-foreground">
                  {doctor.especialidades_data && doctor.especialidades_data.length > 0 
                    ? doctor.especialidades_data[0].nombre 
                    : 'Medicina General'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">S/ {doctor.precio_consulta_base}</p>
                <p className="text-sm text-muted-foreground">Consulta</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{formatearFecha(slot.fecha)}</p>
                <p className="text-sm text-muted-foreground">Fecha</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {formatearHora(slot.hora_inicio)} - {formatearHora(slot.hora_fin)}
                </p>
                <p className="text-sm text-muted-foreground">Horario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_nombre">Nombres *</Label>
              <Input
                id="paciente_nombre"
                value={formData.paciente_nombre}
                onChange={(e) => handleInputChange('paciente_nombre', e.target.value)}
                placeholder="Ingrese sus nombres"
                className={errors.paciente_nombre ? 'border-destructive' : ''}
              />
              {errors.paciente_nombre && (
                <p className="text-sm text-destructive">{errors.paciente_nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paciente_apellido">Apellidos *</Label>
              <Input
                id="paciente_apellido"
                value={formData.paciente_apellido}
                onChange={(e) => handleInputChange('paciente_apellido', e.target.value)}
                placeholder="Ingrese sus apellidos"
                className={errors.paciente_apellido ? 'border-destructive' : ''}
              />
              {errors.paciente_apellido && (
                <p className="text-sm text-destructive">{errors.paciente_apellido}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_dni">DNI *</Label>
              <Input
                id="paciente_dni"
                value={formData.paciente_dni}
                onChange={(e) => handleInputChange('paciente_dni', e.target.value)}
                placeholder="12345678"
                maxLength={8}
                className={errors.paciente_dni ? 'border-destructive' : ''}
              />
              {errors.paciente_dni && (
                <p className="text-sm text-destructive">{errors.paciente_dni}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paciente_telefono">Teléfono *</Label>
              <Input
                id="paciente_telefono"
                value={formData.paciente_telefono}
                onChange={(e) => handleInputChange('paciente_telefono', e.target.value)}
                placeholder="987654321"
                className={errors.paciente_telefono ? 'border-destructive' : ''}
              />
              {errors.paciente_telefono && (
                <p className="text-sm text-destructive">{errors.paciente_telefono}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paciente_email">Email *</Label>
            <Input
              id="paciente_email"
              type="email"
              value={formData.paciente_email}
              onChange={(e) => handleInputChange('paciente_email', e.target.value)}
              placeholder="ejemplo@correo.com"
              className={errors.paciente_email ? 'border-destructive' : ''}
            />
            {errors.paciente_email && (
              <p className="text-sm text-destructive">{errors.paciente_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_cita">Tipo de Cita *</Label>
            <Select
              value={formData.tipo_cita}
              onValueChange={(value) => handleInputChange('tipo_cita', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primera_vez">Primera vez</SelectItem>
                <SelectItem value="control">Control</SelectItem>
                <SelectItem value="urgencia">Urgencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo_consulta">Motivo de Consulta *</Label>
            <Textarea
              id="motivo_consulta"
              value={formData.motivo_consulta}
              onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
              placeholder="Describa brevemente el motivo de su consulta"
              rows={3}
              className={errors.motivo_consulta ? 'border-destructive' : ''}
            />
            {errors.motivo_consulta && (
              <p className="text-sm text-destructive">{errors.motivo_consulta}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones adicionales</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Información adicional (opcional)"
              rows={2}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Reservando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Reservar Cita
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
