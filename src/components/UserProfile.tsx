import { useState } from 'react';
import { User, Mail, Lock, Shield, CreditCard, HardDrive, Zap, Save, Eye, EyeOff, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useToast } from '../hooks/useToast';
import { useSupabase } from '../hooks/useSupabase';
import { TwoFactorAuth } from './TwoFactorAuth';
import { ApiKeysManager } from './ApiKeysManager';

interface UserProfileProps {
  user: any;
  onClose?: () => void;
}

export function UserProfile({ user, onClose }: UserProfileProps) {
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.fullName }
      });

      if (error) throw error;

      toast.success('Perfil actualizado', 'Tu información se ha guardado correctamente');
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Contraseña actualizada', 'Tu contraseña se ha cambiado correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'No se pudo cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Uso y Plan', icon: Zap },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nombre Completo
        </label>
        <Input
          value={profileData.fullName}
          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
          placeholder="Tu nombre completo"
          data-testid="input-full-name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <Input
          value={profileData.email}
          disabled
          className="bg-gray-800 cursor-not-allowed"
          data-testid="input-email-disabled"
        />
        <p className="text-xs text-gray-500 mt-1">
          El email no puede ser modificado por seguridad
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rol
        </label>
        <Badge variant={user?.user_metadata?.role === 'superadmin' ? 'destructive' : 'default'}>
          {user?.user_metadata?.role || 'user'}
        </Badge>
      </div>

      <Button
        onClick={handleUpdateProfile}
        disabled={isLoading}
        data-testid="button-save-profile"
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Cambiar Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                data-testid="input-new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Repite la contraseña"
              data-testid="input-confirm-password"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={isLoading || !passwordData.newPassword || !passwordData.confirmPassword}
            data-testid="button-update-password"
          >
            <Lock className="h-4 w-4 mr-2" />
            Actualizar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Autenticación de Dos Factores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación de Dos Factores (2FA)
          </CardTitle>
          <CardDescription>
            Protege tu cuenta con un código adicional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorAuth />
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageTab = () => {
    const planName = user?.user_metadata?.plan_name || 'Básico';
    const tokensUsed = user?.user_metadata?.tokens_used || 0;
    const tokensLimit = user?.user_metadata?.tokens_limit || 100000;
    const storageUsed = user?.user_metadata?.storage_used_mb || 0;
    const storageLimit = user?.user_metadata?.storage_limit_mb || 500;

    const tokensPercentage = Math.min((tokensUsed / tokensLimit) * 100, 100);
    const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100);

    return (
      <div className="space-y-6">
        {/* Plan Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-100">{planName}</p>
                <p className="text-sm text-gray-400">Plan activo</p>
              </div>
              <Badge variant="success">Activo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Uso de Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Uso de Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Usados</span>
              <span className="font-medium text-gray-100">
                {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  tokensPercentage > 90 ? 'bg-red-500' : tokensPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${tokensPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {(100 - tokensPercentage).toFixed(1)}% disponible
            </p>
          </CardContent>
        </Card>

        {/* Uso de Almacenamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Usado</span>
              <span className="font-medium text-gray-100">
                {storageUsed} MB / {storageLimit} MB
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {(storageLimit - storageUsed).toFixed(0)} MB disponibles para imágenes y videos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Mi Perfil</h1>
              <p className="text-gray-400">Gestiona tu cuenta y preferencias</p>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} data-testid="button-close-profile">
              Cerrar
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'api-keys' && <ApiKeysManager />}
          {activeTab === 'usage' && renderUsageTab()}
        </div>
      </div>
    </div>
  );
}
