import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email válido es requerido' 
      });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return res.status(400).json({ 
          success: false, 
          error: 'Este email ya está suscrito' 
        });
      }
      
      // Reactivate subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          is_active: true,
          name: name || existing.name,
          subscribed_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;

      return res.json({ 
        success: true, 
        message: 'Suscripción reactivada exitosamente' 
      });
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase(),
          name: name || null,
          is_active: true,
          subscribed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // TODO: Send welcome email here
    // await sendWelcomeEmail(email, name);

    res.json({ 
      success: true, 
      message: '¡Gracias por suscribirte! Revisa tu email.',
      data 
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al procesar la suscripción' 
    });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email es requerido' 
      });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Te has desuscrito exitosamente' 
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al procesar la desuscripción' 
    });
  }
});

// Get all subscribers (admin only)
router.get('/subscribers', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'No autorizado' 
      });
    }

    const { data, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    const activeCount = data.filter(s => s.is_active).length;

    res.json({ 
      success: true, 
      data,
      stats: {
        total: count,
        active: activeCount,
        inactive: count - activeCount
      }
    });
  } catch (error) {
    console.error('Newsletter subscribers error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener suscriptores' 
    });
  }
});

// Get subscriber stats
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('is_active, subscribed_at');

    if (error) throw error;

    const active = data.filter(s => s.is_active).length;
    const total = data.length;
    
    // Count new subscribers this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = data.filter(s => {
      const subDate = new Date(s.subscribed_at);
      return subDate >= thisMonth && s.is_active;
    }).length;

    res.json({ 
      success: true, 
      stats: {
        total,
        active,
        inactive: total - active,
        newThisMonth
      }
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener estadísticas' 
    });
  }
});

export default router;
