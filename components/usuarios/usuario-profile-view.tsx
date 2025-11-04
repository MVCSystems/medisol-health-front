"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar, MapPin, CreditCard } from "lucide-react"

interface Usuario {
  id: number
  dni: string
  first_name: string
  last_name: string
  email: string
  telefono?: string
  direccion?: string
  is_active: boolean
  roles: string[]
  date_joined: string
}

interface UsuarioProfileViewProps {
  open: boolean
  onClose: () => void
  usuario: Usuario | null
}

export default function UsuarioProfileView({ open, onClose, usuario }: UsuarioProfileViewProps) {
  if (!usuario) return null

  const getUserInitials = () => {
    return `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Perfil de usuario</DialogTitle>
        <DialogDescription className="sr-only">Información detallada del usuario en el sistema Medisol.</DialogDescription>
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-background pt-6 pb-10 px-4 border-b border-primary/10">
          {/* Avatar central */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20 shadow bg-white dark:bg-background">
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-primary tracking-tight">
                {usuario.first_name} {usuario.last_name}
              </h2>
              <div className="flex items-center justify-center gap-1 flex-wrap mt-0.5">
                <Badge 
                  variant={usuario.is_active ? "default" : "secondary"}
                  className="shadow-sm px-2 py-0.5 text-xs font-semibold border border-primary/20 bg-primary/10 text-primary"
                >
                  {usuario.is_active ? "✓ Activo" : "○ Inactivo"}
                </Badge>
                {usuario.roles && usuario.roles.map((role, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className={`shadow-sm px-2 py-0.5 text-xs font-semibold border-primary/20 ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
  <div className="px-4 py-4 space-y-5 bg-background">
          {/* Información de Contacto */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="font-semibold text-xs text-primary uppercase tracking-wide">
                Información de Contacto
              </h3>
            </div>

            <div className="grid gap-2">
              {/* Email */}
              <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors border border-primary/10">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-0.5">
                    Correo Electrónico
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {usuario.email}
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/5 transition-colors border border-green-500/10">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-0.5">
                    Teléfono
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {usuario.telefono || "No registrado"}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-orange-500/5 transition-colors border border-orange-500/10">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-0.5">
                    Dirección
                  </p>
                  <p className="text-sm text-foreground">
                    {usuario.direccion || "No registrada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-primary/10 my-2" />

          {/* Información del Sistema */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-primary/40" />
              <h3 className="font-semibold text-xs text-primary uppercase tracking-wide">
                Información del Sistema
              </h3>
            </div>

            <div className="grid gap-2">
              <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/5 transition-colors border border-purple-500/10">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-0.5">
                    Fecha de Registro
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(usuario.date_joined)}
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors border border-primary/10">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-0.5">
                    ID del Sistema
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    #{usuario.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
