"use client"

import * as React from "react"
import {
  Building2,
  Calendar,
  Users,
  UserCheck,
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

  // Citas Médicas - Disponible para todos los roles
  navMain.push({
    title: "Citas Médicas",
    url: "/dashboard/citas",
    icon: Calendar,
    items: [
      { title: isAdmin ? "Lista de Citas" : "Mis Citas", url: "/dashboard/citas" },
      { title: "Reservar Cita", url: "/dashboard/citas/reservar" },
    ],
  });

  // 🔒 Opciones para ADMIN SOLAMENTE
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
          { title: "Administradores", url: "/dashboard/usuarios?role=Administrador" },
          { title: "Personal Médico", url: "/dashboard/usuarios?role=Doctor" },
          { title: "Pacientes del Sistema", url: "/dashboard/usuarios?role=Paciente" },
        ],
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
      }
    )
  }
  
  // 🔒 Opciones para DOCTOR SOLAMENTE
  if (isDoctor && !isAdmin) {
    navMain.push(
      {
        title: "Mis Pacientes",
        url: "/dashboard/usuarios?role=Paciente",
        icon: Users,
        items: [
          { title: "Ver Pacientes", url: "/dashboard/usuarios?role=Paciente" },
        ],
      }
    )
  }

  // 🔒 Opciones adicionales para DOCTOR
  if (isDoctor && !isAdmin) {
    navMain.push(
      {
        title: "Mi Agenda",
        url: "/dashboard/horarios",
        icon: Clock,
        items: [
          { title: "Mis Horarios", url: "/dashboard/horarios" },
        ],
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
      }
    )
  }

  // Opciones para PACIENTE
  if (isPaciente) {
    navMain.push(
      {
        title: "Directorio Médico",
        url: "/dashboard/doctores",
        icon: Stethoscope,
      },
      {
        title: "Chat Médico",
        url: "/chat",
        icon: MessageSquare,
      }
    )
  }



  return {
    navMain,
    navSecondary: [],
    quickActions: isAdmin 
      ? [
          { name: "Gestión Doctores", url: "/dashboard/doctores", icon: Stethoscope },
          { name: "Gestión Pacientes", url: "/dashboard/pacientes", icon: UserCheck },
          { name: "Gestión Clínicas", url: "/dashboard/clinicas", icon: Building2 },
          { name: "Lista de Citas", url: "/dashboard/citas", icon: Calendar },
        ]
      : isDoctor
      ? [
          { name: "Mis Citas", url: "/dashboard/citas", icon: Calendar },
          { name: "Mis Horarios", url: "/dashboard/horarios", icon: Clock },
          { name: "Chat Médico", url: "/chat", icon: MessageSquare },
        ]
      : isPaciente
      ? [
          { name: "Mis Citas", url: "/dashboard/citas", icon: Calendar },
          { name: "Reservar Cita", url: "/dashboard/citas/reservar", icon: Calendar },
          { name: "Directorio Médico", url: "/dashboard/doctores", icon: Stethoscope },
          { name: "Chat Médico", url: "/chat", icon: MessageSquare },
        ]
      : []
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
      className="top-[--header-height] h-[calc(100svh-var(--header-height))] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800"
      {...props}
    >
      <SidebarHeader className="px-3 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center gap-2.5 group hover:bg-transparent">
                <div className="bg-primary text-primary-foreground flex aspect-square size-9 items-center justify-center rounded-lg shadow-sm">
                  <Heart className="size-4.5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="truncate font-semibold text-[15px] text-foreground">MediSol</span>
                  <span className="truncate text-[11px] text-muted-foreground mt-0.5">Sistema Médico</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <NavMain items={navData.navMain} />
        <div className="mt-3">
          <NavProjects projects={navData.quickActions} />
        </div>
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
