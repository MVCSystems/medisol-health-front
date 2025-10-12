import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit } from 'lucide-react';
import { useClinicas } from '@/hooks/useClinicas';
import { usePacientes } from '@/hooks/usePacientes';
import type { Paciente } from '@/types/clinicas';
import type { PacienteCreateData } from '@/services/paciente.service';

interface PacienteEditFormProps {
  paciente: Paciente;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PacienteEditForm({ paciente, onSuccess, onCancel }: PacienteEditFormProps) {
  const { clinicas, loading: clinicasLoading } = useClinicas();
  const { actualizarPaciente } = usePacientes();

  const [formData, setFormData] = useState<Partial<PacienteCreateData>>({
    dni: paciente.usuario_data?.dni || '',
    email: paciente.usuario_data?.email || '',
    nombres: paciente.usuario_data?.first_name || '',
    apellido_paterno: paciente.usuario_data?.last_name?.split(' ')[0] || '',
    apellido_materno: paciente.usuario_data?.last_name?.split(' ').slice(1).join(' ') || '',
    telefono: paciente.usuario_data?.telefono || '',
    direccion: paciente.usuario_data?.direccion || '',
    celular: paciente.celular || '',
    tipo_documento: paciente.tipo_documento || 'DNI',
    numero_documento: paciente.numero_documento || '',
    fecha_nacimiento: paciente.fecha_nacimiento || '',
    genero: paciente.genero === 'M' ? 'Masculino' : 
           paciente.genero === 'F' ? 'Femenino' : 'Otro',
    departamento: paciente.departamento || '',
    provincia: paciente.provincia || '',
    distrito: paciente.distrito || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar selección de clínica
  const handleClinicaChange = (value: string) => {
    setFormData(prev => ({ ...prev, clinica_id: parseInt(value) }));
  };

  // Manejar selección de género
  const handleGeneroChange = (value: string) => {
    setFormData(prev => ({ ...prev, genero: value as 'Masculino' | 'Femenino' | 'Otro' }));
  };

  // Manejar selección de tipo de documento
  const handleTipoDocumentoChange = (value: string) => {
    setFormData(prev => ({ ...prev, tipo_documento: value }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres) {
      newErrors.nombres = 'Nombres son requeridos';
    }
    if (!formData.apellido_paterno) {
      newErrors.apellido_paterno = 'Apellido paterno es requerido';
    }
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
    }
    if (!formData.numero_documento) {
      newErrors.numero_documento = 'Número de documento es requerido';
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
      const success = await actualizarPaciente(paciente.id, formData);
      
      if (success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (clinicasLoading) {
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
          <Edit className="h-5 w-5" />
          Editar Paciente
        </CardTitle>
        <CardDescription>
          Modificar la información del paciente {formData.nombres} {formData.apellido_paterno}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              
              <div>
                <Label htmlFor="dni">DNI (No editable)</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">El DNI no puede ser modificado</p>
              </div>

              <div>
                <Label htmlFor="email">Email (No editable)</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">El email no puede ser modificado</p>
              </div>

              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  placeholder="María José"
                />
                {errors.nombres && <p className="text-sm text-destructive">{errors.nombres}</p>}
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
                {errors.apellido_paterno && <p className="text-sm text-destructive">{errors.apellido_paterno}</p>}
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
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                />
                {errors.fecha_nacimiento && <p className="text-sm text-destructive">{errors.fecha_nacimiento}</p>}
              </div>

              <div>
                <Label htmlFor="genero">Género *</Label>
                <Select onValueChange={handleGeneroChange} value={formData.genero}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información de Contacto y Documento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contacto y Documentación</h3>

              <div>
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <Select onValueChange={handleTipoDocumentoChange} value={formData.tipo_documento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="Carnet de Extranjería">Carnet de Extranjería</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="numero_documento">Número de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  placeholder="Número del documento"
                />
                {errors.numero_documento && <p className="text-sm text-destructive">{errors.numero_documento}</p>}
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono Fijo</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="01-234-5678"
                />
              </div>

              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="987-654-321"
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
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  placeholder="Lima"
                />
              </div>

              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  placeholder="Lima"
                />
              </div>

              <div>
                <Label htmlFor="distrito">Distrito</Label>
                <Input
                  id="distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={handleInputChange}
                  placeholder="Miraflores"
                />
              </div>

              {clinicas.length > 0 && (
                <div>
                  <Label htmlFor="clinica_id">Clínica (Opcional)</Label>
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
                </div>
              )}
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
                  Actualizando...
                </>
              ) : (
                'Actualizar Paciente'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
