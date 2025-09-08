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

// Utilidad para verificar si un token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch {
    return true;
  }
};

// Función para manejar el cierre de sesión
const handleLogout = () => {
  useAuthStore.getState().clearTokens();
  redirect("/iniciar-sesion");
};

// Configuración de interceptores para API REST
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { tokens, setTokens } = useAuthStore.getState();
    
    // Si no hay token, no agregamos nada
    if (!tokens.access) return config;

    // Si el token está expirado, intentamos refrescarlo
    if (isTokenExpired(tokens.access) && tokens.refresh) {
      try {
        const { data } = await axios.post(`${siteConfig.backend_url}/token/refresh/`, {
          refresh: tokens.refresh,
        });
        setTokens(data.access, tokens.refresh);
        config.headers.Authorization = `Bearer ${data.access}`;
      } catch (error) {
        handleLogout();
        return Promise.reject(error);
      }
    } else {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
