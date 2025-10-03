import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Eye, EyeOff, Key, AlertTriangle, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { useToast } from '../hooks/useToast';
import { useAuth } from './AuthProvider';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  last_used: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export function ApiKeysManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch API keys
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      // En producción, esto vendría de Supabase con el token del usuario
      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${user?.id}`, // Ajustar según tu auth
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error', 'No se pudieron cargar las API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.warning('Nombre requerido', 'Por favor ingresa un nombre para la API key');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ name: newKeyName.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create API key');
      }

      const result = await response.json();
      setNewlyCreatedKey(result.data.api_key);
      setApiKeys([...apiKeys, result.data]);
      setNewKeyName('');
      toast.success('API Key creada', 'Guarda tu API key ahora. No podrás verla de nuevo.');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error('Error', error.message || 'No se pudo crear la API key');
    } finally {
      setCreating(false);
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres revocar esta API key? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success('API Key revocada', 'La API key ha sido eliminada');
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Error', 'No se pudo revocar la API key');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copiado', 'API key copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `Hace ${diffDays}d`;
    
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-400">Cargando API keys...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <Card className="border-green-500 bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">
                  ¡API Key creada exitosamente!
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Esta es la única vez que podrás ver tu API key completa. Guárdala en un lugar seguro.
                </p>
                
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-sm font-mono text-green-400 break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="flex-shrink-0"
                      data-testid="button-copy-new-key"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewlyCreatedKey(null)}
                  data-testid="button-dismiss-new-key"
                >
                  Entendido, la guardé
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New API Key */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Crear Nueva API Key</h3>
          </div>
          
          <div className="flex gap-3">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nombre descriptivo (ej: Producción, Desarrollo)"
              disabled={creating}
              onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
              data-testid="input-api-key-name"
              className="flex-1"
            />
            <Button
              onClick={createApiKey}
              disabled={!newKeyName.trim() || creating}
              className="flex items-center gap-2"
              data-testid="button-create-api-key"
            >
              {creating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Crear
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Las API keys te permiten integrar PromptHub en tus aplicaciones.
            Solo disponible para planes PRO o superior.
          </p>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          Tus API Keys ({apiKeys.length})
        </h3>

        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Key className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No tienes API keys todavía. Crea una para empezar.
              </p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className="border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{key.name}</h4>
                      {key.is_active ? (
                        <Badge variant="success" className="text-xs">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Inactiva
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-mono">{key.prefix}•••••••••••••••</span>
                      </div>
                      <div className="text-gray-500">
                        Creada: {formatDate(key.created_at)}
                      </div>
                      <div className="text-gray-500">
                        Último uso: {getTimeAgo(key.last_used)}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeApiKey(key.id)}
                    className="flex items-center gap-2 text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                    data-testid={`button-revoke-${key.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Revocar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Documentation Link */}
      <Card className="border-blue-500/30 bg-blue-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Key className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-200 mb-1">Documentación de la API</h4>
              <p className="text-sm text-blue-300 mb-2">
                Aprende cómo usar tu API key para integrar PromptHub en tus aplicaciones.
              </p>
              <a
                href="/docs-site/docs/api/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Ver documentación →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
