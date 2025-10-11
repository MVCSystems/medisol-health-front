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
  Activity,
  Stethoscope,
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
        title: "Administración",
        url: "/dashboard/clinicas",
        icon: Building2,
        items: [
          { title: "Clínicas", url: "/dashboard/clinicas" },
          { title: "Especialidades", url: "/dashboard/especialidades" },
        ],
      },
      {
        title: "Personal Médico",
        url: "/dashboard/doctores",
        icon: Stethoscope,
        items: [
          { title: "Gestión de Doctores", url: "/dashboard/doctores" },
          { title: "Gestión de Pacientes", url: "/dashboard/pacientes" },
          { title: "Horarios Médicos", url: "/dashboard/horarios" },
        ],
      },
      {
        title: "Sistema de Usuarios",
        url: "/dashboard/usuarios",
        icon: Users,
        items: [
          { title: "Todos los Usuarios", url: "/dashboard/usuarios" },
          { title: "Administradores", url: "/dashboard/usuarios?role=ADMIN" },
          { title: "Personal Médico", url: "/dashboard/usuarios?role=DOCTOR" },
          { title: "Pacientes del Sistema", url: "/dashboard/usuarios?role=PACIENTE" },
        ],
      },
      {
        title: "Citas Médicas",
        url: "/dashboard/citas",
        icon: Calendar,
        items: [
          { title: "Reservar Cita", url: "/dashboard/citas/reservar" },
          { title: "Gestión de Citas", url: "/dashboard/citas" },
        ],
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
        items: [
          { title: "Asistente IA", url: "/chat" },
          { title: "Comunicación", url: "/chat/general" },
        ],
      }
    )
  }

  // Opciones para DOCTOR
  if (isDoctor) {
    navMain.push(
      {
        title: "Mi Consultorio",
        url: "/dashboard/horarios",
        icon: Calendar,
        items: [
          { title: "Mis Horarios", url: "/dashboard/horarios" },
          { title: "Reservar Citas", url: "/dashboard/citas/reservar" },
        ],
      },
      {
        title: "Mis Pacientes",
        url: "/dashboard/pacientes",
        icon: UserCheck,
        items: [
          { title: "Lista de Pacientes", url: "/dashboard/pacientes" },
        ],
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
        items: [
          { title: "Asistente IA", url: "/chat" },
        ],
      }
    )
  }

  // Opciones para PACIENTE
  if (isPaciente) {
    navMain.push(
      {
        title: "Reservar Cita Médica",
        url: "/dashboard/citas/reservar",
        icon: Calendar,
        items: [
          { title: "Agendar Nueva Cita", url: "/dashboard/citas/reservar" },
          { title: "Ver Doctores", url: "/dashboard/doctores" },
        ],
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
        items: [
          { title: "Consulta Virtual", url: "/chat" },
        ],
      }
    )
  }



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
          { name: "Gestión Doctores", url: "/dashboard/doctores", icon: Stethoscope },
          { name: "Gestión Pacientes", url: "/dashboard/pacientes", icon: UserCheck },
          { name: "Gestión Clínicas", url: "/dashboard/clinicas", icon: Building2 },
          { name: "Reservar Citas", url: "/dashboard/citas/reservar", icon: Calendar },
        ]
      : isDoctor
      ? [
          { name: "Mis Horarios", url: "/dashboard/horarios", icon: Clock },
          { name: "Mis Pacientes", url: "/dashboard/pacientes", icon: UserCheck },
          { name: "Reservar Citas", url: "/dashboard/citas/reservar", icon: Calendar },
          { name: "Chat Médico", url: "/chat", icon: MessageSquare },
        ]
      : [
          { name: "Reservar Cita", url: "/dashboard/citas/reservar", icon: Calendar },
          { name: "Ver Doctores", url: "/dashboard/doctores", icon: Stethoscope },
          { name: "Chat Médico", url: "/chat", icon: MessageSquare },
          { name: "Dashboard", url: "/dashboard", icon: Activity },
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
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Heart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MediSol</span>
                  <span className="truncate text-xs text-muted-foreground">Sistema Médico</span>
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
