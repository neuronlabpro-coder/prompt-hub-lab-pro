import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from '../components/Router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { BuyButton } from '../components/BuyButton';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  title: string;
  content_es: string;
  content_en: string;
  price: number;
  category: string;
  tags: string[];
  media_url?: string;
  media_type?: string;
  sales_count: number;
}

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    fetchProduct();
    if (user) {
      fetchUserPlan();
    }
  }, [productId, user]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', productId)
        .eq('is_for_sale', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('plan_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserPlan(data?.plan_id || 'free');
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }
  };

  const calculateDiscount = () => {
    const discounts: Record<string, number> = {
      'free': 0,
      'starter': 10,
      'pro': 15,
      'business': 20,
      'plus': 20,
      'enterprise': 20,
    };
    return discounts[userPlan] || 0;
  };

  const handleBuyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // El componente BuyButton maneja el resto
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Producto no encontrado</h3>
          <Button onClick={() => navigate('/marketplace')} className="mt-4">
            Volver al Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const discountedPrice = product.price * (1 - discount / 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate('/marketplace')}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al Marketplace
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Media */}
        <div className="space-y-4">
          {product.media_url ? (
            <Card className="overflow-hidden">
              {product.media_type === 'video' ? (
                <video
                  src={product.media_url}
                  className="w-full h-auto"
                  controls
                  data-testid="video-product"
                />
              ) : (
                <img
                  src={product.media_url}
                  alt={product.title}
                  className="w-full h-auto"
                  data-testid="image-product"
                />
              )}
            </Card>
          ) : (
            <Card className="bg-gray-100 dark:bg-gray-800 h-96 flex items-center justify-center">
              <p className="text-gray-500">Sin imagen</p>
            </Card>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {product.title}
            </h1>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {discount > 0 && user ? (
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-primary">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                        -{discount}% descuento
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Descuento de plan {userPlan}
                    </p>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                )}

                {user ? (
                  <BuyButton
                    promptId={product.id}
                    promptTitle={product.title}
                    price={discountedPrice}
                    userId={user.id}
                    userEmail={user.email || ''}
                    userName={user.user_metadata?.name || user.email?.split('@')[0]}
                  />
                ) : (
                  <Button
                    onClick={handleBuyClick}
                    className="w-full"
                    data-testid="button-login-to-buy"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Iniciar sesión para comprar
                  </Button>
                )}

                {product.sales_count > 0 && (
                  <p className="text-sm text-gray-500">
                    <Check className="inline h-4 w-4 mr-1" />
                    {product.sales_count} {product.sales_count === 1 ? 'persona ha comprado' : 'personas han comprado'} este prompt
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vista previa del Prompt (Español)</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {product.content_es.substring(0, 200)}
                    {product.content_es.length > 200 && '...'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Prompt Preview (English)</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {product.content_en.substring(0, 200)}
                    {product.content_en.length > 200 && '...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
