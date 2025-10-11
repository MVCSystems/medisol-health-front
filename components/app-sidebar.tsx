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
          { title: "Todas las Citas", url: "/dashboard/citas" },
          { title: "Citas de Hoy", url: "/dashboard/citas?fecha=hoy" },
          { title: "Programar Cita", url: "/dashboard/citas/nueva" },
        ],
      },
      {
        title: "Reportes y Análisis",
        url: "/dashboard/reportes",
        icon: FileText,
        items: [
          { title: "Dashboard Estadísticas", url: "/dashboard/reportes/estadisticas" },
          { title: "Reporte de Ingresos", url: "/dashboard/reportes/ingresos" },
          { title: "Análisis de Citas", url: "/dashboard/reportes/citas" },
          { title: "Rendimiento Médico", url: "/dashboard/reportes/doctores" },
        ],
      }
    )
  }

  // Opciones para DOCTOR
  if (isDoctor) {
    navMain.push(
      {
        title: "Mi Consultorio",
        url: "/doctor/agenda",
        icon: Calendar,
        items: [
          { title: "Agenda del Día", url: "/doctor/citas/hoy" },
          { title: "Próximas Citas", url: "/doctor/citas/proximas" },
          { title: "Configurar Horarios", url: "/doctor/horarios" },
        ],
      },
      {
        title: "Mis Pacientes",
        url: "/doctor/pacientes",
        icon: UserCheck,
        items: [
          { title: "Lista de Pacientes", url: "/doctor/pacientes" },
          { title: "Historiales Médicos", url: "/doctor/historiales" },
          { title: "Buscar Paciente", url: "/doctor/pacientes/buscar" },
        ],
      },
      {
        title: "Consultas Médicas",
        url: "/doctor/consultas",
        icon: Stethoscope,
        items: [
          { title: "Consultas Activas", url: "/doctor/consultas/activas" },
          { title: "Historial de Consultas", url: "/doctor/consultas/completadas" },
          { title: "Recetas Emitidas", url: "/doctor/recetas" },
          { title: "Diagnósticos", url: "/doctor/diagnosticos" },
        ],
      }
    )
  }

  // Opciones para PACIENTE
  if (isPaciente) {
    navMain.push(
      {
        title: "Mis Citas Médicas",
        url: "/paciente/citas",
        icon: Calendar,
        items: [
          { title: "Agendar Nueva Cita", url: "/paciente/citas/nueva" },
          { title: "Próximas Citas", url: "/paciente/citas/proximas" },
          { title: "Historial de Citas", url: "/paciente/citas/historial" },
          { title: "Cancelar Cita", url: "/paciente/citas/cancelar" },
        ],
      },
      {
        title: "Mi Expediente Médico",
        url: "/paciente/salud",
        icon: Heart,
        items: [
          { title: "Resumen de Salud", url: "/paciente/historial/resumen" },
          { title: "Historial Clínico", url: "/paciente/historial" },
          { title: "Mis Recetas", url: "/paciente/recetas" },
          { title: "Resultados de Exámenes", url: "/paciente/resultados" },
        ],
      },
      {
        title: "Mi Información",
        url: "/paciente/perfil",
        icon: UserCheck,
        items: [
          { title: "Datos Personales", url: "/paciente/perfil" },
          { title: "Contacto de Emergencia", url: "/paciente/contactos" },
          { title: "Seguros Médicos", url: "/paciente/seguros" },
        ],
      }
    )
  }

  // Chat médico - todos los roles con opciones específicas
  if (isAdmin) {
    navMain.push({
      title: "Centro de Comunicación",
      url: "/chat",
      icon: MessageSquare,
      items: [
        { title: "Chat General", url: "/chat" },
        { title: "Soporte Técnico", url: "/chat/soporte" },
        { title: "Comunicados", url: "/chat/comunicados" },
      ],
    })
  } else if (isDoctor) {
    navMain.push({
      title: "Comunicación Médica",
      url: "/chat",
      icon: MessageSquare,
      items: [
        { title: "Chat con Pacientes", url: "/chat/pacientes" },
        { title: "Consultas IA", url: "/chat" },
        { title: "Colegas", url: "/chat/doctores" },
      ],
    })
  } else if (isPaciente) {
    navMain.push({
      title: "Asistencia Médica",
      url: "/chat",
      icon: MessageSquare,
      items: [
        { title: "Consulta Virtual", url: "/chat" },
        { title: "Chat con mi Doctor", url: "/chat/doctor" },
        { title: "Soporte", url: "/chat/soporte" },
      ],
    })
  } else {
    // Usuario no autenticado o sin rol específico
    navMain.push({
      title: "Asistente Médico IA",
      url: "/chat",
      icon: MessageSquare,
    })
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
          { name: "Registrar Doctor", url: "/dashboard/doctores", icon: Stethoscope },
          { name: "Registrar Paciente", url: "/dashboard/pacientes", icon: UserCheck },
          { name: "Nueva Clínica", url: "/dashboard/clinicas", icon: Building2 },
          { name: "Ver Reportes", url: "/dashboard/reportes", icon: FileText },
        ]
      : isDoctor
      ? [
          { name: "Mi Agenda Hoy", url: "/doctor/citas/hoy", icon: Calendar },
          { name: "Mis Pacientes", url: "/doctor/pacientes", icon: UserCheck },
          { name: "Nueva Consulta", url: "/doctor/consultas/nueva", icon: Clipboard },
          { name: "Ver Horarios", url: "/doctor/horarios", icon: Clock },
        ]
      : [
          { name: "Agendar Cita", url: "/paciente/citas/nueva", icon: Calendar },
          { name: "Mi Historial", url: "/paciente/historial", icon: Heart },
          { name: "Mis Recetas", url: "/paciente/recetas", icon: FileText },
          { name: "Mi Perfil", url: "/paciente/perfil", icon: UserCheck },
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
