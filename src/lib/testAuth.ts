// Sistema de autenticación de prueba
// SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN

export const TEST_USERS = {
  superadmin: {
    email: 'superadmin@prompthub.com',
    password: 'Admin123!',
    id: 'test-superadmin-001',
    user_metadata: {
      name: 'Super Admin',
      role: 'superadmin',
      plan: 'enterprise'
    }
  },
  starter: {
    email: 'usuario.free@test.com',
    password: 'Starter123!',
    id: 'test-starter-001',
    user_metadata: {
      name: 'Usuario Starter',
      role: 'user',
      plan: 'starter'
    }
  },
  pro: {
    email: 'usuario.pro@test.com',
    password: 'Pro123!',
    id: 'test-pro-001',
    user_metadata: {
      name: 'Usuario Pro',
      role: 'user',
      plan: 'pro'
    }
  },
  enterprise: {
    email: 'usuario.enterprise@test.com',
    password: 'Enterprise123!',
    id: 'test-enterprise-001',
    user_metadata: {
      name: 'Usuario Enterprise',
      role: 'user',
      plan: 'enterprise'
    }
  },
  empresa1: {
    email: 'empresa1@corp.com',
    password: 'Empresa123!',
    id: 'test-empresa1-001',
    user_metadata: {
      name: 'Admin Empresa 1',
      role: 'admin',
      plan: 'enterprise'
    }
  },
  empresa2: {
    email: 'empresa2@corp.com',
    password: 'Empresa123!',
    id: 'test-empresa2-001',
    user_metadata: {
      name: 'Admin Empresa 2',
      role: 'admin',
      plan: 'enterprise'
    }
  },
  empresa3: {
    email: 'empresa3@corp.com',
    password: 'Empresa123!',
    id: 'test-empresa3-001',
    user_metadata: {
      name: 'Admin Empresa 3',
      role: 'admin',
      plan: 'enterprise'
    }
  }
};

export function authenticateTestUser(email: string, password: string) {
  const user = Object.values(TEST_USERS).find(
    u => u.email === email && u.password === password
  );

  if (user) {
    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        aud: 'authenticated',
        created_at: new Date().toISOString()
      },
      session: {
        access_token: 'test-token-' + user.id,
        refresh_token: 'test-refresh-' + user.id,
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        }
      }
    };
  }

  return null;
}

export const isTestMode = () => {
  return import.meta.env.DEV || localStorage.getItem('USE_TEST_AUTH') === 'true';
};
