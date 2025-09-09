export interface Usuario {
  id: number;
  dni: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  groups: Grupo[];
}

export interface Grupo {
  id: number;
  name: string;
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