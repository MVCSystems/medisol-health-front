"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Sidebar components será usado cuando implementemos la navegación lateral
import { api } from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    UserPlus, 
    Calendar, 
    Clock, 
    Heart, 
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Stethoscope
} from "lucide-react"

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
        <div className="flex-1 bg-gradient-to-br from-background via-muted/30 to-accent/5 p-6">
            <div className="h-full w-full max-w-none">
                {/* Header que ocupa todo el ancho */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
                                {isAdmin() ? 'Panel Administrativo' : isPaciente() ? 'Mi Panel de Salud' : 'Panel Médico'}
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                Bienvenido/a, <span className="font-semibold text-primary">{user?.first_name} {user?.last_name}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-3 bg-card rounded-2xl shadow-md border border-border">
                            <div className="w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
                            <span className="text-base font-medium text-card-foreground">Sistema Operativo</span>
                        </div>
                    </div>
                </div>

                {/* KPIs grandes que ocupan todo el espacio */}
                <div className="grid gap-8 mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {isAdmin() && (
                        <>
                            <Card className="bg-card shadow-xl hover:shadow-2xl transition-all duration-300 border border-border rounded-2xl overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-muted-foreground mb-2">Total Doctores</p>
                                            <p className="text-5xl font-bold text-card-foreground group-hover:text-primary transition-colors">{stats.doctores}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{stats.especialidades} especialidades</p>
                                        </div>
                                        <div className="p-4 bg-primary rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                            <Stethoscope className="h-8 w-8 text-primary-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card shadow-xl hover:shadow-2xl transition-all duration-300 border border-border rounded-2xl overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-muted-foreground mb-2">Total Pacientes</p>
                                            <p className="text-5xl font-bold text-card-foreground group-hover:text-secondary transition-colors">{stats.pacientes}</p>
                                            <p className="text-sm text-muted-foreground mt-1">registros activos</p>
                                        </div>
                                        <div className="p-4 bg-secondary rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                            <UserPlus className="h-8 w-8 text-secondary-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <Card className="bg-card shadow-xl hover:shadow-2xl transition-all duration-300 border border-border rounded-2xl overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-muted-foreground mb-2">Citas Hoy</p>
                                    <p className="text-5xl font-bold text-card-foreground group-hover:text-accent-foreground transition-colors">{stats.citas_hoy}</p>
                                    <p className="text-sm text-muted-foreground mt-1">programadas</p>
                                </div>
                                <div className="p-4 bg-accent rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                    <Calendar className="h-8 w-8 text-accent-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-xl hover:shadow-2xl transition-all duration-300 border border-border rounded-2xl overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-muted-foreground mb-2">Pendientes</p>
                                    <p className="text-5xl font-bold text-card-foreground group-hover:text-primary transition-colors">{stats.citas_pendientes}</p>
                                    <p className="text-sm text-muted-foreground mt-1">por confirmar</p>
                                </div>
                                <div className="p-4 bg-destructive rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                    <Clock className="h-8 w-8 text-destructive-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Módulos grandes que aprovechan todo el espacio */}
                <div className="grid gap-8 mb-10 grid-cols-1 lg:grid-cols-3">
                    {isAdmin() && (
                        <>
                            <Card 
                                className="bg-gradient-to-br from-primary to-primary/80 border-0 cursor-pointer hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2"
                                onClick={() => router.push('/dashboard/doctores')}
                            >
                                <CardContent className="p-10 text-primary-foreground">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-6 bg-primary-foreground/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-125 transition-all duration-500">
                                            <Stethoscope className="h-12 w-12 text-primary-foreground" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">Personal Médico</h3>
                                        <p className="text-primary-foreground/80 mb-4 text-lg">Gestionar doctores y especialistas</p>
                                        <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-4 w-full">
                                            <span className="text-4xl font-bold block">{stats.doctores}</span>
                                            <span className="text-primary-foreground/80 text-sm">{stats.especialidades} especialidades disponibles</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card 
                                className="bg-gradient-to-br from-secondary to-secondary/80 border-0 cursor-pointer hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2"
                                onClick={() => router.push('/dashboard/pacientes')}
                            >
                                <CardContent className="p-10 text-secondary-foreground">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-6 bg-secondary-foreground/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-125 transition-all duration-500">
                                            <UserPlus className="h-12 w-12 text-secondary-foreground" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">Base de Pacientes</h3>
                                        <p className="text-secondary-foreground/80 mb-4 text-lg">Registro y seguimiento médico</p>
                                        <div className="bg-secondary-foreground/20 backdrop-blur-sm rounded-2xl p-4 w-full">
                                            <span className="text-4xl font-bold block">{stats.pacientes}</span>
                                            <span className="text-secondary-foreground/80 text-sm">pacientes registrados</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <Card 
                        className="bg-gradient-to-br from-accent to-accent/80 border-0 cursor-pointer hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2"
                        onClick={() => router.push('/chat')}
                    >
                        <CardContent className="p-10 text-accent-foreground">
                            <div className="flex flex-col items-center text-center">
                                <div className="p-6 bg-accent-foreground/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-125 transition-all duration-500">
                                    <Heart className="h-12 w-12 text-accent-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Asistente IA</h3>
                                <p className="text-accent-foreground/80 mb-4 text-lg">Consultas médicas inteligentes</p>
                                <div className="bg-accent-foreground/20 backdrop-blur-sm rounded-2xl p-4 w-full">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-4 h-4 bg-secondary rounded-full animate-pulse shadow-lg"></div>
                                        <span className="text-lg font-semibold">Disponible 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panel de actividad que ocupa todo el espacio restante */}
                <Card className="bg-card shadow-xl border border-border rounded-3xl overflow-hidden flex-1">
                    <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-8">
                        <CardTitle className="text-3xl font-bold flex items-center gap-3">
                            <TrendingUp className="h-8 w-8" />
                            Actividad Médica Completa
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80 text-lg">
                            Panel de control integral de la actividad clínica en tiempo real
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid gap-8 md:grid-cols-3 h-full">
                            <div className="text-center p-8 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-3xl border border-secondary/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="p-4 bg-secondary rounded-full">
                                        <CheckCircle2 className="h-12 w-12 text-secondary-foreground" />
                                    </div>
                                </div>
                                <p className="text-6xl font-bold text-secondary mb-3">{stats.citas_completadas}</p>
                                <p className="text-lg font-semibold text-card-foreground mb-2">Consultas Completadas</p>
                                <p className="text-sm text-muted-foreground">Atenciones médicas finalizadas exitosamente</p>
                            </div>

                            <div className="text-center p-8 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl border border-accent/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="p-4 bg-accent rounded-full">
                                        <Clock className="h-12 w-12 text-accent-foreground" />
                                    </div>
                                </div>
                                <p className="text-6xl font-bold text-accent-foreground mb-3">{stats.citas_pendientes}</p>
                                <p className="text-lg font-semibold text-card-foreground mb-2">Citas Programadas</p>
                                <p className="text-sm text-muted-foreground">Consultas pendientes por atender</p>
                            </div>

                            <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl border border-primary/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="p-4 bg-primary rounded-full">
                                        <TrendingUp className="h-12 w-12 text-primary-foreground" />
                                    </div>
                                </div>
                                <p className="text-6xl font-bold text-primary mb-3">
                                    {((stats.citas_completadas / (stats.citas_completadas + stats.citas_pendientes)) * 100 || 0).toFixed(0)}%
                                </p>
                                <p className="text-lg font-semibold text-card-foreground mb-2">Tasa de Eficiencia</p>
                                <p className="text-sm text-muted-foreground">Porcentaje de atenciones completadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
