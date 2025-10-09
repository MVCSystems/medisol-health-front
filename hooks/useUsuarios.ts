import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { usuarioService } from '@/services/usuario.service';
import type { Usuario, CreateUsuarioData, UpdateUsuarioData, PaginatedResponse } from '@/types/usuario';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
      error?: string;
      non_field_errors?: string[];
      [key: string]: unknown;
    };
    status?: number;
  };
  message?: string;
}

const USUARIOS_KEY = '/api/usuarios/usuarios/';

export function useUsuarios() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Obtener usuarios con SWR
  const { 
    data: response, 
    error, 
    isLoading,
    mutate: mutateUsuarios 
  } = useSWR<PaginatedResponse<Usuario>>(
    USUARIOS_KEY,
    () => usuarioService.getAll(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const usuarios = response?.results || [];

  // Crear usuario
  const createUsuario = useCallback(async (data: CreateUsuarioData): Promise<Usuario | null> => {
    try {
      setIsCreating(true);
      const newUsuario = await usuarioService.create(data);
      
      // Actualizar cache local
      await mutateUsuarios();
      
      toast.success('Usuario creado exitosamente');
      return newUsuario;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      // Si es error 500, verificar si el usuario se creó de todas formas
      if (apiError?.response?.status === 500) {
        // Actualizar cache para verificar si el usuario se creó
        await mutateUsuarios();
        
        // Buscar si el usuario existe ahora (por DNI o email)
        const updatedResponse = await usuarioService.getAll();
        const usuarioCreado = updatedResponse.results.find(u => 
          u.dni === data.dni || u.email === data.email
        );
        
        if (usuarioCreado) {
          toast.success('Usuario creado exitosamente');
          return usuarioCreado;
        } else {
          toast.error('Error interno del servidor. El usuario no se pudo crear.');
        }
      } else {
        // Otros errores
        let message = 'Error al crear usuario';
        if (apiError?.response?.data) {
          const errorData = apiError.response.data;
          message = errorData.detail || errorData.message || message;
        }
        toast.error(message);
      }
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [mutateUsuarios]);

  // Actualizar usuario
  const updateUsuario = useCallback(async (id: number, data: UpdateUsuarioData): Promise<Usuario | null> => {
    try {
      setIsUpdating(true);
      const updatedUsuario = await usuarioService.update(id, data);
      
      // Actualizar cache local
      await mutateUsuarios();
      
      toast.success('Usuario actualizado exitosamente');
      return updatedUsuario;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError?.response?.data?.detail || 'Error al actualizar usuario';
      toast.error(message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [mutateUsuarios]);

  // Eliminar usuario
  const deleteUsuario = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await usuarioService.delete(id);
      
      // Actualizar cache local
      await mutateUsuarios();
      
      toast.success('Usuario eliminado exitosamente');
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError?.response?.data?.detail || 'Error al eliminar usuario';
      toast.error(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [mutateUsuarios]);

  // Cambiar estado de usuario
  const toggleUsuarioStatus = useCallback(async (id: number, isActive: boolean): Promise<boolean> => {
    try {
      await usuarioService.toggleStatus(id, isActive);
      
      // Actualizar cache local
      await mutateUsuarios();
      
      const action = isActive ? 'activado' : 'desactivado';
      toast.success(`Usuario ${action} exitosamente`);
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError?.response?.data?.detail || 'Error al cambiar estado del usuario';
      toast.error(message);
      return false;
    }
  }, [mutateUsuarios]);

  return {
    // Data
    usuarios,
    totalCount: response?.count || 0,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error
    error,
    
    // Actions
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
    refreshUsuarios: mutateUsuarios,
  };
}