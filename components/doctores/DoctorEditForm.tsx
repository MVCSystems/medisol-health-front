import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useDoctores } from '@/hooks/useDoctores';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { doctorService } from '@/services/doctor.service';
import Image from 'next/image';
import type { Doctor } from '@/types/clinicas';

interface DoctorEditFormProps {
  doctor: Doctor;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DoctorEditForm({ doctor, onSuccess, onCancel }: DoctorEditFormProps) {
  const { loading } = useDoctores();
  const { especialidades } = useEspecialidades();

  const [formData, setFormData] = useState({
    nombres: doctor.usuario_data?.first_name || '',
    apellido_paterno: doctor.usuario_data?.last_name || '',
    apellido_materno: '',
    email: doctor.usuario_data?.email || '',
    dni: doctor.usuario_data?.dni || '',
    telefono: doctor.usuario_data?.telefono || '',
    direccion: doctor.usuario_data?.direccion || '',
    titulo: doctor.titulo || '',
    especialidades: Array.isArray(doctor.especialidades)
      ? doctor.especialidades.map((esp: any) => typeof esp === 'object' && esp !== null ? esp.id : esp)
      : [],
    biografia: doctor.biografia || '',
    precio_consulta_base: doctor.precio_consulta_base?.toString() || '',
    clinica_id: doctor.clinica?.toString() || ''
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (doctor.foto) {
      setPreviewImage(doctor.foto);
    }
  }, [doctor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEspecialidadesChange = (value: string) => {
    const especialidadId = parseInt(value);
    const currentEspecialidades = Array.isArray(formData.especialidades) ? formData.especialidades : [];
    
    if (currentEspecialidades.includes(especialidadId)) {
      // Remover si ya está seleccionada
      setFormData(prev => ({
        ...prev,
        especialidades: currentEspecialidades.filter(id => id !== especialidadId)
      }));
    } else {
      // Agregar si no está seleccionada
      setFormData(prev => ({
        ...prev,
        especialidades: [...currentEspecialidades, especialidadId]
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: Record<string, string | number | number[] | File> = {
        nombres: formData.nombres,
        apellido_paterno: formData.apellido_paterno,
        email: formData.email,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        titulo: formData.titulo,
        biografia: formData.biografia,
        precio_consulta_base: parseFloat(formData.precio_consulta_base) || 0,
        especialidades: formData.especialidades,
      };

      // Agregar foto si se seleccionó una nueva
      if (selectedFile) {
        updateData.foto = selectedFile;
      }

      await doctorService.update(doctor.id, updateData);
      onSuccess?.();
    } catch (error) {
      console.error('Error al actualizar doctor:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Editar Doctor</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                <Input
                  id="apellido_paterno"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título Profesional *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_consulta_base">Precio de Consulta (S/.)</Label>
                <Input
                  id="precio_consulta_base"
                  name="precio_consulta_base"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio_consulta_base}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidades">Especialidades</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {especialidades.map((especialidad) => (
                  <label key={especialidad.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.especialidades.includes(especialidad.id)}
                      onChange={() => handleEspecialidadesChange(especialidad.id.toString())}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{especialidad.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biografia">Biografía</Label>
              <Textarea
                id="biografia"
                name="biografia"
                value={formData.biografia}
                onChange={handleInputChange}
                placeholder="Descripción profesional del doctor..."
                rows={3}
              />
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Foto de Perfil</h3>
            <div className="space-y-2">
              <Label htmlFor="foto">Seleccionar nueva foto (opcional)</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewImage && (
                <div className="mt-2">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}