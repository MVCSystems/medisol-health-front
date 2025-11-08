"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState, FormEvent } from 'react'
import { authApiService } from '@/services/auth-api.service'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function RegisterForm({ onClose }: { onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  
  const login = useAuthStore(state => state.login)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const dni = formData.get('dni') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const repeatPassword = formData.get('repeatPassword') as string
    const first_name = formData.get('nombres') as string
    const apellidoPaterno = formData.get('apellidoPaterno') as string
    const apellidoMaterno = formData.get('apellidoMaterno') as string
    const telefono = formData.get('celular') as string
    const departamento = formData.get('departamento') as string
    const provincia = formData.get('provincia') as string
    const distrito = formData.get('distrito') as string
    const direccionCalle = formData.get('direccion') as string

    // Validaciones
    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setIsLoading(false)
      return
    }

    if (dni.length < 8) {
      setError('El DNI debe tener al menos 8 dígitos')
      setIsLoading(false)
      return
    }

    try {
      // Construir apellido completo y dirección completa
      const last_name = `${apellidoPaterno} ${apellidoMaterno}`.trim()
      const direccion = `${direccionCalle}, ${distrito}, ${provincia}, ${departamento}`.trim()

      // Registrar usuario
      const response = await authApiService.register({
        dni,
        email,
        password,
        password2: password, // Backend requiere password2 para validación
        first_name,
        last_name,
        telefono,
        direccion
      })

      // Mostrar mensaje de éxito
      setSuccess(true)

      // Auto-login después de registro exitoso
      setTimeout(() => {
        login({
          user: {
            id: response.user.id,
            dni: response.user.dni,
            email: response.user.email,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            telefono: response.user.telefono,
            direccion: response.user.direccion,
            is_staff: false,
            is_superuser: false,
            roles: ['Paciente'],
            rol: 'Paciente'
          },
          tokens: {
            access: response.access,
            refresh: response.refresh
          }
        })

        // Redirigir al dashboard
        router.push('/dashboard')
        onClose()
      }, 1500)
    } catch (err: unknown) {
      console.error('Error de registro:', err)
      const error = err as { response?: { data?: Record<string, unknown> } }
      
      if (error.response?.data) {
        // Extraer mensajes de error del backend
        const errors = error.response.data
        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`
              }
              return `${key}: ${value}`
            })
            .join('\n')
          setError(errorMessages)
        } else {
          setError(String(errors))
        }
      } else {
        setError('Error al registrar usuario. Por favor, intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
  <div className="bg-background rounded-3xl max-w-xl w-full p-5 relative overflow-hidden border-none shadow-none" style={{border: 'none', boxShadow: 'none'}}>
      {/* Header */}
  <div className="flex items-center justify-between mb-3 pb-2.5">
        <h2 className="text-xl font-bold text-foreground">Registro de Usuario</h2>
        <button 
          onClick={onClose} 
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50" 
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mensajes */}
      {success && (
        <div className="mb-3 p-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium">¡Registro exitoso! Redirigiendo...</span>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg flex items-start gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs whitespace-pre-line">{error}</span>
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Documento */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="tipoDoc" className="text-xs">Tipo</Label>
            <select 
              id="tipoDoc" 
              name="tipoDoc" 
              className="w-full h-8 rounded-md border border-input bg-background text-xs outline-none"
            >
              <option value="dni">DNI</option>
              <option value="ce">C.E.</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="dni" className="text-xs">N° Documento *</Label>
            <Input 
              id="dni" 
              name="dni" 
              type="text" 
              maxLength={12} 
              required 
              placeholder="12345678" 
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="nombres" className="text-xs">Nombres *</Label>
            <Input 
              id="nombres" 
              name="nombres" 
              type="text" 
              required 
              placeholder="Juan" 
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="apellidoPaterno" className="text-xs">Ap. Paterno *</Label>
            <Input 
              id="apellidoPaterno" 
              name="apellidoPaterno" 
              type="text" 
              required 
              placeholder="Pérez" 
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="apellidoMaterno" className="text-xs">Ap. Materno *</Label>
            <Input 
              id="apellidoMaterno" 
              name="apellidoMaterno" 
              type="text" 
              required 
              placeholder="García" 
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="celular" className="text-xs">Celular *</Label>
            <Input 
              id="celular" 
              name="celular" 
              type="tel" 
              required 
              placeholder="999888777" 
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Correo *</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="usuario@email.com" 
            className="h-8 text-xs"
          />
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="departamento" className="text-xs">Depto. *</Label>
            <Input 
              id="departamento" 
              name="departamento" 
              type="text" 
              required 
              placeholder="Lima" 
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="provincia" className="text-xs">Provincia *</Label>
            <Input 
              id="provincia" 
              name="provincia" 
              type="text" 
              required 
              placeholder="Lima" 
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="distrito" className="text-xs">Distrito *</Label>
            <Input 
              id="distrito" 
              name="distrito" 
              type="text" 
              required 
              placeholder="Miraflores" 
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-1">
          <Label htmlFor="direccion" className="text-xs">Dirección *</Label>
          <Input 
            id="direccion" 
            name="direccion" 
            type="text" 
            required 
            placeholder="Av. Principal 123" 
            className="h-8 text-xs"
          />
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative space-y-1">
            <Label htmlFor="password" className="text-xs">Contraseña *</Label>
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              required 
              placeholder="Mín. 8 caracteres" 
              className="h-8 text-xs pr-8" 
            />
            <button 
              type="button" 
              className="absolute right-2 top-[22px] text-muted-foreground hover:text-foreground transition-colors text-xs" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="relative space-y-1">
            <Label htmlFor="repeatPassword" className="text-xs">Confirmar *</Label>
            <Input 
              id="repeatPassword" 
              name="repeatPassword" 
              type={showRepeatPassword ? 'text' : 'password'} 
              required 
              placeholder="Repita" 
              className="h-8 text-xs pr-8" 
            />
            <button 
              type="button" 
              className="absolute right-2 top-[22px] text-muted-foreground hover:text-foreground transition-colors text-xs" 
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              {showRepeatPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Botón */}
        <div className="pt-2.5">
          <Button 
            type="submit" 
            disabled={isLoading || success}
            className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Registrando...
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Éxito
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
