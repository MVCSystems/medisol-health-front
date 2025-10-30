import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignora errores de ESLint durante el build (opcional)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mantiene verificación de TypeScript
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      // Servidor local
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      // Tu backend productivo en Nginx
      {
        protocol: "https",
        hostname: "apis.ntechs.net.pe",
        pathname: "/media/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
              connect-src 'self' https://apis.ntechs.net.pe wss://apis.ntechs.net.pe;
              img-src 'self' data: blob: https:;
              frame-src 'self';
            `.replace(/\s{2,}/g, " "), // compacta espacios
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
