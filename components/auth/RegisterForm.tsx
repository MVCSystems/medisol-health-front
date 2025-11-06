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

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
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
    <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-border relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Cerrar registro"><X className="w-5 h-5" /></button>
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Registro de Usuario</h2>
      
      {/* Mensaje de éxito */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>¡Registro exitoso! Redirigiendo...</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="whitespace-pre-line text-sm">{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipoDoc">Tipo Doc</Label>
            <select id="tipoDoc" name="tipoDoc" className="w-full h-10 rounded-lg border-border bg-background text-foreground focus:border-primary">
              <option value="dni">DNI</option>
              <option value="ce">Carnet de Extranjería</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dni">N° Documento</Label>
            <Input id="dni" name="dni" type="text" maxLength={12} required placeholder="Ingrese su número" />
          </div>
          <div>
            <Label htmlFor="nombres">Nombres</Label>
            <Input id="nombres" name="nombres" type="text" required placeholder="Nombres" />
          </div>
          <div>
            <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
            <Input id="apellidoPaterno" name="apellidoPaterno" type="text" required placeholder="Apellido paterno" />
          </div>
          <div>
            <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
            <Input id="apellidoMaterno" name="apellidoMaterno" type="text" required placeholder="Apellido materno" />
          </div>
          <div>
            <Label htmlFor="celular">Celular</Label>
            <Input id="celular" name="celular" type="tel" required placeholder="999999999" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="usuario@email.com" />
          </div>
          <div>
            <Label htmlFor="departamento">Departamento</Label>
            <Input id="departamento" name="departamento" type="text" required placeholder="Departamento" />
          </div>
          <div>
            <Label htmlFor="provincia">Provincia</Label>
            <Input id="provincia" name="provincia" type="text" required placeholder="Provincia" />
          </div>
          <div>
            <Label htmlFor="distrito">Distrito</Label>
            <Input id="distrito" name="distrito" type="text" required placeholder="Distrito" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" type="text" required placeholder="Dirección completa" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required placeholder="Contraseña" className="pr-10" />
            <button type="button" className="absolute right-2 top-8 text-gray-500 dark:text-gray-400" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="relative">
            <Label htmlFor="repeatPassword">Repetir Contraseña</Label>
            <Input id="repeatPassword" name="repeatPassword" type={showRepeatPassword ? 'text' : 'password'} required placeholder="Repetir contraseña" className="pr-10" />
            <button type="button" className="absolute right-2 top-8 text-gray-500 dark:text-gray-400" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
              {showRepeatPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || success}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registrando...' : success ? 'Registro exitoso' : 'Registrar'}
        </Button>
      </form>
    </div>
  )
}
