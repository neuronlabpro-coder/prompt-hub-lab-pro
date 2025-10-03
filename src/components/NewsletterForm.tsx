import { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useToast } from '../hooks/useToast';

interface NewsletterFormProps {
  variant?: 'inline' | 'footer' | 'modal';
  showName?: boolean;
}

export function NewsletterForm({ variant = 'inline', showName = false }: NewsletterFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          name: name || null 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al suscribirse');
      }

      setIsSubscribed(true);
      setEmail('');
      setName('');
      toast.success('¡Suscripción exitosa!', data.message);
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo completar la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed && variant === 'modal') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">¡Gracias por suscribirte!</h3>
        <p className="text-gray-400">
          Te mantendremos informado sobre nuevas funciones, prompts y actualizaciones.
        </p>
      </div>
    );
  }

  // Footer variant - compact horizontal
  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          data-testid="input-newsletter-email"
        />
        <Button
          type="submit"
          disabled={isLoading || !email}
          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          data-testid="button-newsletter-subscribe"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Suscribirse
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  // Inline variant - with optional name field
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="space-y-4">
        {showName && (
          <Input
            type="text"
            placeholder="Nombre (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            data-testid="input-newsletter-name"
          />
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              data-testid="input-newsletter-email"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 whitespace-nowrap px-8"
            data-testid="button-newsletter-subscribe"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Suscribirse
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Al suscribirte, aceptas recibir emails con actualizaciones y novedades.
        Puedes cancelar en cualquier momento.
      </p>
    </form>
  );
}
