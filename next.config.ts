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
    ],
  },
};

export default nextConfig;
