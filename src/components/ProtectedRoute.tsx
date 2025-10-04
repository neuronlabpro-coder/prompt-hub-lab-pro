import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from './Router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (loading) return;

    // Si requiere autenticación y no hay usuario
    if (requireAuth && !user) {
      console.log('Redirigiendo a login: usuario no autenticado');
      navigate(redirectTo);
      return;
    }

    // Si requiere admin y el usuario no es admin/superadmin
    if (requireAdmin && user) {
      const userRole = user.user_metadata?.role || 'user';
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        console.log('Redirigiendo a home: usuario sin permisos de admin');
        navigate('/');
        return;
      }
    }
  }, [user, loading, requireAuth, requireAdmin, navigate, redirectTo]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth y no hay usuario, no mostrar nada (ya redirigió)
  if (requireAuth && !user) {
    return null;
  }

  // Si requiere admin y no tiene permisos, no mostrar nada (ya redirigió)
  if (requireAdmin && user) {
    const userRole = user.user_metadata?.role || 'user';
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return null;
    }
  }

  return <>{children}</>;
}
