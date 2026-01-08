import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { LandingPage } from './components/LandingPage';
import { Router, useRouter } from './components/Router';
import { usePrompts, useCategories, useProviders } from './hooks/useSupabase';
import { useAdminUsers, useAdminPlans } from './hooks/useAdminData';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserManagement } from './components/admin/UserManagement';
import { AdminAccessBanner } from './components/AdminAccessBanner';
import { PlanManagement } from './components/admin/PlanManagement';
import { PromptManagement } from './components/admin/PromptManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { ProviderManagement } from './components/admin/ProviderManagement';
import { VariableManagement } from './components/admin/VariableManagement';
import { SubcategoryManagement } from './components/admin/SubcategoryManagement';
import { EnhancedDashboard } from './components/admin/EnhancedDashboard';
import { CouponManagement } from './components/admin/CouponManagement';
import { AffiliateManagement } from './components/admin/AffiliateManagement';
import { AuditLogs } from './components/admin/AuditLogs';
import { SystemSettings } from './components/admin/SystemSettings';
import { TokenPricing } from './components/admin/TokenPricing';
import { BillingReports } from './components/admin/BillingReports';
import { Filters } from './components/Filters';
import { PromptCard } from './components/PromptCard';
import { PromptModal } from './components/PromptModal';
import { CreatePromptModal } from './components/CreatePromptModal';
import { Playground } from './components/Playground';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { Pagination } from './components/Pagination';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { TokenWarningModal } from './components/TokenWarningModal';
import { TokenUsageModal } from './components/TokenUsageModal';
import { TokenPromotions } from './components/admin/TokenPromotions';
import { OrganizationPlanManagement } from './components/admin/OrganizationPlanManagement';
import { ReferralSettings } from './components/admin/ReferralSettings';
import { ProductManagement } from './components/admin/ProductManagement';
import { SupportTickets } from './components/admin/SupportTickets';
import { EmailTemplates } from './components/admin/EmailTemplates';
import { UserProfile } from './components/UserProfile';
import { Marketplace } from './components/Marketplace';
import { SupportCenter } from './components/SupportCenter';
import MarketplacePage from './pages/MarketplacePage';
import MyPurchasedPrompts from './pages/MyPurchasedPrompts';
import Subscribe from './pages/Subscribe';
import { User, Plan, Coupon, Affiliate, Role, TokenPromotion, OrganizationPlan, Prompt, EmailTemplate, SupportTicket, SupportResponse } from './types';

