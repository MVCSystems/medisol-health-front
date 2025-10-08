export interface Usuario {
  id: number;
  dni: string;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  direccion?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  roles: UsuarioRol[];
}

export interface UsuarioRol {
  id: number;
  rol: string;
  clinica: string | null;
}

export interface Grupo {
  id: number;
  name: string;
}

// Respuesta del login
export interface LoginResponse {
  user: Usuario;
  tokens: {
    refresh: string;
    access: string;
  };
}

// Datos para el login
export interface LoginRequest {
  dni: string;
  password: string;
}

export interface UsuariosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Usuario[];
}

export interface GruposResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Grupo[];
}