"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, HelpCircle, X, User, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { authApiService } from "@/services/auth-api.service"
import RegisterForm from "@/components/auth/RegisterForm"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  })

  const router = useRouter()
  const login = useAuthStore(state => state.login)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && (event.key === 'h' || event.key === 'H')) setShowAccessibilityHelp(true)
      if (event.key === 'Escape') setShowAccessibilityHelp(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.dni || !formData.password) {
      toast.error("Por favor complete todos los campos")
      return
    }

    setIsLoading(true)

    try {
      const loginData = await authApiService.login({
        dni: formData.dni,
        password: formData.password
      })

      // Guardar datos en el store
      login(loginData)

      // Mostrar toast de éxito
      toast.success("¡Bienvenido a MEDISOL!")
      
      // Guardar flag para mostrar toast en dashboard
      localStorage.setItem("showLoginToast", "true")

      // Redirigir al dashboard
      router.push("/dashboard")

    } catch (error: unknown) {
      console.error("Error de login:", error)
      
      // Manejar diferentes tipos de errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { detail?: string; error?: string; message?: string } } }
        
        if (axiosError.response?.status === 404) {
          toast.error("No se encontró un usuario con ese DNI")
        } else if (axiosError.response?.status === 401) {
          toast.error("DNI o contraseña incorrectos")
        } else if (axiosError.response?.status === 500) {
          toast.error("Error interno del servidor. Por favor, contacte al administrador.")
          console.error("Error 500 details:", axiosError.response?.data)
        } else if (axiosError.response?.data?.detail) {
          toast.error(axiosError.response.data.detail)
        } else if (axiosError.response?.data?.error) {
          toast.error(axiosError.response.data.error)
        } else if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message)
        } else {
          toast.error("Error al iniciar sesión. Intente nuevamente.")
        }
      } else {
        toast.error("Error al iniciar sesión. Intente nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form className={cn("space-y-4 sm:space-y-6", className)} onSubmit={handleSubmit} {...props}>
        {/* Título principal y móvil */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Iniciar Sesión
          </h2>
          <p 
            className="text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Acceda a su cuenta médica
          </p>
        </div>
        {/* Campos */}
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label 
              htmlFor="dni" 
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              DNI
            </Label>
            <Input 
              id="dni" 
              name="dni"
              type="text" 
              placeholder="12345678" 
              value={formData.dni}
              onChange={handleInputChange}
              required 
              maxLength={8}
              className="h-10 sm:h-12 text-sm sm:text-base rounded-lg shadow-sm transition-all duration-200"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Contraseña
              </Label>
              <a 
                href="#" 
                className="text-xs sm:text-sm font-medium hover:underline transition-colors"
                style={{ color: "var(--primary)" }}
              >
                ¿Olvidó su contraseña?
              </a>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                name="password"
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={handleInputChange}
                required 
                className="h-10 sm:h-12 text-sm sm:text-base rounded-lg shadow-sm pr-10 sm:pr-12 transition-all duration-200"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
        {/* Botón principal */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-10 sm:h-12 font-semibold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg rounded-lg disabled:opacity-50"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)"
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <span 
              className="w-full border-t"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span 
              className="px-3 sm:px-4 font-medium"
              style={{ 
                backgroundColor: "var(--background)",
                color: "var(--muted-foreground)"
              }}
            >
              O
            </span>
          </div>
        </div>
        {/* Google */}
        <Link href="/dashboard/guest" className="w-full">
        <Button
          variant="outline" 
          type="button" 
          className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)"
          }}
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
          Ingresar como invitado
        </Button>
        </Link>
        {/* Accesibilidad y ayuda */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t space-y-2 sm:space-y-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="text-center sm:text-left">
            <p 
              className="text-xs sm:text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              ¿No tiene cuenta?{' '}
              <button 
                type="button" 
                className="font-medium hover:underline"
                style={{ color: "var(--secondary)" }}
                onClick={() => setShowRegister(true)}
              >
                Registrarse
              </button>
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Presione <kbd 
                className="px-1 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)"
                }}
              >Alt + H</kbd> para ayuda
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowAccessibilityHelp(true)} 
            className="transition-colors p-1 rounded mx-auto sm:mx-0"
            style={{ color: "var(--muted-foreground)" }}
            title="Ayuda de accesibilidad (Alt + H)"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
      {/* Modal de Accesibilidad */}
      {showAccessibilityHelp && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-primary-foreground flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />Ayuda de Accesibilidad</h3>
              <button onClick={() => setShowAccessibilityHelp(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Cerrar ayuda de accesibilidad"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Navegación por teclado:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded text-xs font-mono">Tab</kbd> - Navegar entre campos</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded text-xs font-mono">Enter</kbd> - Activar botones</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded text-xs font-mono">Alt + H</kbd> - Abrir esta ayuda</li>
                  <li>• <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 rounded text-xs font-mono">Esc</kbd> - Cerrar este modal</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Opciones de accesibilidad:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-xs">
                  <li>• Modo alto contraste para mejor visibilidad</li>
                  <li>• Ajuste de tamaño de fuente (+ / -)</li>
                  <li>• Posibilidad de pausar animaciones</li>
                  <li>• Campos y botones grandes para fácil interacción</li>
                  <li>• Compatible con lectores de pantalla</li>
                  <li>• Navegación completa por teclado</li>
                  <li>• <b>Modo lectura fácil:</b> simplifica la interfaz y el texto para mejor comprensión.</li>
                  <li>• <b>Modo daltonismo:</b> aplica filtros de color para personas con dificultades de visión cromática.</li>
                  <li>• <b>Modo sin distracciones:</b> oculta elementos no esenciales para facilitar la concentración.</li>
                </ul>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                <h4 className="font-semibold text-foreground mb-1">Soporte técnico:</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">Para asistencia adicional, contacte al departamento de TI</p>
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1">📞 (01) 234-5678</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowAccessibilityHelp(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">Entendido</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Registro */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 dark:bg-black/60">
          <RegisterForm onClose={() => setShowRegister(false)} />
        </div>
      )}
    </>
  )
}
