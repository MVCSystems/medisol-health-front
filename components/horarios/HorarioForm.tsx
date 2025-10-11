"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Clock } from 'lucide-react';
import { horarioService } from '@/services/horario.service';

interface HorarioFormProps {
  doctorId: number;
  horario?: {
    id: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    duracion_cita: number;
    activo: boolean;
  };
  onSuccess: () => void;
  onCancel: () => void;
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

export default function HorarioForm({ doctorId, horario, onSuccess, onCancel }: HorarioFormProps) {
  const [formData, setFormData] = useState({
    dia_semana: horario?.dia_semana ?? 0,
    hora_inicio: horario?.hora_inicio ?? '08:00',
    hora_fin: horario?.hora_fin ?? '17:00',
    duracion_cita: horario?.duracion_cita ?? 30,
    activo: horario?.activo ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        doctor: doctorId
      };

      if (horario) {
        await horarioService.updateHorario(horario.id, data);
      } else {
        await horarioService.createHorario(data);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      alert('Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {horario ? 'Editar Horario' : 'Nuevo Horario'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Día de la semana */}
          <div className="space-y-2">
            <Label htmlFor="dia_semana">Día de la semana</Label>
            <Select
              value={formData.dia_semana.toString()}
              onValueChange={(value) => handleChange('dia_semana', parseInt(value))}
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

          {/* Hora de inicio */}
          <div className="space-y-2">
            <Label htmlFor="hora_inicio">Hora de inicio</Label>
            <Input
              id="hora_inicio"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => handleChange('hora_inicio', e.target.value)}
              required
            />
          </div>

          {/* Hora de fin */}
          <div className="space-y-2">
            <Label htmlFor="hora_fin">Hora de fin</Label>
            <Input
              id="hora_fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) => handleChange('hora_fin', e.target.value)}
              required
            />
          </div>

          {/* Duración de cita */}
          <div className="space-y-2">
            <Label htmlFor="duracion_cita">Duración de cita (minutos)</Label>
            <Select
              value={formData.duracion_cita.toString()}
              onValueChange={(value) => handleChange('duracion_cita', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1 hora 30 minutos</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="activo">Horario activo</Label>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange('activo', checked)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Guardando...' : (horario ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}