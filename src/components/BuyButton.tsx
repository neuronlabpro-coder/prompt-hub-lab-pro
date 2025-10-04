import { ShoppingCart, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/Button';
import { useToast } from '../hooks/useToast';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface BuyButtonProps {
  promptId: string;
  promptTitle: string;
  price: number;
  userId: string;
  userEmail: string;
  userName?: string;
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-prompts`,
        },
      });

      if (error) {
        toast.error("Error en el pago", error.message);
      } else {
        toast.success("¡Compra exitosa!", "El prompt se ha agregado a tu biblioteca");
        onSuccess();
      }
    } catch (error) {
      toast.error("Error", "Ocurrió un error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          'Confirmar Pago'
        )}
      </Button>
    </form>
  );
}

export function BuyButton({ promptId, promptTitle, price, userId, userEmail, userName }: BuyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBuyClick = async () => {
    if (!stripePromise) {
      toast.error("Error", "Stripe no está configurado. Contacta al administrador.");
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: promptId,
            title: promptTitle,
            price: price,
            quantity: 1,
          }],
          userId,
          userEmail,
          userName,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast.error("Error", "No se pudo iniciar el proceso de compra");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setClientSecret('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleBuyClick}
        disabled={isLoading}
        className="gap-2"
        data-testid="button-buy-prompt"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Comprar ${price.toFixed(2)}
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold">Completar Compra</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {promptTitle} - ${price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!clientSecret ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Elements stripe={stripePromise!} options={{ clientSecret }}>
              <CheckoutForm onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
