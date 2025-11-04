"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios"
import { formatearFecha } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Calendar, 
    Clock, 
    Heart, 
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    Users
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

// Helpers de tipado seguro
function extractData(raw: unknown): unknown {
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        return (raw as { data: unknown }).data ?? raw
    }
    return raw
}

function getArrayFromData(data: unknown): unknown[] {
    if (Array.isArray(data)) return data
    if (typeof data === 'object' && data !== null && 'results' in data) {
        const res = (data as { results?: unknown }).results
        if (Array.isArray(res)) return res
    }
    return []
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
                if (isAdmin()) {
                    // Admin: cargar todas las estadísticas
                    const [clinicasRes, doctoresRes, , citasRes, especialidadesRes, usuariosRes] = await Promise.allSettled([
                        api.get("/api/clinicas/clinicas/"),
                        api.get("/api/clinicas/doctores/"),
                        api.get("/api/clinicas/pacientes/"),
                        api.get("/api/clinicas/citas/"),
                        api.get("/api/clinicas/especialidades/"),
                        api.get("/api/usuarios/usuarios/")
                    ]);

                    // Helper para contar resultados
                    const getCount = (response: PromiseSettledResult<unknown>) => {
                        if (response.status !== 'fulfilled') return 0;
                        const raw: unknown = (response as PromiseFulfilledResult<unknown>).value;
                        const data = extractData(raw);
                        if (typeof data === 'object' && data !== null && 'count' in data && typeof (data as { count?: unknown }).count === 'number') {
                            return (data as { count: number }).count
                        }
                        if (Array.isArray(data)) return data.length
                        if (typeof data === 'object' && data !== null && 'results' in data) {
                            const res = (data as { results?: unknown }).results
                            if (Array.isArray(res)) return res.length
                        }
                        return 0;
                    };

                    // Contar usuarios con rol Paciente específicamente
                    let pacientesCount = 0;
                    if (usuariosRes.status === 'fulfilled') {
                        const rawUsuarios: unknown = (usuariosRes as PromiseFulfilledResult<unknown>).value;
                        const usuariosData = extractData(rawUsuarios);
                        // 🔄 ACTUALIZADO: roles ahora es string[] (Django Groups)
                        type UsuarioSimple = { roles?: string[], rol?: string }
                        const usuarios = getArrayFromData(usuariosData) as UsuarioSimple[];
                        pacientesCount = usuarios.filter((usuario) =>
                            usuario?.roles?.includes('Paciente') || usuario?.rol === 'Paciente'
                        ).length;
                    }

                    // Procesar citas para estadísticas detalladas
                    let citasHoy = 0;
                    let citasPendientes = 0;
                    let citasCompletadas = 0;
                    if (citasRes.status === 'fulfilled') {
                        const rawCitas: unknown = (citasRes as PromiseFulfilledResult<unknown>).value;
                        const citasData = extractData(rawCitas);
                        const citas = getArrayFromData(citasData) as Cita[];
                        const hoy = formatearFecha(new Date());
                        citas.forEach((cita: Cita) => {
                            if (cita.fecha === hoy) citasHoy++;
                            if (cita.estado === 'PENDIENTE') citasPendientes++;
                            if (cita.estado === 'COMPLETADA') citasCompletadas++;
                        });
                    }

                    setStats({
                        clinicas: getCount(clinicasRes),
                        doctores: getCount(doctoresRes),
                        pacientes: pacientesCount,
                        citas_hoy: citasHoy,
                        citas_pendientes: citasPendientes,
                        citas_completadas: citasCompletadas,
                        especialidades: getCount(especialidadesRes)
                    });
                } else if (isDoctor() || isPaciente()) {
                    // Doctor/Paciente: cargar sus propias citas
                    // Usar /citas/ directamente ya que el backend filtra por usuario
                    try {
                        const response = await api.get("/api/clinicas/citas/");
                        const citasData = extractData(response);
                        const citas = getArrayFromData(citasData) as Cita[];
                        const hoy = formatearFecha(new Date());

                        setStats(prev => ({
                            ...prev,
                            citas_pendientes: citas.filter((cita: Cita) => cita.estado === 'PENDIENTE').length,
                            citas_completadas: citas.filter((cita: Cita) => cita.estado === 'COMPLETADA').length,
                            citas_hoy: citas.filter((cita: Cita) => cita.fecha === hoy).length
                        }));
                    } catch (citasErr) {
                        console.error('Error al cargar citas:', citasErr);
                        // Si falla, establecer valores en 0
                        setStats(prev => ({
                            ...prev,
                            citas_pendientes: 0,
                            citas_completadas: 0,
                            citas_hoy: 0
                        }));
                    }
                }
            } catch (err) {
                console.error('Error al cargar estadísticas:', err);
                setError('Error al cargar las estadísticas del dashboard. Por favor, verifica tu conexión.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardStats();
    }, [isAdmin, isDoctor, isPaciente, user]);

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
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
                                {isAdmin() ? 'Panel Administrativo' : isPaciente() ? 'Mi Panel de Salud' : 'Panel Médico'}
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                Bienvenido/a, <span className="font-semibold text-primary">{user?.first_name} {user?.last_name}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl shadow-lg border-2 border-primary/20">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                                    <Heart className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-primary">Sistema Médico</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    En Línea
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs - Diferentes según el rol */}
                <div className="grid gap-8 mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Tarjetas comunes para todos */}
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

                    {/* Tarjetas solo para ADMIN */}
                    {isAdmin() && (
                        <>
                            <Card className="bg-card shadow-xl hover:shadow-2xl transition-all duration-300 border border-border rounded-2xl overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-muted-foreground mb-2">Doctores</p>
                                            <p className="text-5xl font-bold text-card-foreground group-hover:text-primary transition-colors">{stats.doctores}</p>
                                            <p className="text-sm text-muted-foreground mt-1">activos</p>
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
                                            <p className="text-base font-semibold text-muted-foreground mb-2">Pacientes</p>
                                            <p className="text-5xl font-bold text-card-foreground group-hover:text-primary transition-colors">{stats.pacientes}</p>
                                            <p className="text-sm text-muted-foreground mt-1">registrados</p>
                                        </div>
                                        <div className="p-4 bg-secondary rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                            <Users className="h-8 w-8 text-secondary-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Acciones Rápidas según el rol */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                        Acciones Rápidas
                    </h2>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {isAdmin() && (
                            <>
                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/citas')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Calendar className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Gestionar Citas</p>
                                                <p className="text-sm text-muted-foreground">Ver todas las citas</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/doctores')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Stethoscope className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Doctores</p>
                                                <p className="text-sm text-muted-foreground">Administrar personal médico</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/pacientes')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Users className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Pacientes</p>
                                                <p className="text-sm text-muted-foreground">Gestionar pacientes</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/usuarios')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Users className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Usuarios</p>
                                                <p className="text-sm text-muted-foreground">Gestionar usuarios del sistema</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {isDoctor() && (
                            <>
                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/citas')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Calendar className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Mis Citas</p>
                                                <p className="text-sm text-muted-foreground">Ver mis consultas</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/horarios')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Clock className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Mis Horarios</p>
                                                <p className="text-sm text-muted-foreground">Configurar disponibilidad</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/doctores')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Stethoscope className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Directorio Médico</p>
                                                <p className="text-sm text-muted-foreground">Ver otros doctores</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/chat')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Heart className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Asistente IA</p>
                                                <p className="text-sm text-muted-foreground">Consultas inteligentes</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {isPaciente() && (
                            <>
                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/citas')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Calendar className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Mis Citas</p>
                                                <p className="text-sm text-muted-foreground">Ver mis consultas</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/citas/nueva')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Calendar className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Agendar Cita</p>
                                                <p className="text-sm text-muted-foreground">Nueva consulta médica</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/dashboard/doctores')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Stethoscope className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Buscar Doctor</p>
                                                <p className="text-sm text-muted-foreground">Directorio médico</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
                                    onClick={() => router.push('/chat')}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all">
                                                <Heart className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">Asistente IA</p>
                                                <p className="text-sm text-muted-foreground">Consultas 24/7</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>

                {/* Módulos grandes que aprovechan todo el espacio */}
                <div className="grid gap-8 mb-10 grid-cols-1">
                    {/* Panel de información según el rol */}
                    {isAdmin() && (
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <TrendingUp className="h-7 w-7 text-primary" />
                                    Panel de Control Administrativo
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Gestión completa del sistema médico
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-card rounded-xl border">
                                        <p className="text-sm text-muted-foreground mb-2">Total Clínicas</p>
                                        <p className="text-3xl font-bold">{stats.clinicas}</p>
                                    </div>
                                    <div className="p-4 bg-card rounded-xl border">
                                        <p className="text-sm text-muted-foreground mb-2">Especialidades</p>
                                        <p className="text-3xl font-bold">{stats.especialidades}</p>
                                    </div>
                                    <div className="p-4 bg-card rounded-xl border">
                                        <p className="text-sm text-muted-foreground mb-2">Personal Total</p>
                                        <p className="text-3xl font-bold">{stats.doctores + stats.pacientes}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isDoctor() && (
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Stethoscope className="h-7 w-7 text-primary" />
                                    Mi Práctica Médica
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Resumen de tu actividad clínica
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="font-medium">Consultas de Hoy</span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary">{stats.citas_hoy}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-secondary" />
                                            <span className="font-medium">Completadas</span>
                                        </div>
                                        <span className="text-2xl font-bold text-secondary">{stats.citas_completadas}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-destructive" />
                                            <span className="font-medium">Pendientes</span>
                                        </div>
                                        <span className="text-2xl font-bold text-destructive">{stats.citas_pendientes}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isPaciente() && (
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Heart className="h-7 w-7 text-primary" />
                                    Mi Historial Médico
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Tu información de salud
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="font-medium">Próximas Citas</span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary">{stats.citas_pendientes}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-secondary" />
                                            <span className="font-medium">Consultas Realizadas</span>
                                        </div>
                                        <span className="text-2xl font-bold text-secondary">{stats.citas_completadas}</span>
                                    </div>
                                    <div className="p-4 bg-accent/20 rounded-xl border border-accent">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Heart className="h-5 w-5 text-accent-foreground" />
                                            <span className="font-medium">Asistente de Salud IA</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Disponible 24/7 para consultas básicas de salud
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
