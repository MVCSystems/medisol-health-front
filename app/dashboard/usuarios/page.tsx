"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/use-permissions";
import { useUsuarios } from "@/hooks/useUsuarios";
import { usePacientes } from "@/hooks/usePacientes";
import UsuarioCard from "@/components/usuarios/usuario-card";
import UsuarioFilters from "@/components/usuarios/usuario-filters";
import UsuarioForm from "@/components/usuarios/usuario-form";
import UsuarioProfileView from "@/components/usuarios/usuario-profile-view";
import DeleteConfirmDialog from "@/components/usuarios/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import type { Usuario, CreateUsuarioData, UpdateUsuarioData } from "@/types/usuario";
import type { Paciente } from "@/types/clinicas";

export default function UsuariosPage() {
  const { isAdmin, isDoctor } = useAuthStore();
  const permissions = usePermissions();
  const searchParams = useSearchParams();
  
  // Estados para filtros
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Estados para modales
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Hook personalizado para gestión de usuarios (admin)
  const usuariosData = useUsuarios();
  
  // Hook personalizado para gestión de pacientes (doctor)
  const pacientesData = usePacientes();
  
  // Usar datos según el rol
  const usuarios = isDoctor() ? pacientesData.pacientes.map((p: Paciente) => ({
    id: p.id,
    dni: p.numero_documento || p.usuario_data?.dni,
    first_name: p.nombres || p.usuario_data?.first_name || '',
    last_name: p.apellidos || p.usuario_data?.last_name || '',
    email: p.usuario_data?.email || '',
    is_active: p.activo,
    roles: ['Paciente'],
    rol: 'Paciente'
  } as Usuario)) : usuariosData.usuarios;
  
  const totalCount = isDoctor() ? pacientesData.pacientes.length : usuariosData.totalCount;
  const isLoading = isDoctor() ? pacientesData.loading : usuariosData.isLoading;
  const isCreating = usuariosData.isCreating;
  const isUpdating = usuariosData.isUpdating;
  const isDeleting = usuariosData.isDeleting;
  const createUsuario = usuariosData.createUsuario;
  const updateUsuario = usuariosData.updateUsuario;
  const deleteUsuario = usuariosData.deleteUsuario;
  const toggleUsuarioStatus = usuariosData.toggleUsuarioStatus;
  const error = isDoctor() ? pacientesData.error : usuariosData.error;

  // Aplicar filtro desde URL al cargar
  useEffect(() => {
    const roleFromUrl = searchParams.get("role");
    if (roleFromUrl) {
      const roleMapping: { [key: string]: string } = {
        "ADMIN": "Administrador",
        "DOCTOR": "Doctor", 
        "PACIENTE": "Paciente",
        "RECEPCIONISTA": "Recepcionista"
      };
      
      const mappedRole = roleMapping[roleFromUrl] || "ALL";
      setRoleFilter(mappedRole);
    }
  }, [searchParams]);

  // Handlers para modales
  const handleCreateClick = () => {
    setSelectedUsuario(null);
    setShowCreateForm(true);
  };

  const handleViewClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowProfileView(true);
  };

  const handleEditClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowEditForm(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowDeleteDialog(true);
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    await toggleUsuarioStatus(usuario.id, !usuario.is_active);
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleDeleteConfirm = async () => {
    if (selectedUsuario) {
      const success = await deleteUsuario(selectedUsuario.id);
      if (success) {
        setShowDeleteDialog(false);
        setSelectedUsuario(null);
      }
    }
  };

  const handleCreateSubmit = async (data: CreateUsuarioData | UpdateUsuarioData) => {
    const result = await createUsuario(data as CreateUsuarioData);
    // SIEMPRE cerrar el formulario después del intento (éxito o error)
    setShowCreateForm(false);
    return result;
  };

  const handleEditSubmit = async (data: CreateUsuarioData | UpdateUsuarioData) => {
    if (selectedUsuario) {
      const result = await updateUsuario(selectedUsuario.id, data as UpdateUsuarioData);
      if (result) {
        setShowEditForm(false);
        setSelectedUsuario(null);
      }
      return result;
    }
    return null;
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter((usuario: Usuario) => {
    const matchesSearch = 
      usuario.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      usuario.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      usuario.dni?.includes(search) ||
      usuario.email?.toLowerCase().includes(search.toLowerCase());

    // 🔄 ACTUALIZADO: roles ahora es un array de strings (Django Groups)
    const matchesRole = roleFilter === "ALL" || 
      usuario.roles?.includes(roleFilter) || 
      usuario.rol === roleFilter;

    const matchesStatus = statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && usuario.is_active) ||
      (statusFilter === "INACTIVE" && !usuario.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <RoleGuard allowedRoles={['admin', 'doctor', 'paciente']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                {isAdmin() ? 'Gestión de Usuarios' : 
                 isDoctor() ? 'Mis Pacientes' : 
                 'Mi Perfil'}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin() ? `Administra usuarios del sistema médico (${totalCount} usuarios)` :
                 isDoctor() ? `Gestiona la información de tus pacientes (${totalCount} pacientes)` :
                 'Visualiza y actualiza tu información personal'}
              </p>
            </div>
          </div>
          {/* Solo admin puede crear usuarios */}
          {permissions.canCreateUsers() && (
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          )}
        </div>

      {/* Filtros */}
      <UsuarioFilters
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={handleClearFilters}
        totalResults={filteredUsuarios.length}
      />

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error al cargar usuarios
            </h3>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar los usuarios del sistema
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
            <p className="text-muted-foreground mb-4">
              {usuarios.length === 0 
                ? "No hay usuarios registrados en el sistema"
                : "No hay usuarios que coincidan con los filtros aplicados"
              }
            </p>
            {usuarios.length === 0 && (
              <Button onClick={handleCreateClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primer Usuario
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsuarios.map((usuario) => (
            <UsuarioCard
              key={usuario.id}
              usuario={usuario}
              onView={handleViewClick} // Todos pueden ver el perfil
              onEdit={permissions.canEditUsers() ? handleEditClick : undefined}
              onDelete={permissions.canDeleteUsers() ? handleDeleteClick : undefined}
              onToggleStatus={permissions.canEditUsers() ? handleToggleStatus : undefined}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <UsuarioProfileView
        open={showProfileView}
        onClose={() => {
          setShowProfileView(false);
          setSelectedUsuario(null);
        }}
        usuario={selectedUsuario}
      />

      <UsuarioForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
        isLoading={isCreating}
      />

      <UsuarioForm
        open={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedUsuario(null);
        }}
        onSubmit={handleEditSubmit}
        usuario={selectedUsuario}
        mode="edit"
        isLoading={isUpdating}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUsuario(null);
        }}
        onConfirm={handleDeleteConfirm}
        usuario={selectedUsuario}
        isLoading={isDeleting}
      />
      </div>
    </RoleGuard>
  );
}