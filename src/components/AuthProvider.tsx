import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isTestMode } from '../lib/testAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MODO DE PRUEBA: Cargar sesión local
    if (isTestMode()) {
      const testSession = localStorage.getItem('test-session');
      if (testSession) {
        try {
          const session = JSON.parse(testSession);
          setUser(session.user as User);
        } catch (e) {
          console.error('Error loading test session:', e);
        }
      }
      setLoading(false);
      return;
    }

    // MODO PRODUCCIÓN: Usar Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getToken = async (): Promise<string | null> => {
    if (isTestMode()) {
      // En modo de prueba, usar el user.id como token
      return user?.id || null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const signOut = async () => {
    if (isTestMode()) {
      localStorage.removeItem('test-session');
      setUser(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}