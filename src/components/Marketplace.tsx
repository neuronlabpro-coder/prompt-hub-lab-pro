import { useState, useEffect } from 'react';
import { ShoppingCart, Search, TrendingUp, CheckCircle, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Select } from './ui/Select';
import { useToast } from '../hooks/useToast';
import { useAuth } from './AuthProvider';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../lib/utils';

interface MarketplacePrompt {
  id: string;
  title: string;
  content_es: string;
  type: string;
  tags: string[];
  price: number;
  sales_count: number;
  media_preview_url?: string;
  categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

interface PromptDetails extends MarketplacePrompt {
  discount_percent: number;
  final_price: number;
}

export function Marketplace() {
  const { toast } = useToast();
  const { user, getToken } = useAuth();
  const { addItem } = useCart();
  const [prompts, setPrompts] = useState<MarketplacePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptDetails | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);

  useEffect(() => {
    fetchMarketplacePrompts();
    if (user) {
      fetchMyPurchases();
    }
  }, [sortBy, user]);

  const fetchMarketplacePrompts = async () => {
    try {
      const params = new URLSearchParams({ sort: sortBy });
      if (search) params.append('search', search);

      const response = await fetch(`/api/marketplace/prompts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPrompts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPurchases = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch('/api/marketplace/my-purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMyPurchases(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchPromptDetails = async (promptId: string) => {
    try {
      const token = user ? await getToken() : null;
      const response = await fetch(`/api/marketplace/prompts/${promptId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      const data = await response.json();

      if (data.success) {
        setSelectedPrompt(data.data);
      }
    } catch (error) {
      console.error('Error fetching prompt details:', error);
      toast.error('Error', 'No se pudo cargar el prompt');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.warning('Inicia sesión', 'Debes iniciar sesión para comprar');
      return;
    }

    if (!selectedPrompt) return;

    setPurchasing(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Sesión inválida');
      }
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt_id: selectedPrompt.id,
          payment_method: 'stripe'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la compra');
      }

      toast.success('¡Compra exitosa!', 'El prompt está ahora en "Mis Compras"');
      setSelectedPrompt(null);
      fetchMyPurchases();
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo completar la compra');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchMarketplacePrompts();
  };

  const isPurchased = (promptId: string) => {
    return myPurchases.some(p => p.prompts?.id === promptId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <ShoppingCart className="h-8 w-8" />
            </div>
            Marketplace de Prompts
          </h1>
          <p className="text-gray-400 mt-2">
            Prompts profesionales listos para usar. {user && 'Con descuentos exclusivos para suscriptores.'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                data-testid="input-search-marketplace"
              />
              <Button onClick={handleSearch} data-testid="button-search-marketplace">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'recent', label: 'Más Recientes' },
                { value: 'popular', label: 'Más Populares' },
                { value: 'price_low', label: 'Precio: Menor a Mayor' },
                { value: 'price_high', label: 'Precio: Mayor a Menor' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay prompts disponibles</h3>
            <p className="text-gray-400">
              {search ? 'Intenta con otra búsqueda' : 'Vuelve pronto para ver nuevos prompts'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => {
            const purchased = isPurchased(prompt.id);
            
            return (
              <Card 
                key={prompt.id} 
                className="group hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => fetchPromptDetails(prompt.id)}
                data-testid={`card-prompt-${prompt.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={prompt.type === 'text' ? 'default' : 'secondary'}>
                      {prompt.type === 'text' ? '📝 Texto' : prompt.type === 'image' ? '🖼️ Imagen' : '🎥 Video'}
                    </Badge>
                    {purchased && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Comprado
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {prompt.content_es}
                  </p>

                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {prompt.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {prompt.sales_count || 0}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {formatCurrency(prompt.price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Prompt Details Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant={selectedPrompt.type === 'text' ? 'default' : 'secondary'} className="mb-3">
                    {selectedPrompt.type === 'text' ? '📝 Texto' : selectedPrompt.type === 'image' ? '🖼️ Imagen' : '🎥 Video'}
                  </Badge>
                  <CardTitle className="text-2xl">{selectedPrompt.title}</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedPrompt(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Contenido del Prompt:</h4>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedPrompt.content_es}</p>
                </div>
              </div>

              {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiquetas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Precio Original</p>
                    <p className={`text-2xl font-bold ${selectedPrompt.discount_percent > 0 ? 'line-through text-gray-500' : 'text-white'}`}>
                      {formatCurrency(selectedPrompt.price)}
                    </p>
                  </div>

                  {selectedPrompt.discount_percent > 0 && (
                    <div className="text-right">
                      <Badge variant="success" className="mb-2">
                        -{selectedPrompt.discount_percent}% OFF
                      </Badge>
                      <p className="text-3xl font-bold text-green-400">
                        {formatCurrency(selectedPrompt.final_price)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedPrompt.discount_percent > 0 && (
                  <p className="text-sm text-green-400 mb-4">
                    🎉 ¡Descuento exclusivo para suscriptores aplicado!
                  </p>
                )}

                {isPurchased(selectedPrompt.id) ? (
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ya compraste este prompt
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        addItem({
                          id: selectedPrompt.id,
                          title: selectedPrompt.title,
                          price: selectedPrompt.price,
                          category: selectedPrompt.categories?.name,
                          discount_percent: selectedPrompt.discount_percent,
                          final_price: selectedPrompt.final_price,
                        });
                        toast.success('Agregado al carrito', `${selectedPrompt.title} se agregó correctamente`);
                      }}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={handlePurchase}
                      disabled={purchasing || !user}
                      data-testid="button-purchase-prompt"
                    >
                      {purchasing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          {user ? 'Comprar Ahora' : 'Inicia sesión'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="h-4 w-4" />
                {selectedPrompt.sales_count || 0} ventas
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
