"use client"

import * as React from "react"
import {
  Building2,
  Calendar,
  Users,
  UserCheck,
  Settings2,
  Heart,
  Clock,
  FileText,
  Activity,
  Stethoscope,
  Clipboard,
  MessageSquare,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Datos de navegación médica basados en roles
const getNavData = (isAdmin: boolean, isDoctor: boolean, isPaciente: boolean) => {
  const navMain = []
  
  // Dashboard principal - todos los roles
  navMain.push({
    title: "Dashboard",
    url: "/dashboard",
    icon: Activity,
    isActive: true,
  })

  // Opciones para ADMIN
  if (isAdmin) {
    navMain.push(
      {
        title: "Clínicas",
        url: "/dashboard/clinicas",
        icon: Building2,
        items: [
          { title: "Ver Clínicas", url: "/dashboard/clinicas" },
          { title: "Especialidades", url: "/dashboard/especialidades" },
        ],
      },
      {
        title: "Gestión de Usuarios",
        url: "/dashboard/usuarios",
        icon: Users,
        items: [
          { title: "Todos los Usuarios", url: "/dashboard/usuarios" },
          { title: "Solo Doctores", url: "/dashboard/usuarios?role=DOCTOR" },
          { title: "Solo Pacientes", url: "/dashboard/usuarios?role=PACIENTE" },
          { title: "Solo Administradores", url: "/dashboard/usuarios?role=ADMIN" },
        ],
      },
      {
        title: "Reportes",
        url: "/dashboard/admin/reportes",
        icon: FileText,
        items: [
          { title: "Estadísticas", url: "/dashboard/admin/reportes/estadisticas" },
          { title: "Ingresos", url: "/dashboard/admin/reportes/ingresos" },
          { title: "Citas", url: "/dashboard/admin/reportes/citas" },
        ],
      }
    )
  }

  // Opciones para DOCTOR
  if (isDoctor) {
    navMain.push(
      {
        title: "Mis Pacientes",
        url: "/doctor/pacientes",
        icon: UserCheck,
        items: [
          { title: "Lista de Pacientes", url: "/doctor/pacientes" },
          { title: "Historial Médico", url: "/doctor/historiales" },
        ],
      },
      {
        title: "Mi Agenda",
        url: "/doctor/agenda",
        icon: Calendar,
        items: [
          { title: "Citas de Hoy", url: "/doctor/citas/hoy" },
          { title: "Próximas Citas", url: "/doctor/citas/proximas" },
          { title: "Horarios", url: "/doctor/horarios" },
        ],
      },
      {
        title: "Consultas",
        url: "/doctor/consultas",
        icon: Stethoscope,
        items: [
          { title: "En Curso", url: "/doctor/consultas/activas" },
          { title: "Completadas", url: "/doctor/consultas/completadas" },
          { title: "Recetas", url: "/doctor/recetas" },
        ],
      }
    )
  }

  // Opciones para PACIENTE
  if (isPaciente) {
    navMain.push(
      {
        title: "Mis Citas",
        url: "/paciente/citas",
        icon: Calendar,
        items: [
          { title: "Próximas Citas", url: "/paciente/citas/proximas" },
          { title: "Historial", url: "/paciente/citas/historial" },
          { title: "Agendar Cita", url: "/paciente/citas/nueva" },
        ],
      },
      {
        title: "Mi Salud",
        url: "/paciente/salud",
        icon: Heart,
        items: [
          { title: "Historial Médico", url: "/paciente/historial" },
          { title: "Recetas", url: "/paciente/recetas" },
          { title: "Resultados", url: "/paciente/resultados" },
        ],
      }
    )
  }

  // Chat médico - todos los roles
  navMain.push({
    title: "Chat Médico",
    url: "/chat",
    icon: MessageSquare,
  })

  return {
    navMain,
    navSecondary: [
      {
        title: "Configuración",
        url: "/configuracion",
        icon: Settings2,
      },
    ],
    quickActions: isAdmin 
      ? [
          { name: "Nueva Clínica", url: "/dashboard/admin/clinicas/nueva", icon: Building2 },
          { name: "Nuevo Doctor", url: "/dashboard/admin/doctores/nuevo", icon: UserCheck },
        ]
      : isDoctor
      ? [
          { name: "Nueva Consulta", url: "/doctor/consultas/nueva", icon: Clipboard },
          { name: "Ver Agenda", url: "/doctor/agenda", icon: Clock },
        ]
      : [
          { name: "Agendar Cita", url: "/paciente/citas/nueva", icon: Calendar },
          { name: "Mi Historial", url: "/paciente/historial", icon: FileText },
        ]
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAdmin, isDoctor, isPaciente, isAuthenticated } = useAuthStore()
  
  // Obtener datos de navegación basados en rol
  const navData = React.useMemo(() => {
    try {
      if (!isAuthenticated) {
        return getNavData(false, false, false)
      }
      return getNavData(isAdmin(), isDoctor(), isPaciente())
    } catch {
      // En caso de error, devolver navegación básica
      return getNavData(false, false, false)
    }
  }, [isAdmin, isDoctor, isPaciente, isAuthenticated])

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Heart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">MediSol</span>
                  <span className="truncate text-xs">Sistema Médico</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavProjects projects={navData.quickActions} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
