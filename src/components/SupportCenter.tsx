import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Clock, AlertCircle, CheckCircle2, Send, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Select } from './ui/Select';
import { useToast } from '../hooks/useToast';
import { useAuth } from './AuthProvider';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketResponse {
  id: string;
  message: string;
  is_admin_response: boolean;
  created_at: string;
  users: {
    full_name: string;
    email: string;
  };
}

const STATUS_COLORS = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  waiting_response: 'bg-purple-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500'
};

const STATUS_LABELS = {
  open: 'Abierto',
  in_progress: 'En Progreso',
  waiting_response: 'Esperando Respuesta',
  resolved: 'Resuelto',
  closed: 'Cerrado'
};

const CATEGORY_LABELS = {
  soporte: 'Soporte Técnico',
  general: 'Consulta General',
  ventas: 'Ventas',
  tecnico: 'Problema Técnico',
  billing: 'Facturación'
};

export function SupportCenter() {
  const { toast } = useToast();
  const { user, getToken } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);

  // New ticket form
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchMyTickets = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/support/tickets/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setResponses(data.data.responses || []);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTicket.subject || !newTicket.message) {
      toast.error('Error', 'Por favor completa todos los campos');
      return;
    }

    setCreating(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear ticket');
      }

      toast.success('Ticket creado', 'Te responderemos pronto');
      setNewTicket({ subject: '', message: '', category: 'general', priority: 'medium' });
      setShowNewTicket(false);
      fetchMyTickets();
    } catch (error: any) {
      toast.error('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newReply })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar respuesta');
      }

      toast.success('Respuesta enviada', 'El equipo de soporte la verá pronto');
      setNewReply('');
      fetchTicketDetails(selectedTicket.id);
      fetchMyTickets();
    } catch (error: any) {
      toast.error('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Inicia sesión</h3>
          <p className="text-gray-400">Debes iniciar sesión para acceder al soporte</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Cargando tickets...</p>
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
              <MessageCircle className="h-8 w-8" />
            </div>
            Centro de Soporte
          </h1>
          <p className="text-gray-400 mt-2">
            Gestiona tus tickets de soporte y obtén ayuda del equipo
          </p>
        </div>

        <Button
          onClick={() => setShowNewTicket(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
          data-testid="button-new-ticket"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes tickets</h3>
            <p className="text-gray-400 mb-4">Crea un ticket para obtener soporte</p>
            <Button onClick={() => setShowNewTicket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List Column */}
          <div className="lg:col-span-1 space-y-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'hover:border-gray-600'
                }`}
                onClick={() => setSelectedTicket(ticket)}
                data-testid={`ticket-${ticket.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">
                      {ticket.subject}
                    </h3>
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]}`} />
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {ticket.message}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS]}
                    </Badge>
                    <span className="text-gray-500">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ticket Details Column */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{selectedTicket.subject}</CardTitle>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge className={STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[selectedTicket.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[selectedTicket.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                        <span className="text-gray-400">
                          {formatDate(selectedTicket.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Tú</p>
                        <p className="text-xs text-gray-400">{formatDate(selectedTicket.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {/* Responses */}
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.is_admin_response
                          ? 'bg-green-900/20 border border-green-500/30'
                          : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          response.is_admin_response ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {response.users.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {response.is_admin_response ? '👨‍💼 Soporte' : response.users.full_name || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(response.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}

                  {/* Reply Form */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Escribe tu respuesta..."
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                          className="flex-1"
                          data-testid="input-ticket-reply"
                        />
                        <Button
                          onClick={handleSendReply}
                          disabled={sending || !newReply.trim()}
                          data-testid="button-send-reply"
                        >
                          {sending ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Selecciona un ticket para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Crear Nuevo Ticket</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNewTicket(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asunto *
                  </label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Describe brevemente tu problema o consulta"
                    required
                    data-testid="input-ticket-subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <option value="general">Consulta General</option>
                    <option value="soporte">Soporte Técnico</option>
                    <option value="ventas">Ventas</option>
                    <option value="tecnico">Problema Técnico</option>
                    <option value="billing">Facturación</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    placeholder="Describe detalladamente tu problema o consulta..."
                    required
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="textarea-ticket-message"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                    disabled={creating}
                    data-testid="button-create-ticket"
                  >
                    {creating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Crear Ticket
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTicket(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
