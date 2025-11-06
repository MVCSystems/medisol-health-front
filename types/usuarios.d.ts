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
  roles: string[]; // Array simple de nombres de grupos de Django
  rol?: string; // Rol principal del usuario
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

// Datos para el registro
export interface RegisterRequest {
  dni: string;
  email: string;
  password: string;
  password2: string; // Confirmación de contraseña requerida por el backend
  first_name: string;
  last_name: string;
  telefono?: string;
  direccion?: string;
}

// Respuesta del registro
export interface RegisterResponse {
  user: {
    id: number;
    dni: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono?: string;
    direccion?: string;
  };
  refresh: string;
  access: string;
  message: string;
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