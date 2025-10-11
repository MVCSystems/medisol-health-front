import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';
import { useClinicas } from '@/hooks/useClinicas';
import { usePacientes } from '@/hooks/usePacientes';
import type { PacienteCreateData } from '@/services/paciente.service';

interface PacienteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PacienteForm({ onSuccess, onCancel }: PacienteFormProps) {
  const { clinicas, loading: clinicasLoading } = useClinicas();
  const { registrarPaciente } = usePacientes();

  const [formData, setFormData] = useState<PacienteCreateData>({
    dni: '',
    email: '',
    password: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    direccion: '',
    celular: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    departamento: '',
    provincia: '',
    distrito: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si se cambia el DNI, también cambiar número_documento
    if (name === 'dni') {
      setFormData(prev => ({ ...prev, numero_documento: value }));
    }
    
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
      const result = await registrarPaciente(formData);
      
      if (result) {
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
          <User className="h-5 w-5" />
          Registrar Nuevo Paciente
        </CardTitle>
        <CardDescription>
          Complete la información para registrar un nuevo paciente en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="paciente@email.com"
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
                  placeholder="María José"
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
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                />
                {errors.fecha_nacimiento && <p className="text-sm text-red-500">{errors.fecha_nacimiento}</p>}
              </div>

              <div>
                <Label htmlFor="genero">Género *</Label>
                <Select onValueChange={handleGeneroChange} defaultValue="Masculino">
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
                <Select onValueChange={handleTipoDocumentoChange} defaultValue="DNI">
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
                {errors.numero_documento && <p className="text-sm text-red-500">{errors.numero_documento}</p>}
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
                  Registrando...
                </>
              ) : (
                'Registrar Paciente'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}