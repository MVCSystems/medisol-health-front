import { siteConfig } from "@/config";
import { useAuthStore } from "@/store/authStore";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import type { InternalAxiosRequestConfig } from "axios";

// Configuración de API REST
const api = axios.create({
  baseURL: siteConfig.backend_url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requests


// Utilidad para verificar si un token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch {
    return true;
  }
};

// Función para manejar el cierre de sesión
const handleLogout = () => {
  useAuthStore.getState().logout();
  redirect("/auth/login");
};

// Configuración de interceptores para API REST
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { tokens, setTokens } = useAuthStore.getState();
    
    console.log('🚀 Haciendo petición a:', config.url);
    console.log('Con parámetros:', config.params);
    
    // Si no hay token, no agregamos nada
    if (!tokens.access) {
      console.log('❌ No hay token de acceso');
      return config;
    }

    // Si el token está expirado, intentamos refrescarlo
    if (isTokenExpired(tokens.access) && tokens.refresh) {
      console.log('🔄 Token expirado, intentando refrescar...');
      try {
        const refreshResponse = await axios.post(`${siteConfig.backend_url}/api/token/refresh/`, {
          refresh: tokens.refresh,
        });
        setTokens(refreshResponse.data.access, tokens.refresh);
        config.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        console.log('✅ Token refrescado exitosamente');
      } catch (error) {
        console.error('❌ Error al refrescar token:', error);
        handleLogout();
        return Promise.reject(error);
      }
    } else {
      config.headers.Authorization = `Bearer ${tokens.access}`;
      console.log('✅ Token válido agregado a la petición');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida de:', response.config.url);
    console.log('📦 Datos:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error en la petición:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔒 Error de autenticación, redirigiendo a login...');
      handleLogout();
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

// Utilidad para obtener datos mediante SWR
const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

export { api, fetcher };
