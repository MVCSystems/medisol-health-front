import { siteConfig } from '@/config'

/**
 * Construye una URL completa para imágenes del backend
 * @param imagePath - Ruta de la imagen (puede ser relativa o absoluta)
 * @returns URL completa de la imagen
 */
export const buildImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null
  
  // Si ya es una URL completa, forzar HTTPS para Render
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Forzar HTTPS si es una URL de Render con HTTP
    if (imagePath.startsWith('http://') && imagePath.includes('onrender.com')) {
      return imagePath.replace('http://', 'https://')
    }
    return imagePath
  }
  
  // Si es una ruta relativa, construir la URL completa con HTTPS
  const baseUrl = siteConfig.backend_url
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${baseUrl}${cleanPath}`
}

/**
 * Maneja errores de carga de imágenes
 * @param element - Elemento de imagen que falló
 * @param fallbackSrc - URL de imagen de respaldo opcional
 */
export const handleImageError = (
  element: HTMLImageElement, 
  fallbackSrc?: string
) => {
  if (fallbackSrc) {
    element.src = fallbackSrc
  } else {
    // Ocultar la imagen si no hay fallback
    element.style.display = 'none'
  }
}