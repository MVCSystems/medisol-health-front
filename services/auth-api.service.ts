import { api } from '@/lib/axios'
import { LoginRequest, LoginResponse } from '@/types/usuarios'

class AuthApiService {
  /**
   * Realizar login con DNI y contraseña
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/login/', credentials)
    return response.data
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post<{ access: string }>('/api/token/refresh/', {
      refresh: refreshToken
    })
    return response.data
  }

  /**
   * Verificar si un token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await api.post('/api/token/verify/', { token })
      return true
    } catch {
      return false
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser() {
    const response = await api.get('/api/usuarios/me/')
    return response.data
  }

  /**
   * Cerrar sesión (opcional - backend puede no tenerlo)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/api/logout/', { refresh: refreshToken })
    } catch {
      // El logout puede fallar si el backend no lo implementa
      // pero aún así limpiamos los tokens localmente
    }
  }
}

export const authApiService = new AuthApiService()