import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { authenticateTestUser, isTestMode } from '../lib/testAuth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Zap, Mail, Lock, AlertCircle, Github, Info } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión con Google');
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión con GitHub');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // MODO DE PRUEBA: Autenticación local para testing
      if (isTestMode()) {
        const testAuth = authenticateTestUser(email, password);
        
        if (testAuth) {
          // Simular sesión de Supabase con usuario de prueba
          localStorage.setItem('test-session', JSON.stringify(testAuth.session));
          
          // Redirigir según el rol del usuario
          const role = testAuth.session.user.user_metadata?.role;
          if (role === 'superadmin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/dashboard';
          }
          return;
        } else {
          throw new Error('Credenciales incorrectas. Usa uno de los usuarios de prueba.');
        }
      }

      // MODO PRODUCCIÓN: Autenticación real con Supabase
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setError('Por favor verifica tu email para completar el registro');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            {isSignUp 
              ? 'Únete a PromptHub v2 y optimiza tus prompts de IA'
              : 'Accede a tu biblioteca de prompts'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google OAuth Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full mb-3 bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
            data-testid="button-google-login"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          {/* GitHub OAuth Button */}
          <Button
            type="button"
            onClick={handleGitHubLogin}
            variant="outline"
            className="w-full mb-4 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
            data-testid="button-github-login"
          >
            <Github className="h-5 w-5 mr-2" />
            Continuar con GitHub
          </Button>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">O continúa con email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </div>
              ) : (
                isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {isSignUp 
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate'
                }
              </button>
            </div>
          </form>

          {/* Test Users Helper - Solo en modo desarrollo */}
          {isTestMode() && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300 font-semibold">
                  Modo Prueba - Login Rápido
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Superadmin */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('superadmin@prompthub.com');
                    setPassword('Admin123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('superadmin@prompthub.com', 'Admin123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/admin/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-sm text-red-300 transition-colors"
                  data-testid="quick-login-superadmin"
                >
                  <span className="font-medium">🛡️ Superadmin</span>
                  <span className="text-xs opacity-75">Admin123!</span>
                </button>

                {/* Usuario Pro */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('usuario.pro@test.com');
                    setPassword('Pro123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('usuario.pro@test.com', 'Pro123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded text-sm text-purple-300 transition-colors"
                  data-testid="quick-login-pro"
                >
                  <span className="font-medium">👤 Usuario Pro</span>
                  <span className="text-xs opacity-75">Pro123!</span>
                </button>

                {/* Usuario Starter */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('usuario.free@test.com');
                    setPassword('Starter123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('usuario.free@test.com', 'Starter123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded text-sm text-green-300 transition-colors"
                  data-testid="quick-login-starter"
                >
                  <span className="font-medium">🌱 Usuario Starter</span>
                  <span className="text-xs opacity-75">Starter123!</span>
                </button>

                {/* Usuario Enterprise */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('usuario.enterprise@test.com');
                    setPassword('Enterprise123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('usuario.enterprise@test.com', 'Enterprise123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 rounded text-sm text-yellow-300 transition-colors"
                  data-testid="quick-login-enterprise"
                >
                  <span className="font-medium">💼 Usuario Enterprise</span>
                  <span className="text-xs opacity-75">Enterprise123!</span>
                </button>

                {/* Empresa 1 */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('empresa1@corp.com');
                    setPassword('Empresa123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('empresa1@corp.com', 'Empresa123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded text-sm text-blue-300 transition-colors"
                  data-testid="quick-login-empresa1"
                >
                  <span className="font-medium">🏢 Admin Empresa 1</span>
                  <span className="text-xs opacity-75">Empresa123!</span>
                </button>

                {/* Empresa 2 */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('empresa2@corp.com');
                    setPassword('Empresa123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('empresa2@corp.com', 'Empresa123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded text-sm text-blue-300 transition-colors"
                  data-testid="quick-login-empresa2"
                >
                  <span className="font-medium">🏢 Admin Empresa 2</span>
                  <span className="text-xs opacity-75">Empresa123!</span>
                </button>

                {/* Empresa 3 */}
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('empresa3@corp.com');
                    setPassword('Empresa123!');
                    setError(null);
                    setLoading(true);
                    const testAuth = authenticateTestUser('empresa3@corp.com', 'Empresa123!');
                    if (testAuth) {
                      localStorage.setItem('test-session', JSON.stringify(testAuth.session));
                      window.location.href = '/dashboard';
                    }
                    setLoading(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded text-sm text-blue-300 transition-colors"
                  data-testid="quick-login-empresa3"
                >
                  <span className="font-medium">🏢 Admin Empresa 3</span>
                  <span className="text-xs opacity-75">Empresa123!</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}