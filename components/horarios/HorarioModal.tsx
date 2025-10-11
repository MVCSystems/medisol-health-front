"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Save, X } from 'lucide-react';
import type { HorarioDoctor } from '@/types/clinicas';

interface HorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HorarioDoctor) => Promise<{ success: boolean; error?: string }>;
  doctorId: number;
  horario?: HorarioDoctor | null;
  mode: 'create' | 'edit';
}

const DIAS_SEMANA = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' }
];

const DURACIONES_CITA = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' }
];

export default function HorarioModal({
  isOpen,
  onClose,
  onSave,
  doctorId,
  horario,
  mode
}: HorarioModalProps) {
  const [formData, setFormData] = useState<HorarioDoctor>({
    doctor: doctorId,
    dia_semana: 0,
    hora_inicio: '08:00',
    hora_fin: '17:00',
    duracion_cita: 30,
    activo: true,
    tiene_refrigerio: true,
    hora_refrigerio_inicio: '12:00',
    hora_refrigerio_fin: '13:00'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (horario && mode === 'edit') {
      setFormData({
        id: horario.id,
        doctor: horario.doctor,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        duracion_cita: horario.duracion_cita,
        activo: horario.activo,
        tiene_refrigerio: horario.tiene_refrigerio ?? true,
        hora_refrigerio_inicio: horario.hora_refrigerio_inicio ?? '12:00',
        hora_refrigerio_fin: horario.hora_refrigerio_fin ?? '13:00'
      });
    } else {
      setFormData({
        doctor: doctorId,
        dia_semana: 0,
        hora_inicio: '08:00',
        hora_fin: '17:00',
        duracion_cita: 30,
        activo: true,
        tiene_refrigerio: true,
        hora_refrigerio_inicio: '12:00',
        hora_refrigerio_fin: '13:00'
      });
    }
    setError(null);
  }, [horario, mode, doctorId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      setLoading(false);
      return;
    }

    try {
      const result = await onSave(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Error al guardar el horario');
      }
    } catch {
      setError('Error inesperado al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof HorarioDoctor, value: string | number | boolean) => {
    setFormData((prev: HorarioDoctor) => ({
      ...prev,
      [field]: value
    }));
  };

  const title = mode === 'create' ? 'Crear Nuevo Horario' : 'Editar Horario';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Día de la semana */}
          <div className="space-y-2">
            <Label>Día de la semana</Label>
            <Select
              value={formData.dia_semana.toString()}
              onValueChange={(value) => handleFieldChange('dia_semana', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un día" />
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia.value} value={dia.value.toString()}>
                    {dia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => handleFieldChange('hora_inicio', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hora de fin</Label>
              <Input
                type="time"
                value={formData.hora_fin}
                onChange={(e) => handleFieldChange('hora_fin', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duración de cita */}
          <div className="space-y-2">
            <Label>Duración de cita</Label>
            <Select
              value={formData.duracion_cita.toString()}
              onValueChange={(value) => handleFieldChange('duracion_cita', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona duración" />
              </SelectTrigger>
              <SelectContent>
                {DURACIONES_CITA.map((duracion) => (
                  <SelectItem key={duracion.value} value={duracion.value.toString()}>
                    {duracion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <Label>Horario activo</Label>
            <Switch
              checked={formData.activo}
              onCheckedChange={(checked) => handleFieldChange('activo', checked)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}