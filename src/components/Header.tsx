import React, { useState } from 'react';
import { Zap, User, Settings, LogOut, Plus, BarChart3, Shield, Store, MessageCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { TokenUsageModal } from './TokenUsageModal';

interface HeaderProps {
  onNewPrompt: () => void;
  onOpenDashboard: () => void;
  onOpenMarketplace?: () => void;
  onOpenSupport?: () => void;
  onOpenProfile?: () => void;
  currentView: 'prompts' | 'dashboard' | 'marketplace' | 'soporte' | 'playground';
  onToggleAdmin?: () => void;
  isAdmin?: boolean;
}

export function Header({ onNewPrompt, onOpenDashboard, onOpenMarketplace, onOpenSupport, onOpenProfile, currentView, onToggleAdmin, isAdmin }: HeaderProps) {
  const { user: authUser, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // User data from Supabase auth
  const user = {
    name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Usuario',
    email: authUser?.email || '',
    plan: authUser?.user_metadata?.plan || 'Pro',
    tokensUsed: 750000, // TODO: Get from database
    tokensLimit: 2000000, // TODO: Get from plan info
  };

  const tokenUsagePercent = (user.tokensUsed / user.tokensLimit) * 100;

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PromptHub</h1>
                <p className="text-xs text-gray-400">v2.0</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onOpenDashboard}
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                size="sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              
              <Button
                onClick={onNewPrompt}
                variant={currentView === 'prompts' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">{currentView === 'prompts' ? 'Prompts' : 'Nuevo'}</span>
              </Button>

              
              {/* Playground desactivado - será parte de agentes futuros */}

              {/* Marketplace Button */}
              {onOpenMarketplace && (
                <Button
                  onClick={onOpenMarketplace}
                  variant={currentView === 'marketplace' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Store className="h-4 w-4" />
                  <span className="hidden md:inline">Marketplace</span>
                </Button>
              )}

              {/* Soporte Button */}
              {onOpenSupport && (
                <Button
                  onClick={onOpenSupport}
                  variant={currentView === 'soporte' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Soporte</span>
                </Button>
              )}

              {/* Admin Button */}
              {isAdmin && onToggleAdmin && (
                <Button
                  onClick={onToggleAdmin}
                  variant="outline"
                  className="flex items-center gap-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}

              {/* Token Usage */}
              <div 
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => setShowTokenModal(true)}
              >
                <div className="text-sm">
                  <span className="font-medium text-white">{Math.round(user.tokensUsed / 1000)}K</span>
                  <span className="text-gray-400">/{Math.round(user.tokensLimit / 1000)}K</span>
                </div>
                <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-64 z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                          Plan {user.plan}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 border-b border-gray-700">
                      <div className="text-sm text-gray-300 mb-2">Uso de tokens</div>
                      <div 
                        className="w-full h-2 bg-gray-600 rounded-full overflow-hidden mb-1 cursor-pointer"
                        onClick={() => {
                          setShowTokenModal(true);
                          setShowUserMenu(false);
                        }}
                      >
                        <div
                          className={`h-full transition-all duration-300 ${
                            tokenUsagePercent > 80 ? 'bg-red-500' : tokenUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(tokenUsagePercent, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(user.tokensUsed / 1000)}K de {Math.round(user.tokensLimit / 1000)}K tokens
                        <button 
                          className="ml-2 text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            setShowTokenModal(true);
                            setShowUserMenu(false);
                          }}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>

                    <div className="py-1">
                      {onOpenProfile && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                          onClick={() => {
                            onOpenProfile();
                            setShowUserMenu(false);
                          }}
                          data-testid="button-open-profile"
                        >
                          <Settings className="h-4 w-4" />
                          Mi Perfil
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-red-400"
                          onClick={() => {
                            window.location.href = '/admin/dashboard';
                            setShowUserMenu(false);
                          }}
                          data-testid="button-admin-panel"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                        onClick={async () => {
                          await signOut();
                          setShowUserMenu(false);
                          window.location.href = '/';
                        }}
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <TokenUsageModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        user={user}
      />
    </>
  );
}