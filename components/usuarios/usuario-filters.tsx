"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface UsuarioFiltersProps {
  search: string
  setSearch: (value: string) => void
  roleFilter: string
  setRoleFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  onClearFilters: () => void
  totalResults?: number
}

export default function UsuarioFilters({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onClearFilters,
  totalResults
}: UsuarioFiltersProps) {
  const hasActiveFilters = search || roleFilter !== "ALL" || statusFilter !== "ALL"

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre, DNI o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los roles</SelectItem>
            <SelectItem value="Administrador">Administradores</SelectItem>
            <SelectItem value="Doctor">Doctores</SelectItem>
            <SelectItem value="Paciente">Pacientes</SelectItem>
            <SelectItem value="Recepcionista">Recepcionistas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="INACTIVE">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            Limpiar filtros
          </Button>
        )}

        {totalResults !== undefined && (
          <Badge variant="secondary" className="ml-auto">
            {totalResults} resultados
          </Badge>
        )}
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="outline">
              Búsqueda: &quot;{search}&quot;
            </Badge>
          )}
          {roleFilter !== "ALL" && (
            <Badge variant="outline">
              Rol: {roleFilter}
            </Badge>
          )}
          {statusFilter !== "ALL" && (
            <Badge variant="outline">
              Estado: {statusFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}