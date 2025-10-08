"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

interface Usuario {
  id: number
  dni: string
  first_name: string
  last_name: string
  email: string
  telefono?: string
  is_active: boolean
  roles: Array<{
    id: number
    rol_nombre: string
    clinica_nombre?: string
  }>
  date_joined: string
}

interface UsuarioCardProps {
  usuario: Usuario
  onEdit?: (usuario: Usuario) => void
  onDelete?: (usuario: Usuario) => void
  onView?: (usuario: Usuario) => void
  onToggleStatus?: (usuario: Usuario) => void
}

export default function UsuarioCard({ usuario, onEdit, onDelete, onView, onToggleStatus }: UsuarioCardProps) {

  const getRoleBadgeColor = (rolNombre: string) => {
    switch (rolNombre) {
      case 'Administrador':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'Doctor':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'Paciente':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Recepcionista':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getUserInitials = () => {
    return `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {usuario.first_name} {usuario.last_name}
              </CardTitle>
              <CardDescription className="text-sm">
                DNI: {usuario.dni}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={usuario.is_active ? "default" : "secondary"}>
              {usuario.is_active ? "Activo" : "Inactivo"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(usuario)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver perfil
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(usuario)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onToggleStatus && (
                  <DropdownMenuItem onClick={() => onToggleStatus(usuario)}>
                    {usuario.is_active ? (
                      <>
                        <span className="h-4 w-4 mr-2 text-orange-500">⏸</span>
                        Desactivar
                      </>
                    ) : (
                      <>
                        <span className="h-4 w-4 mr-2 text-green-500">▶</span>
                        Activar
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(usuario)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {usuario.email}
          </p>
          {usuario.telefono && (
            <p className="text-sm">
              <span className="font-medium">Teléfono:</span> {usuario.telefono}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">Registrado:</span> {formatDate(usuario.date_joined)}
          </p>
        </div>
        
        {usuario.roles && usuario.roles.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Roles:</p>
            <div className="flex flex-wrap gap-1">
              {usuario.roles.map((rol) => (
                <Badge 
                  key={rol.id} 
                  variant="outline" 
                  className={getRoleBadgeColor(rol.rol_nombre)}
                >
                  {rol.rol_nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}