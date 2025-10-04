import { useState, useEffect } from 'react';
import { ShoppingBag, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useRouter } from '../components/Router';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  tags: string[];
  media_url?: string;
  media_type?: string;
  sales_count: number;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, title, price, category, tags, media_url, media_type, sales_count')
        .eq('is_for_sale', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          Marketplace de Prompts
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Explora y compra prompts profesionales para mejorar tus resultados
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            No hay prompts disponibles
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Vuelve pronto para ver nuevos prompts'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(product.id)}
              data-testid={`card-product-${product.id}`}
            >
              {product.media_url && (
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  {product.media_type === 'video' ? (
                    <video
                      src={product.media_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                    />
                  ) : (
                    <img
                      src={product.media_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {product.title}
                </h3>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price?.toFixed(2)}
                  </span>
                  <Button size="sm" variant="outline" data-testid={`button-view-${product.id}`}>
                    Ver más
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {product.sales_count > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    {product.sales_count} {product.sales_count === 1 ? 'venta' : 'ventas'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
