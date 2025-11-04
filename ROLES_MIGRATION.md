# 🔄 Migración de Sistema de Roles

## Resumen de Cambios

Se migró el sistema de permisos desde un modelo personalizado de `Rol` y `UsuarioRol` hacia **Django Groups** nativo.

---

## 🎯 Backend (Ya Implementado)

### Modelo de Usuario (`usuarios/models.py`)

**Estructura actual:**
```python
class Usuario(AbstractUser):
    # ... campos básicos ...
    
    # Métodos de rol usando Django Groups
    def es_admin(self):
        return self.groups.filter(name='Administrador').exists()
    
    def es_doctor(self):
        return self.groups.filter(name='Doctor').exists()
    
    def es_paciente(self):
        return self.groups.filter(name='Paciente').exists()
    
    def obtener_rol(self):
        """Retorna el nombre del grupo/rol principal del usuario"""
        if self.es_admin():
            return 'Administrador'
        elif self.es_doctor():
            return 'Doctor'
        elif self.es_paciente():
            return 'Paciente'
        return None
```

### Respuesta de Login (`usuarios/views.py`)

```python
# Vista login_view retorna:
{
    'user': {
        'id': user.id,
        'dni': user.dni,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'telefono': user.telefono,
        'direccion': user.direccion,
        'roles': [group.name for group in user.groups.all()],  # Array de strings
        'rol': user.obtener_rol(),  # Rol principal
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    },
    'tokens': {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
}
```

### Grupos Disponibles

- **Administrador**: Control total del sistema
- **Doctor**: Médico que atiende pacientes
- **Paciente**: Usuario que recibe atención médica
- **Recepcionista**: Maneja agenda y recepción

---

## ✅ Frontend (Actualizado)

### 1. Tipos Actualizados

#### `/types/usuarios.d.ts`
```typescript
export interface Usuario {
  id: number;
  dni: string;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  direccion?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  roles: string[]; // ✅ Array simple de nombres de grupos
  rol?: string;    // ✅ Rol principal (calculado por backend)
}
```

#### `/types/usuario.ts`
```typescript
export interface Usuario {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono?: string;
  direccion?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  fecha_eliminacion?: string;
  roles: string[]; // ✅ Array simple
  rol?: string;    // ✅ Rol principal
  date_joined: string;
}
```

### 2. Store de Autenticación

#### `/store/authStore.ts`

**Estructura de User:**
```typescript
interface User {
  id: number
  dni: string
  email: string
  first_name: string
  last_name: string
  telefono?: string
  direccion?: string
  roles: string[]  // ✅ Array simple de nombres de grupos
  rol?: string     // ✅ Rol principal
  is_staff: boolean
  is_superuser: boolean
}
```

**Métodos Actualizados:**
```typescript
// ✅ Obtener rol principal
getUserRole: () => {
  const { user } = get()
  return user?.rol || user?.roles?.[0] || null
}

// ✅ Verificar si es admin
isAdmin: () => {
  const { user } = get()
  return user?.is_superuser || user?.roles?.includes('Administrador') || false
}

// ✅ Verificar si es doctor
isDoctor: () => {
  const { user } = get()
  return user?.roles?.includes('Doctor') || false
}

// ✅ Verificar si es paciente
isPaciente: () => {
  const { user } = get()
  return user?.roles?.includes('Paciente') || false
}

// ✅ Verificar si es recepcionista
isRecepcionista: () => {
  const { user } = get()
  return user?.roles?.includes('Recepcionista') || false
}
```

### 3. Componentes Actualizados

#### `/components/usuarios/usuario-card.tsx`

**Antes:**
```tsx
{usuario.roles.map((rol) => (
  <Badge key={rol.id} className={getRoleBadgeColor(rol.rol_nombre)}>
    {rol.rol_nombre}
  </Badge>
))}
```

**Ahora:**
```tsx
{usuario.roles.map((rolNombre, index) => (
  <Badge key={index} className={getRoleBadgeColor(rolNombre)}>
    {rolNombre}
  </Badge>
))}
{usuario.is_superuser && (
  <Badge className="bg-purple-100 text-purple-700">
    Superusuario
  </Badge>
)}
```

#### `/components/usuarios/delete-confirm-dialog.tsx`

**Antes:**
```tsx
{usuario.roles.map(r => r.rol_nombre).join(', ')}
```

**Ahora:**
```tsx
{usuario.roles.join(', ')}
```

#### `/components/usuarios/usuario-form.tsx`

**Antes:**
```tsx
rol: usuario.roles?.[0]?.rol_nombre || 'Paciente'
```

**Ahora:**
```tsx
rol: usuario.rol || usuario.roles?.[0] || 'Paciente'
```

### 4. Páginas Actualizadas

#### Filtrado de Usuarios

**Antes:**
```tsx
const matchesRole = roleFilter === "ALL" || 
  usuario.roles?.some((role) => role.rol_nombre === roleFilter);
```

**Ahora:**
```tsx
const matchesRole = roleFilter === "ALL" || 
  usuario.roles?.includes(roleFilter) || 
  usuario.rol === roleFilter;
```

#### Conteo de Pacientes (Dashboard)

**Antes:**
```tsx
type UsuarioSimple = { roles?: Array<{ rol_nombre: string }> }
const usuarios = getArrayFromData(usuariosData) as UsuarioSimple[];
pacientesCount = usuarios.filter((usuario) =>
  usuario?.roles?.some(rol => rol.rol_nombre === 'Paciente')
).length;
```