function AppContent() {
  const { user, loading: authLoading, getToken } = useAuth();
  const { toasts, removeToast, toast } = useToast();
  const { prompts, loading: promptsLoading, improvePrompt, translatePrompt, incrementStat, toggleFavorite } = usePrompts();
  const { categories } = useCategories();
  const { providers } = useProviders();
  const { currentPath, navigate } = useRouter();
  
  // Landing page is disabled for now - direct to login
  // const [showLanding, setShowLanding] = useState(!user);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [historyPrompt, setHistoryPrompt] = useState<Prompt | null>(null);
  const [playgroundPrompt, setPlaygroundPrompt] = useState('');
  const [currentView, setCurrentView] = useState<'prompts' | 'dashboard'>('prompts');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');
  
  // Token warning modal
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [showTokenUsage, setShowTokenUsage] = useState(false);
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Admin data state - TEMPORALMENTE DESHABILITADO (Supabase tables not ready)
  // TODO: Re-enable when Supabase migration is executed
  const adminUsers: any[] = [];
  const reloadUsers = () => Promise.resolve();
  const adminPlans: Plan[] = [];
  const reloadPlans = () => Promise.resolve();
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [adminAffiliates, setAdminAffiliates] = useState<Affiliate[]>([]);
  const [adminPromotions, setAdminPromotions] = useState<TokenPromotion[]>([]);
  const [adminOrgPlans, setAdminOrgPlans] = useState<OrganizationPlan[]>([]);
  const [adminSupportTickets, setAdminSupportTickets] = useState<SupportTicket[]>([]);
  const [adminSupportUsers, setAdminSupportUsers] = useState<any[]>([]);
  const [adminSupportLoading, setAdminSupportLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailTemplatesLoading, setEmailTemplatesLoading] = useState(false);

  // Check if user is admin - MUST be defined before using in JSX
  const isUserAdmin = user?.user_metadata?.role === 'superadmin' || user?.user_metadata?.role === 'admin';

  const loadAdminSupportTickets = React.useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setAdminSupportLoading(true);
    try {
      const response = await fetch('/api/support/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudieron cargar los tickets');
      }

      const tickets = (data.data || []) as SupportTicket[];
      setAdminSupportTickets(tickets);

      const userMap = new Map();
      (data.data || []).forEach((ticket: any) => {
        const userInfo = ticket.users;
        if (!userInfo) return;
        const name = userInfo.name || userInfo.full_name || 'Usuario';
        userMap.set(userInfo.id, { id: userInfo.id, name, email: userInfo.email || '' });
      });
      setAdminSupportUsers(Array.from(userMap.values()));
    } catch (error: any) {
      console.error('Admin support load error:', error);
      toast.error('Error', error.message || 'No se pudieron cargar los tickets');
    } finally {
      setAdminSupportLoading(false);
    }
  }, [getToken, toast]);

  const handleAdminUpdateTicket = React.useCallback(async (ticketId: string, updates: Partial<SupportTicket>) => {
    const token = await getToken();
    if (!token) return;
    try {
      const response = await fetch(`/api/support/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo actualizar el ticket');
      }
      await loadAdminSupportTickets();
    } catch (error: any) {
      console.error('Admin support update error:', error);
      toast.error('Error', error.message || 'No se pudo actualizar el ticket');
    }
  }, [getToken, loadAdminSupportTickets, toast]);

  const handleAdminAddResponse = React.useCallback(async (ticketId: string, response: Omit<SupportResponse, 'id' | 'created_at'>) => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: response.message, is_internal: response.is_internal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar la respuesta');
      }
      await loadAdminSupportTickets();
    } catch (error: any) {
      console.error('Admin support reply error:', error);
      toast.error('Error', error.message || 'No se pudo enviar la respuesta');
    }
  }, [getToken, loadAdminSupportTickets, toast]);

  const loadEmailTemplates = React.useCallback(async () => {
    setEmailTemplatesLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmailTemplates((data || []) as EmailTemplate[]);
    } catch (error: any) {
      console.error('Email templates load error:', error);
      toast.error('Error', error.message || 'No se pudieron cargar las plantillas');
      setEmailTemplates([]);
    } finally {
      setEmailTemplatesLoading(false);
    }
  }, [toast]);

  const handleCreateEmailTemplate = React.useCallback(async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([template])
        .select()
        .single();
      if (error) throw error;
      setEmailTemplates(prev => [data as EmailTemplate, ...prev]);
    } catch (error: any) {
      console.error('Email template create error:', error);
      toast.error('Error', error.message || 'No se pudo crear la plantilla');
    }
  }, [toast]);

  const handleUpdateEmailTemplate = React.useCallback(async (templateId: string, updates: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();
      if (error) throw error;
      setEmailTemplates(prev => prev.map(t => (t.id === templateId ? (data as EmailTemplate) : t)));
    } catch (error: any) {
      console.error('Email template update error:', error);
      toast.error('Error', error.message || 'No se pudo actualizar la plantilla');
    }
  }, [toast]);

  const handleDeleteEmailTemplate = React.useCallback(async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
      setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error: any) {
      console.error('Email template delete error:', error);
      toast.error('Error', error.message || 'No se pudo eliminar la plantilla');
    }
  }, [toast]);

  const handleTestEmailTemplate = React.useCallback(async (templateId: string) => {
    if (!user?.email) {
      toast.error('Error', 'No se encontró email del usuario');
      return;
    }
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          template_id: templateId,
          variables: {},
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar el email');
      }
      toast.success('Email enviado', 'Se envió un email de prueba');
    } catch (error: any) {
      console.error('Email template test error:', error);
      toast.error('Error', error.message || 'No se pudo enviar el email');
    }
  }, [toast, user?.email]);

  // Admin mode toggle
  const toggleAdminMode = () => {
    if (isUserAdmin) {
      setIsAdminMode(!isAdminMode);
      if (!isAdminMode) {
        toast.success('Modo Admin activado', 'Acceso al panel de administración');
      }
    } else {
      toast.error('Acceso denegado', 'No tienes permisos de administrador');
    }
  };

  React.useEffect(() => {
    if (!isAdminMode || adminView !== 'support') return;
    loadAdminSupportTickets();
  }, [isAdminMode, adminView, loadAdminSupportTickets]);

  React.useEffect(() => {
    if (!isAdminMode || adminView !== 'emails') return;
    loadEmailTemplates();
  }, [isAdminMode, adminView, loadEmailTemplates]);

  // Check for token usage warning
  React.useEffect(() => {
    if (user) {
      const mockUser = {
        tokensUsed: 750000,
        tokensLimit: 2000000,
      };
      const usagePercent = (mockUser.tokensUsed / mockUser.tokensLimit) * 100;
      
      // Check for active promotions that should trigger popup
      const activePromotion = adminPromotions.find(p => 
        p.active && p.show_popup && (
          p.popup_trigger === 'always' ||
          (p.popup_trigger === 'usage_threshold' && usagePercent >= (p.usage_threshold || 75))
        )
      );
      
      // Show warning/promotion popup
      if (activePromotion || usagePercent >= 75) {
        const lastWarningShown = localStorage.getItem('lastTokenWarning');
        const now = Date.now();
        const frequency = activePromotion?.popup_frequency_hours || 1;
        const frequencyMs = frequency * 60 * 60 * 1000;
        
        if (!lastWarningShown || now - parseInt(lastWarningShown) > frequencyMs) {
          setTimeout(() => {
            setShowTokenWarning(true);
            localStorage.setItem('lastTokenWarning', now.toString());
          }, 2000); // Show after 2 seconds
        }
      }
    }
  }, [user, adminPromotions]);

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(prompt => prompt.is_favorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.stats.ctr - a.stats.ctr;
        case 'copies':
          return b.stats.copies - a.stats.copies;
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'visits':
          return b.stats.visits - a.stats.visits;
        case 'ctr':
          return b.stats.ctr - a.stats.ctr;
        default:
          return 0;
      }
    });

    return filtered;
  }, [prompts, searchTerm, selectedCategory, sortBy, showFavoritesOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrompts = filteredAndSortedPrompts.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, showFavoritesOnly, itemsPerPage]);

  // Manejar rutas especiales - Acceso directo al admin
  React.useEffect(() => {
    if (currentPath === '/admin/dashboard' || currentPath.startsWith('/admin')) {
      // Solo usuarios autenticados con rol superadmin o admin pueden acceder
      if (user && (user.user_metadata?.role === 'superadmin' || user.user_metadata?.role === 'admin')) {
        setIsAdminMode(true);
      } else if (!authLoading) {
        // Redirigir a login si no está autenticado o no tiene permisos
        setIsAdminMode(false);
        navigate('/login');
      }
    }
  }, [currentPath, user, authLoading, navigate]);

  // Redirect to login if trying to access checkout without auth
  React.useEffect(() => {
    if (currentPath === '/checkout' && !user && !authLoading) {
      navigate('/login');
    }
  }, [currentPath, user, authLoading, navigate]);

  // Show login form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user wants to see it
  if (!user && currentPath === '/') {
    return (
      <LandingPage
        onGetStarted={() => {
          navigate('/login');
        }}
        onContactSales={() => {
          toast.info('Contacto de ventas', 'Redirigiendo a nuestro equipo de ventas');
        }}
      />
    );
  }

  if (!user && (currentPath === '/login' || currentPath === '/register')) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700"
          >
            ← Volver a Landing
          </button>
        </div>
        <LoginForm />
      </div>
    );
  }

  // Show subscription page (NO AUTH REQUIRED - pago primero, registro después)
  if (currentPath === '/subscribe' || currentPath.startsWith('/subscribe?')) {
    return <Subscribe />;
  }

  // Show subscription success page (after payment)
  if (currentPath === '/subscription-success' || currentPath.startsWith('/subscription-success?')) {
    // TODO: Create subscription success page with auto-registration
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-green-400 mb-4">¡Pago Exitoso!</h1>
          <p className="text-gray-300 mb-6">
            Tu suscripción ha sido procesada. Estamos creando tu cuenta...
          </p>
          <Button onClick={() => navigate('/login')}>Continuar al Login</Button>
        </div>
      </div>
    );
  }

  // Show user profile page
  if (currentPath === '/profile' && user) {
    return <UserProfile user={user} onClose={() => navigate('/')} />;
  }

  // Show marketplace
  if (currentPath === '/marketplace') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          onNewPrompt={() => navigate('/')}
          onOpenPlayground={() => setIsPlaygroundOpen(true)}
          onOpenDashboard={() => {
            navigate('/');
            setCurrentView('dashboard');
          }}
          onOpenMarketplace={() => navigate('/marketplace')}
          onOpenSupport={() => navigate('/soporte')}
          onOpenProfile={() => navigate('/profile')}
          currentView="marketplace"
          onToggleAdmin={toggleAdminMode}
          isAdmin={isUserAdmin}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Marketplace />
        </div>
      </div>
    );
  }

  // Show support center
  if (currentPath === '/soporte') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          onNewPrompt={() => navigate('/')}
          onOpenPlayground={() => setIsPlaygroundOpen(true)}
          onOpenDashboard={() => {
            navigate('/');
            setCurrentView('dashboard');
          }}
          onOpenMarketplace={() => navigate('/marketplace')}
          onOpenSupport={() => navigate('/soporte')}
          onOpenProfile={() => navigate('/profile')}
          currentView="soporte"
          onToggleAdmin={toggleAdminMode}
          isAdmin={isUserAdmin}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SupportCenter />
        </div>
      </div>
    );
  }

  // Show checkout page
  if (currentPath === '/checkout') {
    if (!user) {
      return null; // Will redirect via useEffect
    }
    return <Checkout />;
  }

  if (promptsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando prompts...</p>
        </div>
      </div>
    );
  }

  const handleViewPrompt = (prompt: Prompt) => {
    // Update view count via Supabase
    incrementStat(prompt.id, 'visits');
    
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    // Copy to clipboard
    await navigator.clipboard.writeText(prompt.content_es);
    
    // Update copy count via Supabase
    incrementStat(prompt.id, 'copies');
  };

  const handleImprovePrompt = async (prompt: Prompt) => {
    setImprovementPrompt(prompt);
    setIsImprovementPreviewOpen(true);
  };

  const handleTranslatePrompt = async (prompt: Prompt, language: 'es' | 'en') => {
    try {
      await translatePrompt(prompt.id, language);
      const targetLang = language === 'es' ? 'español' : 'inglés';
      toast.success('Traducción completada', `Prompt traducido a ${targetLang} exitosamente`);
    } catch (error) {
      toast.error('Error de traducción', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      await toggleFavorite(prompt.id);
      toast.success('Favorito actualizado', prompt.is_favorite ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    } catch (error) {
      toast.error('Error al actualizar favorito', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleViewHistory = (prompt: Prompt) => {
    setHistoryPrompt(prompt);
    setIsVersionHistoryOpen(true);
  };

  const handleRestoreVersion = async (prompt: Prompt, version: any) => {
    // In a real app, this would update the prompt in Supabase
    console.log('Restoring version:', { promptId: prompt.id, version: version.version });
    toast.success('Versión restaurada', `Versión ${version.version} restaurada exitosamente`);
    
    // Here you would typically:
    // 1. Update the prompt content with the version content
    // 2. Create a new version entry
    // 3. Refresh the prompts list
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('trending');
    setCurrentPage(1);
    setShowFavoritesOnly(false);
  };

  const handleNewPrompt = () => {
    setCurrentView('prompts');
    setIsCreateModalOpen(true);
  };

  // Admin handlers
  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    toast.info('Función en desarrollo', 'La edición de usuarios estará disponible pronto');
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    // TODO: Implement delete user API call
    reloadUsers();
    toast.success('Usuario eliminado', 'El usuario ha sido eliminado del sistema');
  };

  const handleChangeRole = (userId: string, role: Role) => {
    console.log('Change role:', { userId, role });
    // TODO: Implement change role API call
    reloadUsers();
    toast.success('Rol actualizado', `Rol cambiado a ${role} exitosamente`);
  };

  const handleBanUser = (userId: string) => {
    console.log('Ban user:', userId);
    toast.warning('Usuario suspendido', 'El usuario ha sido suspendido temporalmente');
  };

  const handleAccessAsUser = (userId: string) => {
    const targetUser = adminUsers.find(u => u.id === userId);
    if (targetUser && user) {
      sessionStorage.setItem('adminAccessingAs', userId);
      sessionStorage.setItem('originalAdminId', user.id || '');
      toast.success('Acceso como usuario', `Ahora estás viendo como ${targetUser.name}`);
      navigate('/');
    }
  };

  const handleBackToAdmin = () => {
    sessionStorage.removeItem('adminAccessingAs');
    sessionStorage.removeItem('originalAdminId');
    toast.info('Volver a Admin', 'Has vuelto al panel de administración');
    navigate('/admin/dashboard');
  };

  const accessingAsUserId = sessionStorage.getItem('adminAccessingAs');
  const accessingAsUser = accessingAsUserId ? adminUsers.find(u => u.id === accessingAsUserId) : null;

  const handleCreatePlan = (plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Create plan:', plan);
    // TODO: Implement create plan API call
    reloadPlans();
    toast.success('Plan creado', `Plan "${plan.name}" creado exitosamente`);
  };

  const handleUpdatePlan = (planId: string, updates: Partial<Plan>) => {
    console.log('Update plan:', { planId, updates });
    // TODO: Implement update plan API call
    reloadPlans();
    toast.success('Plan actualizado', 'Los cambios han sido guardados');
  };

  const handleDeletePlan = (planId: string) => {
    console.log('Delete plan:', planId);
    // TODO: Implement delete plan API call
    reloadPlans();
    toast.success('Plan eliminado', 'El plan ha sido eliminado del sistema');
  };

  const handleCreateProvider = (provider: any) => {
    console.log('Create provider:', provider);
    toast.success('Proveedor creado', `Proveedor "${provider.name}" creado exitosamente`);
  };

  const handleUpdateProvider = (providerId: string, updates: any) => {
    console.log('Update provider:', { providerId, updates });
    toast.success('Proveedor actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteProvider = (providerId: string) => {
    console.log('Delete provider:', providerId);
    toast.success('Proveedor eliminado', 'El proveedor ha sido eliminado del sistema');
  };

  const handleCreateModel = (providerId: string, model: any) => {
    console.log('Create model:', { providerId, model });
    toast.success('Modelo añadido', `Modelo "${model.name}" añadido exitosamente`);
  };

  const handleUpdateModel = (modelId: string, updates: any) => {
    console.log('Update model:', { modelId, updates });
    toast.success('Modelo actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteModel = (modelId: string) => {
    console.log('Delete model:', modelId);
    toast.success('Modelo eliminado', 'El modelo ha sido eliminado del sistema');
  };

  const handleCreateCoupon = (coupon: Omit<Coupon, 'id' | 'created_at'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coupon_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAdminCoupons(prev => [...prev, newCoupon]);
    toast.success('Cupón creado', `Cupón "${coupon.code}" creado exitosamente`);
  };

  const handleUpdateCoupon = (couponId: string, updates: Partial<Coupon>) => {
    setAdminCoupons(prev => prev.map(c => c.id === couponId ? { ...c, ...updates } : c));
    toast.success('Cupón actualizado', 'Los cambios han sido guardados');
  };

  const handleDeleteCoupon = (couponId: string) => {
    setAdminCoupons(prev => prev.filter(c => c.id !== couponId));
    toast.success('Cupón eliminado', 'El cupón ha sido eliminado del sistema');
  };

  const handleUpdateAffiliate = (affiliateId: string, updates: Partial<Affiliate>) => {
    setAdminAffiliates(prev => prev.map(a => a.id === affiliateId ? { ...a, ...updates } : a));
    toast.success('Afiliado actualizado', 'Los cambios han sido guardados');
  };

  const handleCreatePromotion = (promotion: Omit<TokenPromotion, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newPromotion: TokenPromotion = {
      ...promotion,
      id: `promo_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    setAdminPromotions(prev => [...prev, newPromotion]);
    toast.success('Promoción creada', `"${promotion.name}" creada exitosamente`);
  };

  const handleUpdatePromotion = (promotionId: string, updates: Partial<TokenPromotion>) => {
    setAdminPromotions(prev => prev.map(p => p.id === promotionId ? { ...p, ...updates } : p));
    toast.success('Promoción actualizada', 'Los cambios han sido guardados');
  };

  const handleDeletePromotion = (promotionId: string) => {
    setAdminPromotions(prev => prev.filter(p => p.id !== promotionId));
    toast.success('Promoción eliminada', 'La promoción ha sido eliminada del sistema');
  };

  const handleTogglePromotion = (promotionId: string) => {
    const promotion = adminPromotions.find(p => p.id === promotionId);
    if (promotion) {
      handleUpdatePromotion(promotionId, { active: !promotion.active });
      toast.success(
        promotion.active ? 'Promoción desactivada' : 'Promoción activada',
        promotion.active ? 'La promoción ha sido desactivada' : 'La promoción ha sido activada'
      );
    }
  };

  const handleBanAffiliate = (affiliateId: string) => {
    const affiliate = adminAffiliates.find(a => a.id === affiliateId);
    if (affiliate) {
      handleUpdateAffiliate(affiliateId, { active: !affiliate.active });
      toast.success(
        affiliate.active ? 'Afiliado suspendido' : 'Afiliado reactivado',
        affiliate.active ? 'El afiliado ha sido suspendido' : 'El afiliado ha sido reactivado'
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setAdminView('dashboard');
    toast.info('Sesión admin cerrada', 'Has salido del panel de administración');
  };

  const handleSaveNewPrompt = (newPrompt: {
    title: string;
    content_es: string;
    content_en: string;
    category: string;
    tags: string[];
  }) => {
    // In a real app, this would save to Supabase
    console.log('Saving new prompt:', newPrompt);
    toast.success('Prompt creado', `"${newPrompt.title}" guardado exitosamente`);
    
    // Here you would typically:
    // 1. Call a Supabase function to save the prompt
    // 2. Refresh the prompts list
    // 3. Show success notification
  };

  const handleOpenPlayground = (initialPrompt = '') => {
    setPlaygroundPrompt(initialPrompt);
    setIsPlaygroundOpen(true);
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleOpenProfile = () => {
    navigate('/profile');
  };

  // Render admin panel
  if (isAdminMode) {
    const renderAdminContent = () => {
      switch (adminView) {
        case 'dashboard':
          return (
            <EnhancedDashboard
              stats={{
                totalUsers: adminUsers.length,
                totalPrompts: prompts.length,
                totalRevenue: 15420,
                activeUsers: Math.floor(adminUsers.length * 0.6),
                promptViews: prompts.reduce((acc, p) => acc + (p.stats?.visits || 0), 0),
                promptCopies: prompts.reduce((acc, p) => acc + (p.stats?.copies || 0), 0),
                avgCTR: prompts.length > 0 ? prompts.reduce((acc, p) => acc + (p.stats?.ctr || 0), 0) / prompts.length : 0,
                topPrompts: prompts
                  .sort((a, b) => (b.stats?.ctr || 0) - (a.stats?.ctr || 0))
                  .slice(0, 5)
                  .map(p => ({
                    id: p.id,
                    title: p.title,
                    views: p.stats?.visits || 0,
                    copies: p.stats?.copies || 0,
                    ctr: p.stats?.ctr || 0,
                  })),
                recentActivity: [
                  { id: '1', type: 'view', user: 'Juan Pérez', prompt: 'Email Marketing Campaign', timestamp: 'Hace 5 min' },
                  { id: '2', type: 'copy', user: 'María García', prompt: 'Social Media Post', timestamp: 'Hace 12 min' },
                  { id: '3', type: 'purchase', user: 'Carlos López', prompt: 'SEO Content Writer', timestamp: 'Hace 23 min' },
                  { id: '4', type: 'view', user: 'Ana Martínez', prompt: 'Product Description', timestamp: 'Hace 35 min' },
                  { id: '5', type: 'copy', user: 'Luis Rodríguez', prompt: 'Blog Post Generator', timestamp: 'Hace 1 hora' },
                ],
              }}
            />
          );
        case 'users':
          return (
            <UserManagement
              users={adminUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onChangeRole={handleChangeRole}
              onBanUser={handleBanUser}
              onAccessAsUser={handleAccessAsUser}
            />
          );
        case 'plans':
          return (
            <PlanManagement
              plans={adminPlans}
              users={adminUsers}
              onCreatePlan={handleCreatePlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          );
        case 'products':
          return <ProductManagement />;
        case 'prompts':
          return (
            <PromptManagement
              prompts={prompts}
              categories={categories}
              onCreatePrompt={(prompt) => {
                console.log('Create prompt:', prompt);
                toast.success('Prompt creado', `"${prompt.title}" creado exitosamente`);
              }}
              onUpdatePrompt={(promptId, updates) => {
                console.log('Update prompt:', { promptId, updates });
                toast.success('Prompt actualizado', 'Los cambios han sido guardados');
              }}
              onDeletePrompt={(promptId) => {
                console.log('Delete prompt:', promptId);
                toast.success('Prompt eliminado', 'El prompt ha sido eliminado');
              }}
              onCreateCategory={(category) => {
                console.log('Create category:', category);
                toast.success('Categoría creada', `"${category.name}" creada exitosamente`);
              }}
              onUpdateCategory={(categoryId, updates) => {
                console.log('Update category:', { categoryId, updates });
                toast.success('Categoría actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteCategory={(categoryId) => {
                console.log('Delete category:', categoryId);
                toast.success('Categoría eliminada', 'La categoría ha sido eliminada');
              }}
            />
          );
        case 'categories':
          return (
            <CategoryManagement
              categories={categories}
              prompts={prompts}
              onCreateCategory={(category) => {
                console.log('Create category:', category);
                toast.success('Categoría creada', `"${category.name}" creada exitosamente`);
              }}
              onUpdateCategory={(categoryId, updates) => {
                console.log('Update category:', { categoryId, updates });
                toast.success('Categoría actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteCategory={(categoryId) => {
                console.log('Delete category:', categoryId);
                toast.success('Categoría eliminada', 'La categoría ha sido eliminada');
              }}
            />
          );
        case 'providers':
          return (
            <ProviderManagement
              providers={providers}
              onCreateProvider={handleCreateProvider}
              onUpdateProvider={handleUpdateProvider}
              onDeleteProvider={handleDeleteProvider}
              onCreateModel={handleCreateModel}
              onUpdateModel={handleUpdateModel}
              onDeleteModel={handleDeleteModel}
            />
          );
        case 'variables':
          return (
            <VariableManagement
              variables={[]}
              onCreateVariable={(variable) => {
                console.log('Create variable:', variable);
                toast.success('Variable creada', `"${variable.label}" creada exitosamente`);
              }}
              onUpdateVariable={(variableId, updates) => {
                console.log('Update variable:', { variableId, updates });
                toast.success('Variable actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteVariable={(variableId) => {
                console.log('Delete variable:', variableId);
                toast.success('Variable eliminada', 'La variable ha sido eliminada');
              }}
            />
          );
        case 'subcategories':
          return (
            <SubcategoryManagement
              subcategories={[]}
              categories={categories}
              onCreateSubcategory={(subcategory) => {
                console.log('Create subcategory:', subcategory);
                toast.success('Subcategoría creada', `"${subcategory.name}" creada exitosamente`);
              }}
              onUpdateSubcategory={(subcategoryId, updates) => {
                console.log('Update subcategory:', { subcategoryId, updates });
                toast.success('Subcategoría actualizada', 'Los cambios han sido guardados');
              }}
              onDeleteSubcategory={(subcategoryId) => {
                console.log('Delete subcategory:', subcategoryId);
                toast.success('Subcategoría eliminada', 'La subcategoría ha sido eliminada');
              }}
            />
          );
        case 'coupons':
          return (
            <CouponManagement
              coupons={adminCoupons}
              onCreateCoupon={handleCreateCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          );
        case 'affiliates':
          return (
            <AffiliateManagement
              affiliates={adminAffiliates}
              users={adminUsers}
              onUpdateAffiliate={handleUpdateAffiliate}
              onBanAffiliate={handleBanAffiliate}
            />
          );
        case 'audit':
          return (
            <AuditLogs
              logs={[]}
              users={adminUsers}
            />
          );
        case 'settings':
          return (
            <SystemSettings
              onUpdateSettings={(settings) => console.log('Update settings:', settings)}
            />
          );
        case 'pricing':
          return (
            <TokenPricing
              onUpdatePricing={(pricing) => console.log('Update pricing:', pricing)}
            />
          );
        case 'reports':
          return (
            <BillingReports
              users={adminUsers}
              executions={[]}
            />
          );
        case 'promotions':
          return (
            <TokenPromotions
              promotions={adminPromotions}
              onCreatePromotion={handleCreatePromotion}
              onUpdatePromotion={handleUpdatePromotion}
              onDeletePromotion={handleDeletePromotion}
              onTogglePromotion={handleTogglePromotion}
            />
          );
        case 'organizations':
          return (
            <OrganizationPlanManagement
              plans={adminOrgPlans}
              onCreatePlan={(plan) => {
                const newPlan: OrganizationPlan = {
                  ...plan,
                  id: `org_plan_${Date.now()}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setAdminOrgPlans(prev => [...prev, newPlan]);
              }}
              onUpdatePlan={(planId, updates) => {
                setAdminOrgPlans(prev => prev.map(p => 
                  p.id === planId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
                ));
              }}
              onDeletePlan={(planId) => {
                setAdminOrgPlans(prev => prev.filter(p => p.id !== planId));
              }}
            />
          );
        case 'referral-settings':
          return (
            <ReferralSettings
              onUpdateSettings={(settings) => {
                console.log('Update referral settings:', settings);
                toast.success('Configuración actualizada', 'Configuración de referidos guardada');
              }}
            />
          );
        case 'smtp':
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-4">Sección en desarrollo</h3>
              <p className="text-gray-400">Esta funcionalidad estará disponible pronto</p>
            </div>
          );
        case 'support':
          if (adminSupportLoading) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-400">Cargando tickets...</p>
              </div>
            );
          }
          return (
            <SupportTickets
              tickets={adminSupportTickets}
              users={adminSupportUsers}
              onUpdateTicket={handleAdminUpdateTicket}
              onAddResponse={handleAdminAddResponse}
            />
          );
        case 'emails':
          if (emailTemplatesLoading) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-400">Cargando plantillas...</p>
              </div>
            );
          }
          return (
            <EmailTemplates
              templates={emailTemplates}
              onCreateTemplate={handleCreateEmailTemplate}
              onUpdateTemplate={handleUpdateEmailTemplate}
              onDeleteTemplate={handleDeleteEmailTemplate}
              onTestTemplate={handleTestEmailTemplate}
            />
          );
        default:
          return (
            <AuditLogs
              logs={[]}
              users={adminUsers}
            />
          );
      }
    };

    return (
      <AdminLayout
        currentView={adminView}
        onViewChange={setAdminView}
        onLogout={handleAdminLogout}
      >
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // Transform categories for the filter component
  const categoryOptions = [
    { id: 'all', name: 'Todas las categorías' },
    ...categories,
  ];

  // Render specific pages based on current path
  if (currentPath === '/marketplace') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          onNewPrompt={handleNewPrompt}
          onOpenPlayground={() => handleOpenPlayground()}
          onOpenDashboard={handleOpenDashboard}
          onOpenMarketplace={() => navigate('/marketplace')}
          onOpenSupport={() => navigate('/soporte')}
          onOpenProfile={handleOpenProfile}
          currentView={currentView}
          onToggleAdmin={toggleAdminMode}
          isAdmin={isUserAdmin}
        />
        <MarketplacePage />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (currentPath.startsWith('/product/')) {
    const productId = currentPath.split('/')[2];
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          onNewPrompt={handleNewPrompt}
          onOpenPlayground={() => handleOpenPlayground()}
          onOpenDashboard={handleOpenDashboard}
          onOpenMarketplace={() => navigate('/marketplace')}
          onOpenSupport={() => navigate('/soporte')}
          onOpenProfile={handleOpenProfile}
          currentView={currentView}
          onToggleAdmin={toggleAdminMode}
          isAdmin={isUserAdmin}
        />
        <ProductDetail productId={productId} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (currentPath === '/my-prompts') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          onNewPrompt={handleNewPrompt}
          onOpenPlayground={() => handleOpenPlayground()}
          onOpenDashboard={handleOpenDashboard}
          onOpenMarketplace={() => navigate('/marketplace')}
          onOpenSupport={() => navigate('/soporte')}
          onOpenProfile={handleOpenProfile}
          currentView={currentView}
          onToggleAdmin={toggleAdminMode}
          isAdmin={isUserAdmin}
        />
        <MyPurchasedPrompts />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {accessingAsUser && (
        <AdminAccessBanner 
          userName={accessingAsUser.name} 
          onBackToAdmin={handleBackToAdmin}
        />
      )}
      <Header 
        onNewPrompt={handleNewPrompt}
        onOpenPlayground={() => handleOpenPlayground()}
        onOpenDashboard={handleOpenDashboard}
        onOpenMarketplace={() => navigate('/marketplace')}
        onOpenSupport={() => navigate('/soporte')}
        onOpenProfile={handleOpenProfile}
        currentView={currentView}
        onToggleAdmin={toggleAdminMode}
        isAdmin={isUserAdmin}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard prompts={prompts} />
        ) : (
          <>
            <Filters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={setShowFavoritesOnly}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
              categories={categoryOptions}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onView={handleViewPrompt}
                  onCopy={handleCopyPrompt}
                  onImprove={handleImprovePrompt}
                  onTranslate={handleTranslatePrompt}
                  onToggleFavorite={handleToggleFavorite}
                 onViewHistory={handleViewHistory}
                />
              ))}
            </div>

            {filteredAndSortedPrompts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No se encontraron prompts</div>
                <div className="text-gray-400 text-sm">
                  Intenta cambiar los filtros o términos de búsqueda
                </div>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredAndSortedPrompts.length}
            />
          </>
        )}
      </main>

      <PromptModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCopy={handleCopyPrompt}
        onImprove={handleImprovePrompt}
        onTranslate={handleTranslatePrompt}
        onToggleFavorite={handleToggleFavorite}
       onViewHistory={handleViewHistory}
      />

      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewPrompt}
      />

      <Playground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        initialPrompt={playgroundPrompt}
      />

      <VersionHistoryModal
        prompt={historyPrompt}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onRestoreVersion={handleRestoreVersion}
      />

      <TokenWarningModal
        isOpen={showTokenWarning}
        onClose={() => setShowTokenWarning(false)}
        onPurchaseTokens={() => {
          setShowTokenWarning(false);
          setShowTokenUsage(true);
        }}
        onUpgradePlan={() => {
          setShowTokenWarning(false);
          setShowTokenUsage(true);
        }}
        activePromotion={adminPromotions.find(p => p.active && p.show_popup) || null}
        user={{
          name: 'Usuario Demo',
          plan: 'Pro',
          tokensUsed: 750000,
          tokensLimit: 2000000,
        }}
      />

      <TokenUsageModal
        isOpen={showTokenUsage}
        onClose={() => setShowTokenUsage(false)}
        activePromotion={adminPromotions.find(p => p.active) || null}
        user={{
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario Demo',
          email: user?.email || '',
          plan: user?.user_metadata?.plan || 'Pro',
          tokensUsed: 750000,
          tokensLimit: 2000000,
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
