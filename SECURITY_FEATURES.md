# 🔒 Características de Seguridad - Frontend

## Validaciones Implementadas

### 1. **Validación de DNI**
- ✅ Formato: Exactamente 8 dígitos numéricos
- ✅ Sanitización: Elimina caracteres no numéricos
- ✅ Feedback en tiempo real con border verde cuando es válido

### 2. **Validación de Nombres y Apellidos**
- ✅ Solo letras, espacios y tildes (áéíóúñü)
- ✅ Mínimo 2 caracteres, máximo 100
- ✅ Elimina caracteres especiales automáticamente

### 3. **Validación de Celular**
- ✅ Solo números (7-15 dígitos)
- ✅ Formato internacional compatible
- ✅ Sanitización automática de caracteres no numéricos

### 4. **Validación de Email**
- ✅ Formato estándar RFC (usuario@dominio.com)
- ✅ Conversión automática a minúsculas
- ✅ Máximo 100 caracteres

### 5. **Validación de Fecha**
- ✅ Formato DD/MM/YYYY
- ✅ Validación de días, meses y años válidos
- ✅ Previene fechas imposibles (ej: 31 de febrero)

### 6. **Validación de Hora**
- ✅ Formato HH:MM (24 horas)
- ✅ Rango válido: 00:00 - 23:59

### 7. **Validación de Motivo**
- ✅ Mínimo 5 caracteres, máximo 200
- ✅ Sanitización contra XSS (Cross-Site Scripting)
- ✅ Escapado de caracteres HTML peligrosos

## Características de UX

### Placeholders Inteligentes
El sistema detecta automáticamente qué está pidiendo el bot y muestra placeholders contextuales:

```typescript
"Ingresa tu DNI (8 dígitos)..."
"Ingresa tus nombres..."
"Ingresa tu celular (ej: 987654321)..."
"Ingresa tu email (ej: usuario@correo.com)..."
```

### Validación en Tiempo Real
- ✅ **Border verde**: Cuando el formato es correcto
- ✅ **Border rojo**: Cuando hay un error
- ✅ **Mensajes de ayuda**: Aparecen debajo del input
- ✅ **Validación automática**: Detecta el tipo de dato que estás ingresando

### Formateo Automático
El sistema formatea automáticamente los datos antes de enviarlos:
- DNI: Solo números (elimina espacios, guiones, etc.)
- Celular: Solo números
- Email: Minúsculas sin espacios
- Nombres: Solo letras y espacios permitidos

## Prevención de Ataques

### XSS (Cross-Site Scripting)
```typescript
// Escapa caracteres peligrosos
sanitizarTexto(texto)
// Convierte: <script>alert('XSS')</script>
// En: &lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;
```

### Inyección SQL
- Todas las validaciones previenen caracteres especiales de SQL
- El backend tiene sanitización adicional con Django ORM

### Input Injection
- Límites de longitud estrictos en todos los campos
- Regex patterns que solo permiten caracteres válidos

## Archivos Implementados

### `/lib/validations.ts`
Contiene todas las funciones de validación y sanitización:
- `validarDNI()` - Valida formato de DNI
- `validarNombre()` - Valida nombres/apellidos
- `validarCelular()` - Valida números de celular
- `validarEmail()` - Valida emails
- `validarFecha()` - Valida fechas DD/MM/YYYY
- `validarHora()` - Valida horas HH:MM
- `validarMotivo()` - Valida texto del motivo
- `sanitizarTexto()` - Sanitiza texto general contra XSS
- `formatearDNI()` - Formatea DNI
- `formatearCelular()` - Formatea celular
- `formatearNombre()` - Formatea nombres
- `formatearEmail()` - Formatea email

### `/components/chat/chatbot-form.tsx`
Componente principal mejorado con:
- Validación automática según contexto
- Placeholders inteligentes
- Feedback visual en tiempo real
- Manejo de errores amigable

## Ejemplos de Uso

### Validación de DNI
```typescript
const validacion = validarDNI("12345678");
if (validacion.valido) {
  // DNI es válido
} else {
  console.error(validacion.error); // "El DNI debe tener exactamente 8 dígitos"
}
```

### Validación de Email
```typescript
const validacion = validarEmail("usuario@correo.com");
if (validacion.valido) {
  const emailLimpio = formatearEmail("USUARIO@CORREO.COM");
  // resultado: "usuario@correo.com"
}
```

### Sanitización de Texto
```typescript
const textoSeguro = sanitizarTexto("<script>alert('XSS')</script>");
// resultado: "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;"
```

## Compatibilidad con Backend

Todas estas validaciones del frontend son complementarias a las del backend:

**Backend (`chatbot/security.py`):**
- Rate limiting (30 mensajes/5min por IP)
- Rate limiting DNI (10 intentos/10min)
- Sanitización de todos los inputs
- Validación estricta de datos

**Frontend (`lib/validations.ts`):**
- Validación inmediata (mejor UX)
- Feedback visual en tiempo real
- Prevención de envíos inválidos
- Reducción de carga en el backend

## Mejoras Futuras

- [ ] Validación de RUC para empresas
- [ ] Autocompletado de direcciones
- [ ] Validación de números internacionales con códigos de país
- [ ] Sugerencias de dominios de email comunes (@gmail.com, etc.)
- [ ] Validación de tarjetas de crédito para pagos
- [ ] Verificación de código postal

## Testing

Para probar las validaciones:

1. **DNI válido**: `12345678` ✅
2. **DNI inválido**: `123` ❌
3. **Email válido**: `test@correo.com` ✅
4. **Email inválido**: `test@` ❌
5. **Celular válido**: `987654321` ✅
6. **Celular inválido**: `123` ❌
7. **Nombre válido**: `Juan Carlos` ✅
8. **Nombre inválido**: `Juan123` ❌

## Notas Importantes

⚠️ **Nunca confíes solo en validaciones del frontend**
- El frontend puede ser bypasseado
- Siempre valida en el backend también
- Usa validaciones del frontend solo para mejorar UX

✅ **Principio de defensa en profundidad**
- Frontend: Validación rápida + UX mejorada
- Backend: Validación estricta + Seguridad real
- Base de datos: Constraints + Integridad de datos