**Ahora:**
```tsx
type UsuarioSimple = { roles?: string[], rol?: string }
const usuarios = getArrayFromData(usuariosData) as UsuarioSimple[];
pacientesCount = usuarios.filter((usuario) =>
  usuario?.roles?.includes('Paciente') || usuario?.rol === 'Paciente'
).length;
```

---

## 📋 Archivos Modificados

### Frontend
1. ✅ `/types/usuarios.d.ts` - Definición de tipos
2. ✅ `/types/usuario.ts` - Interfaz de Usuario
3. ✅ `/store/authStore.ts` - Store de autenticación
4. ✅ `/components/usuarios/usuario-card.tsx` - Tarjeta de usuario
5. ✅ `/components/usuarios/delete-confirm-dialog.tsx` - Diálogo de confirmación
6. ✅ `/components/usuarios/usuario-form.tsx` - Formulario de usuario
7. ✅ `/app/dashboard/usuarios/usuarios-crud.tsx` - CRUD de usuarios
8. ✅ `/app/dashboard/usuarios/page.tsx` - Página de usuarios
9. ✅ `/app/dashboard/dashboard-content.tsx` - Contenido del dashboard

---

## 🔍 Comparación: Antes vs Ahora

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Estructura Backend** | Modelo `Rol` + `UsuarioRol` | Django `Groups` nativo |
| **Relación Usuario-Rol** | ManyToMany personalizado | `user.groups.all()` |
| **Estructura Frontend** | `roles: Array<{id, rol_nombre, clinica}>` | `roles: string[]` |
| **Verificación de Rol** | `user.roles.some(r => r.rol === 'X')` | `user.roles.includes('X')` |
| **Rol Principal** | `user.roles[0].rol_nombre` | `user.rol` o `user.roles[0]` |
| **Clínicas por Rol** | `rol.clinica_nombre` | ❌ Eliminado (implementar si necesario) |

---

## 🚀 Ventajas de Django Groups

### ✅ Beneficios

1. **Nativo de Django**: Usa el sistema de permisos integrado
2. **Admin de Django**: Gestión automática en `/admin/`
3. **Escalabilidad**: Fácil agregar nuevos grupos
4. **Permisos Granulares**: Compatible con Django permissions
5. **Menos Código**: No necesitas modelos personalizados
6. **Estándar**: Otros paquetes Django lo reconocen

### 📦 Funcionalidades

```python
# Asignar rol a usuario
from django.contrib.auth.models import Group
grupo = Group.objects.get(name='Doctor')
user.groups.add(grupo)

# Verificar rol
user.groups.filter(name='Doctor').exists()

# Obtener todos los roles
roles = [group.name for group in user.groups.all()]

# Remover rol
user.groups.remove(grupo)

# Limpiar todos los roles
user.groups.clear()
```

---

## 🔄 Migración de Datos (Si necesitas migrar)

Si tenías datos en el modelo anterior `Rol` y `UsuarioRol`:

```python
# Script de migración (ejemplo)
from django.contrib.auth.models import Group
from usuarios.models import Usuario, UsuarioRol

# Para cada usuario con roles antiguos
for usuario_rol in UsuarioRol.objects.all():
    # Obtener o crear el grupo
    grupo, _ = Group.objects.get_or_create(name=usuario_rol.rol.nombre)
    
    # Asignar el grupo al usuario
    usuario_rol.usuario.groups.add(grupo)
    
print("Migración completada")
```

---

## ⚠️ Notas Importantes

1. **Clínicas**: El campo `clinica` en roles se eliminó. Si necesitas asociar usuarios a clínicas:
   - Opción A: Agregar `clinica` ForeignKey directamente en `Usuario`
   - Opción B: Crear modelo intermedio `UsuarioClinica`
   - Opción C: Usar Django permissions por clínica

2. **Permisos Granulares**: Django Groups permite permisos específicos:
   ```python
   from django.contrib.auth.models import Permission
   
   # Asignar permisos específicos a un grupo
   permiso = Permission.objects.get(codename='add_cita')
   grupo.permissions.add(permiso)
   ```

3. **Múltiples Roles**: Un usuario puede tener múltiples grupos:
   ```python
   # Usuario puede ser Doctor Y Recepcionista
   user.groups.add(grupo_doctor, grupo_recepcionista)
   ```

---

## 🧪 Testing

### Verificar en el Frontend
```typescript
const user = useAuthStore(state => state.user);
console.log('Roles:', user?.roles);        // ['Administrador']
console.log('Rol Principal:', user?.rol);  // 'Administrador'
console.log('Es Admin:', useAuthStore.getState().isAdmin()); // true
```

### Verificar en el Backend
```python
from usuarios.models import Usuario

user = Usuario.objects.get(dni='12345678')
print('Roles:', [g.name for g in user.groups.all()])
print('Es Admin:', user.es_admin())
print('Rol Principal:', user.obtener_rol())
```

---

## 📚 Referencias

- [Django Authentication System](https://docs.djangoproject.com/en/5.0/topics/auth/)
- [Django Groups and Permissions](https://docs.djangoproject.com/en/5.0/topics/auth/default/#groups)
- [Django Admin Site](https://docs.djangoproject.com/en/5.0/ref/contrib/admin/)
