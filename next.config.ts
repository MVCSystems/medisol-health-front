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
    key: 'Content-Security-Policy',
    value: `
      default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:;
      connect-src 'self' https://apis.ntechs.net.pe/medisol wss://apis.ntechs.net.pe/medisol https:;
      img-src 'self' data: blob: http: https:;
      frame-src 'self' https://www.google.com https://www.youtube.com https://player.vimeo.com;
    `.replace(/\s{2,}/g, ' '),
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
],
      },
    ];
  },
};

export default nextConfig;
