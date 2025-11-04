"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUsuarios } from "@/hooks/useUsuarios";
import UsuarioCard from "@/components/usuarios/usuario-card";
import UsuarioFilters from "@/components/usuarios/usuario-filters";
import UsuarioForm from "@/components/usuarios/usuario-form";
import DeleteConfirmDialog from "@/components/usuarios/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import type { Usuario, CreateUsuarioData, UpdateUsuarioData } from "@/types/usuario";

export default function UsuariosPage() {
  const searchParams = useSearchParams();
  
  // Estados para filtros
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Estados para modales
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Hook personalizado para gestión de usuarios
  const {
    usuarios,
    totalCount,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
    error
  } = useUsuarios();

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
    if (result) {
      setShowCreateForm(false);
    }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra usuarios del sistema médico ({totalCount} usuarios)
            </p>
          </div>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
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
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Modales */}
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
  );
}