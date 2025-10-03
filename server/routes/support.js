import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// CREATE a new support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { subject, message, category = 'general', priority = 'medium' } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Asunto y mensaje son requeridos' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        user_id: user.id,
        subject,
        message,
        category,
        priority,
        status: 'open'
      }])
      .select(`
        id,
        subject,
        message,
        category,
        priority,
        status,
        created_at
      `)
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Ticket creado exitosamente',
      data 
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, error: 'Error al crear ticket' });
  }
});

// GET user's tickets
router.get('/tickets/my', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { status, category } = req.query;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    let query = supabase
      .from('support_tickets')
      .select(`
        id,
        subject,
        message,
        category,
        priority,
        status,
        created_at,
        updated_at,
        last_response_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar tickets' });
  }
});

// GET ticket details with responses
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        id,
        user_id,
        subject,
        message,
        category,
        priority,
        status,
        created_at,
        updated_at,
        assigned_to,
        users!support_tickets_assigned_to_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (ticketError) throw ticketError;

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = ['admin', 'superadmin'].includes(userData?.role);
    const isOwner = ticket.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Sin permisos' });
    }

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('support_responses')
      .select(`
        id,
        message,
        is_admin_response,
        created_at,
        user_id,
        users (
          id,
          full_name,
          email
        )
      `)
      .eq('ticket_id', id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (responsesError) throw responsesError;

    res.json({
      success: true,
      data: {
        ticket,
        responses: responses || []
      }
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar ticket' });
  }
});

// POST reply to ticket
router.post('/tickets/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    if (!message) {
      return res.status(400).json({ success: false, error: 'Mensaje es requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    // Get ticket and check permissions
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket no encontrado' });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = ['admin', 'superadmin'].includes(userData?.role);
    const isOwner = ticket.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Sin permisos' });
    }

    // Create response
    const { data: response, error: responseError } = await supabase
      .from('support_responses')
      .insert([{
        ticket_id: id,
        user_id: user.id,
        message,
        is_admin_response: isAdmin,
        is_internal: false
      }])
      .select(`
        id,
        message,
        is_admin_response,
        created_at,
        users (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (responseError) throw responseError;

    // Update ticket status if admin replied
    if (isAdmin) {
      await supabase
        .from('support_tickets')
        .update({ status: 'waiting_response' })
        .eq('id', id);
    }

    res.json({
      success: true,
      message: 'Respuesta enviada',
      data: response
    });
  } catch (error) {
    console.error('Reply ticket error:', error);
    res.status(500).json({ success: false, error: 'Error al enviar respuesta' });
  }
});

// ADMIN: Get all tickets
router.get('/admin/tickets', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { status, category, priority, assigned } = req.query;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['admin', 'superadmin'].includes(userData?.role)) {
      return res.status(403).json({ success: false, error: 'Sin permisos de admin' });
    }

    let query = supabase
      .from('support_tickets')
      .select(`
        id,
        subject,
        message,
        category,
        priority,
        status,
        created_at,
        updated_at,
        last_response_at,
        user_id,
        assigned_to,
        users!support_tickets_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);
    if (assigned === 'me') query = query.eq('assigned_to', user.id);
    if (assigned === 'unassigned') query = query.is('assigned_to', null);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar tickets' });
  }
});

// ADMIN: Update ticket status
router.patch('/admin/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['admin', 'superadmin'].includes(userData?.role)) {
      return res.status(403).json({ success: false, error: 'Sin permisos' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Ticket actualizado' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar ticket' });
  }
});

// GET support stats
router.get('/admin/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('status, category, priority, created_at');

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      byCategory: {},
      byPriority: {}
    };

    tickets.forEach(ticket => {
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Support stats error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar estadísticas' });
  }
});

export default router;
