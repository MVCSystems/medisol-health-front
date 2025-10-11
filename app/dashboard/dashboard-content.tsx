"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Sidebar components será usado cuando implementemos la navegación lateral
import { api } from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Users, 
    UserPlus, 
    Calendar, 
    Clock, 
    Heart, 
    Building2,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    type LucideIcon
} from "lucide-react"
// Badge component para usar en futuras funcionalidades

// Interfaces para los datos del dashboard
interface DashboardStats {
    clinicas: number
    doctores: number
    pacientes: number
    citas_hoy: number
    citas_pendientes: number
    citas_completadas: number
    especialidades: number
}

interface Cita {
    id: number
    estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA'
    fecha_hora: string
    fecha: string
    // Agregar otros campos según tu modelo
}

interface StatCardProps {
    title: string
    value: string | number
    description: string
    icon: LucideIcon
    variant?: "default" | "success" | "warning" | "destructive"
}

export default function DashboardContent() {
    const router = useRouter()
    const { user, isAdmin, isDoctor, isPaciente } = useAuthStore()
    
    const [stats, setStats] = useState<DashboardStats>({
        clinicas: 0,
        doctores: 0,
        pacientes: 0,
        citas_hoy: 0,
        citas_pendientes: 0,
        citas_completadas: 0,
        especialidades: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cargar estadísticas del dashboard médico
    useEffect(() => {
        const loadDashboardStats = async () => {
            setLoading(true)
            setError(null)
            
            try {
                // Obtener estadísticas según el rol del usuario
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const requests: Promise<any>[] = []
                
                if (isAdmin()) {
                    // Administradores ven todo - URLs correctas según el router
                    requests.push(
                        api.get("/api/clinicas/clinicas/"),
                        api.get("/api/clinicas/doctores/"),
                        api.get("/api/clinicas/pacientes/"),
                        api.get("/api/clinicas/citas/"),
                        api.get("/api/clinicas/especialidades/"),
                        api.get("/api/usuarios/usuarios/") // Para contar usuarios y roles
                    )
                } else if (isDoctor()) {
                    // Doctores ven sus propias estadísticas
                    requests.push(
                        api.get("/api/clinicas/citas/"),
                        api.get("/api/clinicas/pacientes/")
                    )
                } else if (isPaciente()) {
                    // Pacientes ven solo sus citas
                    requests.push(
                        api.get("/api/clinicas/citas/")
                    )
                }

                const responses = await Promise.allSettled(requests)
                
                // Procesar respuestas según el rol
                if (isAdmin()) {
                    const [clinicasRes, doctoresRes, , citasRes, especialidadesRes, usuariosRes] = responses
                    
                    // Función helper para extraer el conteo correcto de las respuestas
                    const getCount = (response: PromiseSettledResult<{ data: { count?: number; length?: number; results?: unknown[] } }>) => {
                        if (response.status !== 'fulfilled') return 0
                        
                        const data = response.value.data
                        
                        // Si es una respuesta paginada con count (más preciso)
                        if (data.count !== undefined) return data.count
                        // Si es un array directo
                        if (Array.isArray(data)) return data.length
                        // Si tiene results array (respuesta paginada)
                        if (data.results && Array.isArray(data.results)) return data.results.length
                        
                        return 0
                    }
                    
                    // Contar usuarios con rol Paciente específicamente
                    let pacientesCount = 0
                    if (usuariosRes.status === 'fulfilled') {
                        const usuarios = usuariosRes.value.data.results || usuariosRes.value.data || []
                        
                        pacientesCount = usuarios.filter((usuario: { roles?: Array<{ rol_nombre: string }> }) => 
                            usuario.roles?.some(rol => rol.rol_nombre === 'Paciente')
                        ).length
                    }
                    
                    // Procesar citas para estadísticas detalladas
                    let citasHoy = 0
                    let citasPendientes = 0
                    let citasCompletadas = 0
                    
                    if (citasRes.status === 'fulfilled') {
                        const citas = citasRes.value.data.results || citasRes.value.data || []
                        const hoy = new Date().toISOString().split('T')[0]
                        
                        citas.forEach((cita: Cita) => {
                            if (cita.fecha === hoy) citasHoy++
                            if (cita.estado === 'PENDIENTE') citasPendientes++
                            if (cita.estado === 'COMPLETADA') citasCompletadas++
                        })
                    }
                    
                    setStats({
                        clinicas: getCount(clinicasRes),
                        doctores: getCount(doctoresRes),
                        pacientes: pacientesCount, // Conteo preciso basado en roles
                        citas_hoy: citasHoy,
                        citas_pendientes: citasPendientes,
                        citas_completadas: citasCompletadas,
                        especialidades: getCount(especialidadesRes)
                    })
                } else {
                    // Para doctores y pacientes, solo mostrar sus propias estadísticas
                    const citasRes = responses[0]
                    if (citasRes.status === 'fulfilled') {
                        const citas = citasRes.value.data.results || citasRes.value.data || []
                        const hoy = new Date().toISOString().split('T')[0]
                        
                        setStats(prev => ({
                            ...prev,
                            citas_pendientes: citas.filter((cita: Cita) => cita.estado === 'PENDIENTE').length,
                            citas_completadas: citas.filter((cita: Cita) => cita.estado === 'COMPLETADA').length,
                            citas_hoy: citas.filter((cita: Cita) => cita.fecha === hoy).length
                        }))
                    }
                }

            } catch (error) {
                console.error('Error cargando estadísticas:', error)
                setError('Error al cargar las estadísticas del dashboard')
            } finally {
                setLoading(false)
            }
        }

        loadDashboardStats()
    }, [isAdmin, isDoctor, isPaciente])

    // Componente para mostrar estadísticas
    const StatCard = ({ title, value, description, icon: Icon }: StatCardProps) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )

    // Componente clickeable para navegación
    const ClickableStatCard = ({ title, value, description, icon: Icon, onClick }: StatCardProps & { onClick?: () => void }) => (
        <Card 
            className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )

    if (loading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Cargando dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                            <p className="text-destructive">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Header del Dashboard */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard {user?.roles?.[0]?.rol || 'MEDISOL'}
                        </h1>
                        <p className="text-muted-foreground">
                            Bienvenido/a {user?.first_name} {user?.last_name}
                            {user?.roles?.[0]?.clinica && ` - ${user.roles[0].clinica}`}
                        </p>
                    </div>

                    {/* Estadísticas principales */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {isAdmin() && (
                            <>
                                <StatCard
                                    title="Clínicas"
                                    value={stats.clinicas}
                                    description="Total de clínicas registradas"
                                    icon={Building2}
                                />
                                <ClickableStatCard
                                    title="Doctores"
                                    value={stats.doctores}
                                    description="Médicos en el sistema"
                                    icon={Stethoscope}
                                    onClick={() => router.push('/dashboard/doctores')}
                                />
                                <ClickableStatCard
                                    title="Pacientes"
                                    value={stats.pacientes}
                                    description="Pacientes registrados"
                                    icon={UserPlus}
                                    onClick={() => router.push('/dashboard/pacientes')}
                                />
                                <StatCard
                                    title="Especialidades"
                                    value={stats.especialidades}
                                    description="Especialidades médicas"
                                    icon={Heart}
                                />
                            </>
                        )}
                        
                        {/* Estadísticas de citas (para todos los roles) */}
                        <StatCard
                            title="Citas Hoy"
                            value={stats.citas_hoy}
                            description="Citas programadas para hoy"
                            icon={Calendar}
                        />
                        <StatCard
                            title="Citas Pendientes"
                            value={stats.citas_pendientes}
                            description="Esperando confirmación"
                            icon={Clock}
                            variant="warning"
                        />
                        <StatCard
                            title="Citas Completadas"
                            value={stats.citas_completadas}
                            description="Atenciones finalizadas"
                            icon={CheckCircle2}
                            variant="success"
                        />
                        <StatCard
                            title="Actividad"
                            value={`${((stats.citas_completadas / (stats.citas_completadas + stats.citas_pendientes)) * 100 || 0).toFixed(1)}%`}
                            description="Tasa de completación"
                            icon={TrendingUp}
                        />
                    </div>

                    {/* Acciones rápidas según el rol */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {isAdmin() && (
                            <>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/clinicas')}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Gestionar Clínicas
                                        </CardTitle>
                                        <CardDescription>
                                            Administrar clínicas del sistema
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/doctores')}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Gestionar Doctores
                                        </CardTitle>
                                        <CardDescription>
                                            Administrar médicos y especialidades
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/pacientes')}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserPlus className="h-5 w-5" />
                                            Gestionar Pacientes
                                        </CardTitle>
                                        <CardDescription>
                                            Administrar pacientes registrados
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </>
                        )}
                        
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/citas')}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    {isPaciente() ? 'Mis Citas' : 'Gestionar Citas'}
                                </CardTitle>
                                <CardDescription>
                                    {isPaciente() ? 'Ver y agendar citas médicas' : 'Administrar citas médicas'}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        
                        {(isAdmin() || isDoctor()) && (
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/horarios')}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Horarios
                                    </CardTitle>
                                    <CardDescription>
                                        Gestionar horarios de atención
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
