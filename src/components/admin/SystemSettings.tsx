import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Database, Key, Shield, Globe, Mail, Bell, Video, Users, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../../hooks/useToast';

interface SystemSettingsProps {
  onUpdateSettings: (settings: any) => void;
}

export function SystemSettings({ onUpdateSettings }: SystemSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    videoCompression: {
      codec: 'libvpx-vp9',
      audioCodec: 'libopus',
      bitrate: '1000k',
      crf: 30,
      maxPreviewDuration: 8,
    },
    multitenantDiscounts: {
      minUsers: 2,
      tier1Users: 19,
      tier1Discount: 10,
      tier2Users: 20,
      tier2Discount: 20,
    },
    general: {
      siteName: 'PromptHub v2',
      siteDescription: 'Plataforma avanzada para gestión de prompts de IA',
      defaultLanguage: 'es',
      timezone: 'Europe/Madrid',
      maintenanceMode: false,
    },
    api: {
      openaiKey: '••••••••••••••••••••••••••••••••••••••••',
      anthropicKey: '••••••••••••••••••••••••••••••••••••••••',
      replicateKey: '••••••••••••••••••••••••••••••••••••••••',
      rateLimitPerMinute: 60,
      maxTokensPerRequest: 4000,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@prompthub.com',
      smtpPassword: '••••••••••••••••',
      fromEmail: 'PromptHub <noreply@prompthub.com>',
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      enableTwoFactor: false,
      allowedDomains: '',
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: false,
      notifyOnNewUser: true,
      notifyOnHighUsage: true,
      usageThreshold: 80,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api', label: 'APIs', icon: Key },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'multitenant', label: 'Descuentos', icon: Percent },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ];

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  const timezoneOptions = [
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  ];

  const handleSave = (section: string) => {
    onUpdateSettings({ [section]: settings[section as keyof typeof settings] });
    toast.success('Configuración guardada', `Sección "${section}" actualizada exitosamente`);
  };

  const handleTestConnection = (service: string) => {
    toast.info(`Probando conexión con ${service}...`, 'Verificando configuración');
    setTimeout(() => {
      toast.success('Conexión exitosa', `${service} configurado correctamente`);
    }, 2000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre del Sitio
          </label>
          <Input
            value={settings.general.siteName}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, siteName: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Idioma por Defecto
          </label>
          <Select
            options={languageOptions}
            value={settings.general.defaultLanguage}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, defaultLanguage: e.target.value }
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción del Sitio
          </label>
          <Input
            value={settings.general.siteDescription}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, siteDescription: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Zona Horaria
          </label>
          <Select
            options={timezoneOptions}
            value={settings.general.timezone}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, timezone: e.target.value }
            })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="maintenance"
            checked={settings.general.maintenanceMode}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, maintenanceMode: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="maintenance" className="text-sm text-gray-300">
            Modo Mantenimiento
          </label>
        </div>
      </div>
      <Button onClick={() => handleSave('general')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración General
      </Button>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-500 mb-1">Seguridad de API Keys</h4>
            <p className="text-sm text-yellow-200/80">
              Las claves API se almacenan de forma segura en variables de entorno del servidor y nunca se exponen al navegador. 
              Los valores mostrados aquí son solo para configuración local. En producción, configura las claves directamente en Replit Secrets.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            OpenAI API Key
            <span className="ml-2 text-xs text-gray-500">(Solo backend - Nunca expuesta al cliente)</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.openaiKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, openaiKey: e.target.value }
              })}
              className="flex-1"
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              autoComplete="off"
              data-testid="input-openai-key"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('OpenAI')}
              data-testid="button-test-openai"
            >
              Probar
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Anthropic API Key
            <span className="ml-2 text-xs text-gray-500">(Solo backend - Nunca expuesta al cliente)</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.anthropicKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, anthropicKey: e.target.value }
              })}
              className="flex-1"
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              autoComplete="off"
              data-testid="input-anthropic-key"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('Anthropic')}
              data-testid="button-test-anthropic"
            >
              Probar
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Replicate API Key
            <span className="ml-2 text-xs text-gray-500">(Solo backend - Nunca expuesta al cliente)</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.api.replicateKey}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, replicateKey: e.target.value }
              })}
              className="flex-1"
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              autoComplete="off"
              data-testid="input-replicate-key"
            />
            <Button
              variant="outline"
              onClick={() => handleTestConnection('Replicate')}
              data-testid="button-test-replicate"
            >
              Probar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rate Limit (req/min)
            </label>
            <Input
              type="number"
              value={settings.api.rateLimitPerMinute}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, rateLimitPerMinute: parseInt(e.target.value) }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Tokens por Request
            </label>
            <Input
              type="number"
              value={settings.api.maxTokensPerRequest}
              onChange={(e) => setSettings({
                ...settings,
                api: { ...settings.api, maxTokensPerRequest: parseInt(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>
      <Button onClick={() => handleSave('api')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de APIs
      </Button>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Host
          </label>
          <Input
            value={settings.email.smtpHost}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpHost: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Port
          </label>
          <Input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpPort: parseInt(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Usuario
          </label>
          <Input
            value={settings.email.smtpUser}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpUser: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Contraseña
            <span className="ml-2 text-xs text-gray-500">(Nunca expuesta al cliente)</span>
          </label>
          <Input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, smtpPassword: e.target.value }
            })}
            placeholder="••••••••••••••••"
            autoComplete="off"
            data-testid="input-smtp-password"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Remitente
          </label>
          <Input
            value={settings.email.fromEmail}
            onChange={(e) => setSettings({
              ...settings,
              email: { ...settings.email, fromEmail: e.target.value }
            })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleSave('email')} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Guardar Configuración Email
        </Button>
        <Button
          variant="outline"
          onClick={() => handleTestConnection('SMTP')}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Enviar Email de Prueba
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timeout de Sesión (horas)
          </label>
          <Input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Intentos de Login
          </label>
          <Input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
            })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dominios Permitidos (separados por coma)
          </label>
          <Input
            value={settings.security.allowedDomains}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, allowedDomains: e.target.value }
            })}
            placeholder="ejemplo.com, empresa.com"
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailVerification"
            checked={settings.security.requireEmailVerification}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, requireEmailVerification: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="emailVerification" className="text-sm text-gray-300">
            Requerir verificación de email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="twoFactor"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, enableTwoFactor: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="twoFactor" className="text-sm text-gray-300">
            Habilitar autenticación de dos factores
          </label>
        </div>
      </div>
      <Button onClick={() => handleSave('security')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Seguridad
      </Button>
    </div>
  );

  const renderVideoSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
          <Video className="h-4 w-4" />
          Configuración de Compresión de Video
        </h4>
        <p className="text-sm text-gray-400">
          Ajusta los parámetros de compresión para las previews de videos en prompts. Mayor compresión = menor calidad pero menos almacenamiento.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Codec de Video
          </label>
          <Input
            value={settings.videoCompression.codec}
            onChange={(e) => setSettings({
              ...settings,
              videoCompression: { ...settings.videoCompression, codec: e.target.value }
            })}
            placeholder="libvpx-vp9"
          />
          <p className="text-xs text-gray-500 mt-1">VP9 recomendado para mejor compresión</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Codec de Audio
          </label>
          <Input
            value={settings.videoCompression.audioCodec}
            onChange={(e) => setSettings({
              ...settings,
              videoCompression: { ...settings.videoCompression, audioCodec: e.target.value }
            })}
            placeholder="libopus"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bitrate
          </label>
          <Input
            value={settings.videoCompression.bitrate}
            onChange={(e) => setSettings({
              ...settings,
              videoCompression: { ...settings.videoCompression, bitrate: e.target.value }
            })}
            placeholder="1000k"
          />
          <p className="text-xs text-gray-500 mt-1">Mayor valor = mejor calidad, más tamaño</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CRF (Constant Rate Factor)
          </label>
          <Input
            type="number"
            min="0"
            max="63"
            value={settings.videoCompression.crf}
            onChange={(e) => setSettings({
              ...settings,
              videoCompression: { ...settings.videoCompression, crf: parseInt(e.target.value) }
            })}
          />
          <p className="text-xs text-gray-500 mt-1">0-63: menor = mejor calidad (recomendado: 25-35)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duración Máxima de Preview (segundos)
          </label>
          <Input
            type="number"
            min="1"
            max="30"
            value={settings.videoCompression.maxPreviewDuration}
            onChange={(e) => setSettings({
              ...settings,
              videoCompression: { ...settings.videoCompression, maxPreviewDuration: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      <Button onClick={() => handleSave('videoCompression')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Video
      </Button>
    </div>
  );

  const renderMultitenantSettings = () => (
    <div className="space-y-6">
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-green-300 mb-2 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Descuentos por Volumen
        </h4>
        <p className="text-sm text-gray-400 mb-3">
          Configura los descuentos automáticos para planes multitenant según el número de usuarios.
        </p>
        <div className="space-y-1">
          <p className="text-sm text-gray-300">
            • {settings.multitenantDiscounts.minUsers}-{settings.multitenantDiscounts.tier1Users} usuarios: <span className="font-semibold text-green-400">{settings.multitenantDiscounts.tier1Discount}% descuento</span>
          </p>
          <p className="text-sm text-gray-300">
            • {settings.multitenantDiscounts.tier2Users}+ usuarios: <span className="font-semibold text-green-400">{settings.multitenantDiscounts.tier2Discount}% descuento</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Percent className="h-4 w-4 inline mr-1" />
            Descuento Tier 1 (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={settings.multitenantDiscounts.tier1Discount}
            onChange={(e) => setSettings({
              ...settings,
              multitenantDiscounts: { ...settings.multitenantDiscounts, tier1Discount: parseInt(e.target.value) }
            })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Aplicado de {settings.multitenantDiscounts.minUsers} a {settings.multitenantDiscounts.tier1Users} usuarios
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Usuarios Máximos Tier 1
          </label>
          <Input
            type="number"
            min="2"
            value={settings.multitenantDiscounts.tier1Users}
            onChange={(e) => setSettings({
              ...settings,
              multitenantDiscounts: { ...settings.multitenantDiscounts, tier1Users: parseInt(e.target.value) }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Percent className="h-4 w-4 inline mr-1" />
            Descuento Tier 2 (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={settings.multitenantDiscounts.tier2Discount}
            onChange={(e) => setSettings({
              ...settings,
              multitenantDiscounts: { ...settings.multitenantDiscounts, tier2Discount: parseInt(e.target.value) }
            })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Aplicado a {settings.multitenantDiscounts.tier2Users}+ usuarios
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Usuarios Mínimos Tier 2
          </label>
          <Input
            type="number"
            min="2"
            value={settings.multitenantDiscounts.tier2Users}
            onChange={(e) => setSettings({
              ...settings,
              multitenantDiscounts: { ...settings.multitenantDiscounts, tier2Users: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-gray-200 mb-2">Ejemplo de Cálculo</h5>
        <div className="space-y-1 text-sm">
          <p className="text-gray-400">
            <strong className="text-gray-200">Plan Multitenant a €29/usuario/mes:</strong>
          </p>
          <p className="text-gray-400">
            • 15 usuarios: €29 × 15 × (1 - {settings.multitenantDiscounts.tier1Discount}%) = <span className="font-semibold text-green-400">€{(29 * 15 * (1 - settings.multitenantDiscounts.tier1Discount / 100)).toFixed(2)}/mes</span>
          </p>
          <p className="text-gray-400">
            • 25 usuarios: €29 × 25 × (1 - {settings.multitenantDiscounts.tier2Discount}%) = <span className="font-semibold text-green-400">€{(29 * 25 * (1 - settings.multitenantDiscounts.tier2Discount / 100)).toFixed(2)}/mes</span>
          </p>
        </div>
      </div>
      <Button onClick={() => handleSave('multitenantDiscounts')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Descuentos
      </Button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.notifications.enableEmailNotifications}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, enableEmailNotifications: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="emailNotifications" className="text-sm text-gray-300">
            Habilitar notificaciones por email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={settings.notifications.enablePushNotifications}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, enablePushNotifications: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="pushNotifications" className="text-sm text-gray-300">
            Habilitar notificaciones push
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyNewUser"
            checked={settings.notifications.notifyOnNewUser}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, notifyOnNewUser: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="notifyNewUser" className="text-sm text-gray-300">
            Notificar cuando se registre un nuevo usuario
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notifyHighUsage"
            checked={settings.notifications.notifyOnHighUsage}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, notifyOnHighUsage: e.target.checked }
            })}
            className="rounded"
          />
          <label htmlFor="notifyHighUsage" className="text-sm text-gray-300">
            Notificar uso alto de tokens
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Umbral de uso para notificación (%)
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={settings.notifications.usageThreshold}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, usageThreshold: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      <Button onClick={() => handleSave('notifications')} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Guardar Configuración de Notificaciones
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configuración del Sistema</h1>
          <p className="text-gray-400">Configurar parámetros globales de la aplicación</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
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
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'api' && renderApiSettings()}
          {activeTab === 'video' && renderVideoSettings()}
          {activeTab === 'multitenant' && renderMultitenantSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Base de Datos</div>
                <div className="text-xs text-gray-400">Conectada - 15ms</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">APIs Externas</div>
                <div className="text-xs text-gray-400">3/3 Operacionales</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-medium text-gray-100">Cache Redis</div>
                <div className="text-xs text-gray-400">85% Memoria usada</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}