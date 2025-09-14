// Configuración de la aplicación PromptHub
export const config = {
  // Desactivar Supabase y usar backend local
  DISABLE_SUPABASE: true,
  
  // URLs del backend
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Rutas especiales
  ADMIN_ROUTE: '/admin/dashboard',
  
  // Configuración de autenticación
  AUTH_ENABLED: false, // Por ahora deshabilitamos la auth hasta configurar el flujo completo
  
  // Mock data para desarrollo
  USE_MOCK_DATA: true,
  
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