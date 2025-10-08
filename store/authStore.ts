import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserRole {
  id: number
  rol: string
  clinica: string | null
}

interface User {
  id: number
  dni: string
  email: string
  first_name: string
  last_name: string
  telefono?: string
  direccion?: string
  roles: UserRole[]
  is_staff: boolean
  is_superuser: boolean
}

interface AuthTokens {
  access: string | null
  refresh: string | null
}

interface LoginResponse {
  user: User
  tokens: {
    refresh: string
    access: string
  }
}

interface AuthState {
  user: User | null
  tokens: AuthTokens
  isAuthenticated: boolean
  
  // Actions
  login: (data: LoginResponse) => void
  logout: () => void
  setTokens: (access: string, refresh: string) => void
  updateUser: (user: User) => void
  
  // Getters
  getUserRole: () => string | null
  getUserClinica: () => string | null
  isAdmin: () => boolean
  isDoctor: () => boolean
  isPaciente: () => boolean
  isRecepcionista: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: {
        access: null,
        refresh: null,
      },
      isAuthenticated: false,

      // Actions
      login: (data: LoginResponse) => 
        set({ 
          user: data.user,
          tokens: data.tokens,
          isAuthenticated: true
        }),

      logout: () => 
        set({ 
          user: null,
          tokens: { access: null, refresh: null },
          isAuthenticated: false
        }),

      setTokens: (access: string, refresh: string) => 
        set({ tokens: { access, refresh } }),

      updateUser: (user: User) => 
        set({ user }),

      // Getters
      getUserRole: () => {
        const { user } = get()
        return user?.roles?.[0]?.rol || null
      },

      getUserClinica: () => {
        const { user } = get()
        return user?.roles?.[0]?.clinica || null
      },

      isAdmin: () => {
        const { user } = get()
        // El superusuario siempre es admin, o si tiene el rol de Administrador
        return user?.is_superuser || user?.is_staff || user?.roles?.[0]?.rol === 'Administrador'
      },

      isDoctor: () => {
        const { user } = get()
        return user?.roles?.some(role => role.rol === 'Doctor') || false
      },

      isPaciente: () => {
        const { user } = get()
        return user?.roles?.some(role => role.rol === 'Paciente') || false
      },

      isRecepcionista: () => {
        const { user } = get()
        return user?.roles?.some(role => role.rol === 'Recepcionista') || false
      },
    }),
    {
      name: 'auth-storage',
      // Solo persistir datos básicos, no funciones
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)