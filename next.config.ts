import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar errores de ESLint durante el build (solo para Vercel)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build si es necesario
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medisol-health.onrender.com',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'medisol-health.onrender.com',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // Agregar tu nuevo backend
      {
        protocol: 'http',
        hostname: '170.81.242.107',
        port: '9091',
        pathname: '/media/**',
      },
    ],
  },
  // Permitir contenido mixto HTTPS -> HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:; connect-src 'self' http://170.81.242.107:9091 ws://170.81.242.107:9091 https:; img-src 'self' data: blob: http: https:;"
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;