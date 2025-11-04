"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'doctor' | 'paciente')[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard',
  showAccessDenied = true 
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAdmin, isDoctor, isPaciente } = useAuthStore();

  // Si no hay usuario, redirigir al login
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, router]);

  // Si no hay usuario, mostrar loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar permisos
  const hasPermission = allowedRoles.some(role => {
    if (role === 'admin') return isAdmin();
    if (role === 'doctor') return isDoctor();
    if (role === 'paciente') return isPaciente();
    return false;
  });

  // Si no tiene permisos, mostrar mensaje amigable (SIN redirigir)
  if (!hasPermission) {
    console.log('🚫 RoleGuard: Sin permisos. Mostrando mensaje (NO redirigiendo)');
    if (!showAccessDenied) return null;

    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              No tienes los permisos necesarios para acceder a esta sección.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Esta página está disponible solo para: {' '}
                <span className="font-semibold text-foreground">
                  {allowedRoles.map(role => {
                    if (role === 'admin') return 'Administradores';
                    if (role === 'doctor') return 'Doctores';
                    if (role === 'paciente') return 'Pacientes';
                    return role;
                  }).join(', ')}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
