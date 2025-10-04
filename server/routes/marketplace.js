import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Discount mapping by plan
const PLAN_DISCOUNTS = {
  'free': 0,
  'starter': 10,
  'pro': 15,
  'business': 20,
  'plus': 20,
  'enterprise': 20
};

// GET all prompts for sale
router.get('/prompts', async (req, res) => {
  try {
    const { category, sort = 'recent', search } = req.query;

    let query = supabase
      .from('prompts')
      .select(`
        id,
        title,
        content_es,
        content_en,
        type,
        tags,
        created_at,
        category,
        price,
        sales_count,
        is_for_sale,
        discount_eligible
      `);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Sorting
    if (sort === 'popular') {
      query = query.order('sales_count', { ascending: false });
    } else if (sort === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_high') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter only prompts for sale and add defaults for missing fields
    const enrichedData = (data || [])
      .filter(prompt => prompt.is_for_sale)
      .map(prompt => ({
        ...prompt,
        price: prompt.price || 0,
        sales_count: prompt.sales_count || 0
      }));

    res.json({ success: true, data: enrichedData });
  } catch (error) {
    console.error('Marketplace prompts error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar prompts del marketplace' });
  }
});

// GET prompt details with user's discount
router.get('/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    // Get prompt details
    const { data: prompt, error: promptError} = await supabase
      .from('prompts')
      .select(`
        id,
        title,
        content_es,
        content_en,
        type,
        tags,
        created_at,
        category,
        price,
        sales_count,
        is_for_sale,
        discount_eligible
      `)
      .eq('id', id)
      .single();

    if (promptError) throw promptError;

    let userDiscount = 0;
    const basePrice = prompt.price || 0;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user.id)
          .single();

        if (userData) {
          userDiscount = PLAN_DISCOUNTS[userData.plan] || 0;
        }
      }
    }

    const discountedPrice = basePrice * (1 - userDiscount / 100);

    res.json({
      success: true,
      data: {
        ...prompt,
        price: basePrice,
        sales_count: 0,
        discount_percent: userDiscount,
        final_price: discountedPrice
      }
    });
  } catch (error) {
    console.error('Prompt details error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar el prompt' });
  }
});

// POST purchase a prompt
router.post('/purchase', async (req, res) => {
  try {
    const { prompt_id, payment_method = 'stripe' } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Get user's plan
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    const userDiscount = PLAN_DISCOUNTS[userData?.plan || 'free'] || 0;

    // Get prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, price, is_for_sale')
      .eq('id', prompt_id)
      .single();

    if (promptError || !prompt.is_for_sale) {
      return res.status(404).json({ success: false, error: 'Prompt no disponible' });
    }

    // Check if already purchased
    const { data: existing } = await supabase
      .from('prompt_purchases')
      .select('id')
      .eq('prompt_id', prompt_id)
      .eq('buyer_id', user.id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Ya compraste este prompt' });
    }

    const finalPrice = prompt.price * (1 - userDiscount / 100);

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('prompt_purchases')
      .insert([{
        prompt_id,
        buyer_id: user.id,
        original_price: prompt.price,
        discount_percent: userDiscount,
        price_paid: finalPrice,
        payment_method,
        transaction_status: 'completed'
      }])
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    res.json({
      success: true,
      message: '¡Compra exitosa!',
      data: purchase
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, error: 'Error al procesar la compra' });
  }
});

// GET user's purchases
router.get('/my-purchases', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    const { data, error } = await supabase
      .from('prompt_purchases')
      .select(`
        id,
        price_paid,
        discount_percent,
        purchased_at,
        prompts (
          id,
          title,
          content_es,
          content_en,
          type,
          category
        )
      `)
      .eq('buyer_id', user.id)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('My purchases error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar tus compras' });
  }
});

// ADMIN: Mark prompt as for sale
router.post('/admin/set-for-sale', async (req, res) => {
  try {
    const { prompt_id, is_for_sale, price } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    // TODO: Add admin auth middleware
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['admin', 'superadmin'].includes(userData?.role)) {
      return res.status(403).json({ success: false, error: 'Sin permisos' });
    }

    // Note: is_for_sale and price columns don't exist in current schema
    // This endpoint is a placeholder for future implementation
    const { error } = await supabase
      .from('prompts')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', prompt_id);

    if (error) throw error;

    res.json({ success: true, message: 'Prompt actualizado' });
  } catch (error) {
    console.error('Set for sale error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar prompt' });
  }
});

// GET marketplace stats (admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const { data: purchases } = await supabase
      .from('prompt_purchases')
      .select('price_paid, created_at');

    const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.price_paid), 0);
    const totalSales = purchases.length;

    const { data: prompts } = await supabase
      .from('prompts')
      .select('id');

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalSales,
        activeProducts: prompts.length,
        avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
      }
    });
  } catch (error) {
    console.error('Marketplace stats error:', error);
    res.status(500).json({ success: false, error: 'Error al cargar estadísticas' });
  }
});

export default router;
