import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Users, CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/utils';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscribeFormProps {
  planDetails: {
    name: string;
    basePrice: number;
    users: number;
    total: number;
  };
}

function SubscribeForm({ planDetails }: SubscribeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success?users=${planDetails.users}`,
      },
    });

    if (error) {
      toast({
        title: 'Error en el pago',
        description: error.message,
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Información de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-medium mb-1">Después del pago:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Se creará automáticamente tu cuenta</li>
            <li>Recibirás acceso inmediato a la plataforma</li>
            <li>Se configurarán {planDetails.users} usuarios para tu organización</li>
          </ul>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Pagar {formatCurrency(planDetails.total)}
          </>
        )}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Pago seguro procesado por Stripe. Puedes cancelar en cualquier momento.
      </p>
    </form>
  );
}

export default function Subscribe() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(2); // Mínimo 2 usuarios para multitenant

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const planId = params.get('plan') || 'pro';
  const basePrice = parseFloat(params.get('price') || '29');

  const planNames: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };

  // Precio por usuario adicional (después de los incluidos en el plan base)
  const pricePerUser = 10;
  
  // Usuarios incluidos en cada plan
  const includedUsers: Record<string, number> = {
    starter: 1,
    pro: 5,
    enterprise: 10
  };

  const baseIncluded = includedUsers[planId] || 1;
  
  // Calcular costo total
  const calculateTotal = () => {
    if (users <= baseIncluded) {
      return basePrice;
    }
    const additionalUsers = users - baseIncluded;
    return basePrice + (additionalUsers * pricePerUser);
  };

  const totalPrice = calculateTotal();

  useEffect(() => {
    // Crear payment intent con Stripe
    fetch('/api/create-subscription-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        basePrice,
        users,
        totalAmount: totalPrice
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Error creating payment intent');
        return res.json();
      })
      .then(data => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        toast({
          title: 'Error',
          description: 'No se pudo iniciar el proceso de pago. Por favor intenta de nuevo.',
          variant: 'destructive'
        });
        setLoading(false);
      });
  }, [users, planId, basePrice, totalPrice]);

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold mb-2">Completar Suscripción</h1>
          <p className="text-gray-400">Plan {planNames[planId]} - Configuración Multitenant</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna izquierda: Configuración */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Plan Seleccionado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Badge className="bg-blue-600 text-white mb-2">
                      {planNames[planId]}
                    </Badge>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(basePrice)}
                      <span className="text-sm font-normal text-gray-400">/mes</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selector de usuarios multitenant */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Usuarios (Multitenant)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Número de usuarios <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUsers(Math.max(2, users - 1))}
                      disabled={users <= 2}
                      data-testid="button-decrease-users"
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={users}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 2;
                        setUsers(Math.max(2, val));
                      }}
                      min="2"
                      className="w-20 text-center bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                      data-testid="input-users-count"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUsers(users + 1)}
                      data-testid="button-increase-users"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Mínimo 2 usuarios requeridos
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Precio base:</span>
                    <span className="text-white">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usuarios incluidos:</span>
                    <span className="text-white">{baseIncluded}</span>
                  </div>
                  {users > baseIncluded && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Usuarios adicionales:</span>
                        <span className="text-white">{users - baseIncluded}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Costo adicional:</span>
                        <span className="text-white">
                          {formatCurrency((users - baseIncluded) * pricePerUser)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                    <span>Total mensual:</span>
                    <span className="text-xl text-green-400">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características incluidas */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Incluye</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    <span>Gestión multitenant</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    <span>Dashboard por organización</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    <span>Roles y permisos</span>
                  </li>
                  <li className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    <span>Acceso inmediato</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Formulario de pago */}
          <div className="md:col-span-2">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm
                planDetails={{
                  name: planNames[planId],
                  basePrice,
                  users,
                  total: totalPrice
                }}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}
