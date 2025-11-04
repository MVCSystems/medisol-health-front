// Tipos principales para usuarios
export interface Usuario {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono?: string;
  direccion?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  fecha_eliminacion?: string;
  roles: string[]; // Array simple de nombres de grupos de Django
  rol?: string; // Rol principal del usuario (calculado por backend)
  date_joined: string;
}

// Tipos para formularios
export interface CreateUsuarioData {
  dni: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  direccion?: string;
  rol?: string;
}

export interface UpdateUsuarioData {
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono?: string;
  direccion?: string;
  is_active: boolean;
  rol?: string;
  password?: string;
  password2?: string;
}

// Tipos para respuestas de API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Enums para filtros
export enum RoleFilter {
  ALL = "ALL",
  ADMINISTRADOR = "Administrador",
  DOCTOR = "Doctor", 
  PACIENTE = "Paciente",
  RECEPCIONISTA = "Recepcionista"
}

export enum StatusFilter {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}