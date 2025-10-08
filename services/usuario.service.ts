import { api } from '@/lib/axios';
import type { 
  Usuario, 
  CreateUsuarioData, 
  UpdateUsuarioData, 
  PaginatedResponse 
} from '@/types/usuario';

class UsuarioService {
  private readonly baseUrl = '/api/usuarios/usuarios';

  /**
   * Obtener todos los usuarios (solo admin)
   */
  async getAll(): Promise<PaginatedResponse<Usuario>> {
    const response = await api.get<PaginatedResponse<Usuario>>(`${this.baseUrl}/`);
    return response.data;
  }

  /**
   * Obtener usuario por ID
   */
  async getById(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  /**
   * Crear nuevo usuario
   */
  async create(data: CreateUsuarioData): Promise<Usuario> {
    const response = await api.post<Usuario>(`${this.baseUrl}/`, data);
    return response.data;
  }

  /**
   * Actualizar usuario existente
   */
  async update(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await api.patch<Usuario>(`${this.baseUrl}/${id}/`, data);
    return response.data;
  }

  /**
   * Eliminar usuario
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(id: number, data: { current_password: string; new_password: string }): Promise<void> {
    await api.post(`${this.baseUrl}/${id}/cambiar_password/`, data);
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleStatus(id: number, isActive: boolean): Promise<Usuario> {
    return this.update(id, { is_active: isActive } as UpdateUsuarioData);
  }
}

export const usuarioService = new UsuarioService();