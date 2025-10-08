"use client"

import {
  User,
  Settings,
  ChevronsUpDown,
  LogOut,
  Building2,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout, isAdmin, isDoctor, isPaciente, getUserClinica } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getRoleLabel = () => {
    try {
      if (isAdmin()) return "Administrador"
      if (isDoctor()) return "Doctor"
      if (isPaciente()) return "Paciente"
      return "Usuario"
    } catch {
      return "Usuario"
    }
  }

  const getRoleBadgeColor = () => {
    try {
      if (isAdmin()) return "bg-red-100 text-red-800"
      if (isDoctor()) return "bg-blue-100 text-blue-800"
      if (isPaciente()) return "bg-green-100 text-green-800"
      return "bg-gray-100 text-gray-800"
    } catch {
      return "bg-gray-100 text-gray-800"
    }
  }

  const getUserInitials = () => {
    try {
      const firstName = user?.first_name || ""
      const lastName = user?.last_name || ""
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      }
      return user?.dni?.slice(0, 2)?.toUpperCase() || "US"
    } catch {
      return "US"
    }
  }

  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.dni || "Usuario"
  
  let clinica = null
  try {
    clinica = getUserClinica()
  } catch {
    // Ignorar errores de getUserClinica
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor()}`}>
                      {getRoleLabel()}
                    </Badge>
                  </div>
                  {clinica && (
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate text-xs text-muted-foreground">{clinica}</span>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
