import { siteConfig } from "@/config";
import { useAuthStore } from "@/store/authStore";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import type { InternalAxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";

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

// Evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { tokens, setTokens } = useAuthStore.getState();
    if (!tokens.access) return config;

    // Si el token está expirado y hay refresh, refresca solo una vez
    if (isTokenExpired(tokens.access) && tokens.refresh) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios
          .post(`${siteConfig.backend_url}/api/token/refresh/`, {
            refresh: tokens.refresh,
          })
          .then((refreshResponse) => {
            setTokens(refreshResponse.data.access as string, tokens.refresh!);
            return refreshResponse.data.access as string;
          })
          .catch(() => {
            handleLogout();
            // Nunca retornamos null, lanzamos para forzar el catch externo
            throw new Error("Refresh token failed");
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      try {
        const newAccess = await refreshPromise;
        config.headers.Authorization = `Bearer ${newAccess}`;
      } catch {
        // handleLogout ya fue llamado en el catch interno
      }
      return config;
    }
    // Si el token es válido
    config.headers.Authorization = `Bearer ${tokens.access}`;
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
