"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'doctor' | 'paciente')[];
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAdmin, isDoctor, isPaciente } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const hasPermission = allowedRoles.some(role => {
      if (role === 'admin') return isAdmin();
      if (role === 'doctor') return isDoctor();
      if (role === 'paciente') return isPaciente();
      return false;
    });

    if (!hasPermission) {
      toast.error('No tienes permisos para acceder a esta página');
      router.replace(redirectTo);
    }
  }, [user, allowedRoles, isAdmin, isDoctor, isPaciente, router, redirectTo]);

  // Si no hay usuario o no tiene permisos, no renderizar nada
  if (!user) return null;

  const hasPermission = allowedRoles.some(role => {
    if (role === 'admin') return isAdmin();
    if (role === 'doctor') return isDoctor();
    if (role === 'paciente') return isPaciente();
    return false;
  });

  if (!hasPermission) return null;

  return <>{children}</>;
}
