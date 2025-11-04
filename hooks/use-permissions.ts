/**
 * 🔒 Hook para verificar permisos del usuario
 */
import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const user = useAuthStore(state => state.user);
  const isAdmin = useAuthStore(state => state.isAdmin);
  const isDoctor = useAuthStore(state => state.isDoctor);
  const isPaciente = useAuthStore(state => state.isPaciente);

  return {
    // Verificar si es admin
    canViewAllUsers: () => isAdmin(),
    
    // Verificar si es doctor (puede ver pacientes)
    canViewPacientes: () => isAdmin() || isDoctor(),
    
    // Verificar si puede crear usuarios (solo admin)
    canCreateUsers: () => isAdmin(),
    
    // Verificar si puede editar usuarios (solo admin)
    canEditUsers: () => isAdmin(),
    
    // Verificar si puede eliminar usuarios (solo admin)
    canDeleteUsers: () => isAdmin(),
    
    // Verificar si puede ver doctores (solo admin)
    canViewDoctores: () => isAdmin(),
    
    // Verificar si puede ver administradores (solo admin)
    canViewAdministradores: () => isAdmin(),
    
    // Verificar si puede ver sus propios datos
    canViewOwnProfile: () => true,
    
    // Verificar si puede editar sus propios datos
    canEditOwnProfile: () => true,
    
    // Obtener rol del usuario
    getUserRole: () => {
      if (user?.is_superuser) return 'Superusuario';
      return user?.rol || user?.roles?.[0] || 'Usuario';
    },
    
    // Verificar si es admin
    isAdmin: () => isAdmin(),
    
    // Verificar si es doctor
    isDoctor: () => isDoctor(),
    
    // Verificar si es paciente
    isPaciente: () => isPaciente(),
    
    // Permisos para horarios
    canViewAllSchedules: () => isAdmin(),
    canManageSchedules: () => isAdmin() || isDoctor(),
    canViewOwnSchedules: () => isDoctor(),
  };
}
