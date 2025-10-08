// Tipos para clínicas
export interface Clinica {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  sitio_web?: string;
  logo?: string;
  descripcion?: string;
  activa: boolean;
  fecha_registro: string;
}

// Tipos para especialidades
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

// Tipos para doctores
export interface Doctor {
  id: number;
  usuario?: number;
  usuario_data?: {
    id: number;
    dni: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono?: string;
    direccion?: string;
  };
  nombres?: string;
  apellidos?: string;
  tipo_documento?: string;
  numero_documento?: string;
  especialidades: number[];
  especialidades_data: Especialidad[];
  clinica: number;
  clinica_nombre: string;
  titulo: string;
  biografia?: string;
  foto?: string;
  precio_consulta_base: number;
}

// Tipos para pacientes
export interface Paciente {
  id: number;
  usuario?: number;
  usuario_data?: {
    id: number;
    dni: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono?: string;
    direccion?: string;
  };
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  genero: 'M' | 'F' | 'O';
  tipo_documento?: string;
  numero_documento?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  celular?: string;
}

// Tipos para citas
export interface Cita {
  id: number;
  clinica: number;
  clinica_nombre: string;
  doctor: number;
  doctor_nombre: string;
  doctor_precio_base: number;
  paciente: number;
  paciente_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  notas?: string;
  precio_consulta: number;
  descuento: number;
  precio_total: number;
  fecha_creacion: string;
}

// Tipos para crear citas
export interface CitaCreate {
  clinica: number;
  doctor: number;
  paciente: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado?: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  notas?: string;
  precio_consulta?: number;
  descuento?: number;
}

// Tipos para horarios de doctores
export interface HorarioDoctor {
  id: number;
  doctor: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
}

// Tipos para disponibilidad de citas
export interface DisponibilidadCita {
  id: number;
  doctor: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Tipos de respuesta de API
export type ClinicasResponse = PaginatedResponse<Clinica>;
export type EspecialidadesResponse = PaginatedResponse<Especialidad>;
export type DoctoresResponse = PaginatedResponse<Doctor>;
export type PacientesResponse = PaginatedResponse<Paciente>;
export type CitasResponse = PaginatedResponse<Cita>;
export type HorariosDoctorResponse = PaginatedResponse<HorarioDoctor>;
export type DisponibilidadCitaResponse = PaginatedResponse<DisponibilidadCita>;

// Tipos para filtros
export interface CitaFilters {
  clinica?: number;
  doctor?: number;
  paciente?: number;
  fecha?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface DoctorFilters {
  clinica?: number;
  especialidades?: number;
  search?: string;
}