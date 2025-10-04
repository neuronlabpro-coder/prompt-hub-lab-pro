import { useEffect, useState } from 'react';
import { ShoppingBag, Copy, Check, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';

interface PurchasedPrompt {
  id: string;
  title: string;
  content_es: string;
  content_en: string;
  category: string;
  tags: string[];
  media_url?: string;
  media_type?: string;
  purchasedAt: string;
}

export default function MyPurchasedPrompts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<PurchasedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPurchasedPrompts();
    }
  }, [user?.id]);

  const fetchPurchasedPrompts = async () => {
    try {
      const response = await fetch(`/api/stripe/purchased-prompts/${user?.id}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching purchased prompts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus prompts comprados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copiado',
        description: 'Prompt copiado al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el prompt',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            No tienes prompts comprados
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explora el marketplace para comprar prompts
          </p>
          <div className="mt-6">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              data-testid="button-go-dashboard"
            >
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Mis Prompts Comprados
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {prompts.length} {prompts.length === 1 ? 'prompt comprado' : 'prompts comprados'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prompts.map((prompt) => (
          <Card key={prompt.id} data-testid={`card-prompt-${prompt.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{prompt.title}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comprado el {new Date(prompt.purchasedAt).toLocaleDateString('es-ES')}
                  </p>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {prompt.media_url && (
                  <div className="ml-4">
                    {prompt.media_type === 'video' ? (
                      <video
                        src={prompt.media_url}
                        className="w-32 h-32 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={prompt.media_url}
                        alt={prompt.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prompt (Español)
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.content_es, `${prompt.id}-es`)}
                      data-testid={`button-copy-es-${prompt.id}`}
                    >
                      {copiedId === `${prompt.id}-es` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={prompt.content_es}
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid={`textarea-content-es-${prompt.id}`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prompt (English)
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.content_en, `${prompt.id}-en`)}
                      data-testid={`button-copy-en-${prompt.id}`}
                    >
                      {copiedId === `${prompt.id}-en` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={prompt.content_en}
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid={`textarea-content-en-${prompt.id}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
