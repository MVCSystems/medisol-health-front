"use client"

import { Card, CardContent } from "@/components/ui/card"
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
  is_staff: boolean
  is_superuser: boolean
  roles: string[] // Array simple de nombres de grupos de Django
  rol?: string // Rol principal
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
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
      case 'Doctor':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
      case 'Paciente':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
      case 'Recepcionista':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80'
    }
  }

  const getUserInitials = () => {
    return `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-6">
          {/* Avatar y Info Principal */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all shadow-sm">
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-2">
              {/* Nombre y Estado */}
              <div className="flex items-center gap-2.5">
                <h3 className="font-semibold text-base truncate text-foreground">
                  {usuario.first_name} {usuario.last_name}
                </h3>
                <Badge 
                  variant={usuario.is_active ? "default" : "secondary"}
                  className="h-5 text-[11px] px-2 font-medium"
                >
                  {usuario.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              
              {/* DNI y Roles */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">DNI:</span> {usuario.dni}
                </span>
                
                {usuario.roles && usuario.roles.length > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex flex-wrap gap-1.5">
                      {usuario.roles.slice(0, 2).map((rolNombre, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`h-5 text-[11px] px-2 font-medium ${getRoleBadgeColor(rolNombre)}`}
                        >
                          {rolNombre}
                        </Badge>
                      ))}
                      {usuario.roles.length > 2 && (
                        <Badge variant="outline" className="h-5 text-[11px] px-2 font-medium">
                          +{usuario.roles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 shrink-0 hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
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
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
