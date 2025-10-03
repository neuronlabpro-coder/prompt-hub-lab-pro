// Configuración de la aplicación PromptHub
export const config = {
  // Usar Supabase como base de datos principal
  DISABLE_SUPABASE: false,
  
  // URLs del backend
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Rutas especiales
  ADMIN_ROUTE: '/admin/dashboard',
  
  // Configuración de autenticación
  AUTH_ENABLED: true,
  
  // No usar mock data - usar datos reales de Supabase
  USE_MOCK_DATA: false,
  
  // Configuración de Stripe (para el flujo de pago)
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  
  // Configuración de desarrollo
  IS_DEVELOPMENT: import.meta.env.DEV,
};

// Función para verificar si estamos en modo desarrollo
export const isDevelopment = () => config.IS_DEVELOPMENT;

// Función para verificar si Supabase está deshabilitado
export const isSupabaseDisabled = () => config.DISABLE_SUPABASE;

// Función para obtener la URL base de la API
export const getApiUrl = () => config.API_BASE_URL;