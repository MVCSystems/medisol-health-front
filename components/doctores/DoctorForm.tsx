import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, User } from 'lucide-react';
import { useClinicas } from '@/hooks/useClinicas';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useDoctores } from '@/hooks/useDoctores';
import type { DoctorCreateData } from '@/services/doctor.service';

interface DoctorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DoctorForm({ onSuccess, onCancel }: DoctorFormProps) {
  const { clinicas, loading: clinicasLoading } = useClinicas();
  const { especialidades, loading: especialidadesLoading } = useEspecialidades();
  const { registrarDoctor } = useDoctores();

  const [formData, setFormData] = useState<DoctorCreateData>({
    dni: '',
    email: '',
    password: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    direccion: '',
    titulo: '',
    biografia: '',
    precio_consulta_base: 0,
    especialidades: [],
    clinica_id: 0,
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio_consulta_base' ? parseFloat(value) || 0 : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar selección de clínica
  const handleClinicaChange = (value: string) => {
    setFormData(prev => ({ ...prev, clinica_id: parseInt(value) }));
    if (errors.clinica_id) {
      setErrors(prev => ({ ...prev, clinica_id: '' }));
    }
  };

  // Manejar selección de especialidades
  const handleEspecialidadChange = (especialidadId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especialidades: checked
        ? [...prev.especialidades, especialidadId]
        : prev.especialidades.filter(id => id !== especialidadId)
    }));
    
    if (errors.especialidades) {
      setErrors(prev => ({ ...prev, especialidades: '' }));
    }
  };

  // Manejar selección de foto
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dni || formData.dni.length !== 8) {
      newErrors.dni = 'DNI debe tener 8 dígitos';
    }
    if (!formData.email) {
      newErrors.email = 'Email es requerido';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Contraseña debe tener al menos 8 caracteres';
    }
    if (!formData.nombres) {
      newErrors.nombres = 'Nombres son requeridos';
    }
    if (!formData.apellido_paterno) {
      newErrors.apellido_paterno = 'Apellido paterno es requerido';
    }
    if (!formData.titulo) {
      newErrors.titulo = 'Título profesional es requerido';
    }
    if (formData.precio_consulta_base <= 0) {
      newErrors.precio_consulta_base = 'Precio debe ser mayor a 0';
    }
    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Debe seleccionar al menos una especialidad';
    }
    if (!formData.clinica_id) {
      newErrors.clinica_id = 'Debe seleccionar una clínica';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend: DoctorCreateData = {
        ...formData,
        foto: foto || undefined
      };

      const result = await registrarDoctor(dataToSend);
      
      if (result) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (clinicasLoading || especialidadesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Registrar Nuevo Doctor
        </CardTitle>
        <CardDescription>
          Complete la información para registrar un nuevo doctor en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={fotoPreview} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
                id="foto-input"
              />
              <Label htmlFor="foto-input" className="cursor-pointer">
                <Button type="button" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir Foto
                </Button>
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              
              <div>
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  maxLength={8}
                />
                {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@clinica.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  placeholder="Juan Carlos"
                />
                {errors.nombres && <p className="text-sm text-red-500">{errors.nombres}</p>}
              </div>

              <div>
                <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                <Input
                  id="apellido_paterno"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  placeholder="García"
                />
                {errors.apellido_paterno && <p className="text-sm text-red-500">{errors.apellido_paterno}</p>}
              </div>

              <div>
                <Label htmlFor="apellido_materno">Apellido Materno</Label>
                <Input
                  id="apellido_materno"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  placeholder="López"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="01-234-5678"
                />
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Av. Principal 123, Lima"
                  rows={2}
                />
              </div>
            </div>

            {/* Información Profesional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Profesional</h3>

              <div>
                <Label htmlFor="titulo">Título Profesional *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Médico Cirujano, Especialista en..."
                />
                {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
              </div>

              <div>
                <Label htmlFor="precio_consulta_base">Precio Consulta Base (S/) *</Label>
                <Input
                  id="precio_consulta_base"
                  name="precio_consulta_base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_consulta_base}
                  onChange={handleInputChange}
                  placeholder="150.00"
                />
                {errors.precio_consulta_base && <p className="text-sm text-red-500">{errors.precio_consulta_base}</p>}
              </div>

              <div>
                <Label htmlFor="clinica_id">Clínica *</Label>
                <Select onValueChange={handleClinicaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicas.map((clinica) => (
                      <SelectItem key={clinica.id} value={clinica.id.toString()}>
                        {clinica.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clinica_id && <p className="text-sm text-red-500">{errors.clinica_id}</p>}
              </div>

              <div>
                <Label>Especialidades *</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {especialidades.map((especialidad) => (
                    <div key={especialidad.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`especialidad-${especialidad.id}`}
                        checked={formData.especialidades.includes(especialidad.id)}
                        onCheckedChange={(checked) =>
                          handleEspecialidadChange(especialidad.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`especialidad-${especialidad.id}`}
                        className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                      >
                        {especialidad.icono && <span>{especialidad.icono}</span>}
                        {especialidad.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.especialidades && <p className="text-sm text-red-500">{errors.especialidades}</p>}
              </div>

              <div>
                <Label htmlFor="biografia">Biografía Profesional</Label>
                <Textarea
                  id="biografia"
                  name="biografia"
                  value={formData.biografia}
                  onChange={handleInputChange}
                  placeholder="Descripción de la experiencia y logros profesionales..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Doctor'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}