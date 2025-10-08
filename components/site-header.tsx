"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

// Función para generar breadcrumbs basados en la ruta
const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  
  // Breadcrumbs específicos según la ruta
  const routes: Record<string, { title: string; parent?: string }> = {
    'dashboard': { title: 'Dashboard' },
    'admin': { title: 'Administración' },
    'doctor': { title: 'Panel Doctor' },
    'paciente': { title: 'Mi Portal' },
    'chat': { title: 'Chat Médico' },
    'configuracion': { title: 'Configuración' },
    
    // Admin routes
    'clinicas': { title: 'Clínicas', parent: 'admin' },
    'usuarios': { title: 'Usuarios', parent: 'admin' },
    'doctores': { title: 'Doctores', parent: 'admin' },
    'pacientes': { title: 'Pacientes', parent: 'admin' },
    'reportes': { title: 'Reportes', parent: 'admin' },
    'especialidades': { title: 'Especialidades', parent: 'admin' },
    
    // Doctor routes
    'agenda': { title: 'Mi Agenda', parent: 'doctor' },
    'consultas': { title: 'Consultas', parent: 'doctor' },
    'historiales': { title: 'Historiales', parent: 'doctor' },
    
    // Patient routes
    'citas': { title: 'Mis Citas', parent: 'paciente' },
    'salud': { title: 'Mi Salud', parent: 'paciente' },
    'historial': { title: 'Historial Médico', parent: 'paciente' },
    'recetas': { title: 'Recetas', parent: 'paciente' },
    
    // Actions
    'nueva': { title: 'Nuevo' },
    'nuevo': { title: 'Nuevo' },
    'hoy': { title: 'Hoy' },
    'proximas': { title: 'Próximas' },
    'completadas': { title: 'Completadas' },
    'activas': { title: 'Activas' },
    'estadisticas': { title: 'Estadísticas' },
    'ingresos': { title: 'Ingresos' },
  }

  const breadcrumbs = []
  
  // Si estamos en dashboard root, solo mostrar MediSol
  if (pathname === '/dashboard') {
    breadcrumbs.push({ title: 'MediSol', href: '/dashboard', isPage: true })
    return breadcrumbs
  }
  
  // Para otras rutas, agregar Home/Dashboard como enlace
  breadcrumbs.push({ title: 'MediSol', href: '/dashboard', isPage: false })
  
  // Procesar segmentos
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    const route = routes[segment]
    
    if (route) {
      const isLast = i === segments.length - 1
      breadcrumbs.push({
        title: route.title,
        href: currentPath,
        isPage: isLast
      })
    }
  }
  
  return breadcrumbs
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={`breadcrumb-${index}-${crumb.href}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isPage ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
