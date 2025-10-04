import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('WARNING: STRIPE_SECRET_KEY not configured');
}
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
}) : null;

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// POST /api/stripe/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { items, userId, userEmail, userName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate total from items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = items.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
    const total = subtotal - discount;

    // Create or get Stripe customer
    let customerId = null;
    if (userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          metadata: {
            userId: userId || 'guest'
          }
        });
        customerId = customer.id;
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId: userId || 'guest',
        itemCount: items.length,
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })))
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Error creating payment intent',
      message: error.message 
    });
  }
});

// POST /api/stripe/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('WARNING: STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);

      // Create order in database
      try {
        const metadata = paymentIntent.metadata;
        const items = JSON.parse(metadata.items || '[]');

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: metadata.userId,
            status: 'completed',
            subtotal: paymentIntent.amount / 100,
            discount: 0,
            total: paymentIntent.amount / 100,
            stripe_payment_intent_id: paymentIntent.id,
            payment_method: 'stripe',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          prompt_id: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          discount: 0,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Create download links for each item
        for (const item of items) {
          const downloadToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

          await supabase
            .from('downloads')
            .insert({
              user_id: metadata.userId,
              prompt_id: item.id,
              order_id: order.id,
              download_token: downloadToken,
              expires_at: expiresAt.toISOString(),
              download_count: 0,
              max_downloads: 5,
            });
        }

        console.log('Order created successfully:', order.id);
      } catch (error) {
        console.error('Error creating order:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update order status to failed
      try {
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id);
      } catch (error) {
        console.error('Error updating failed order:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// GET /api/stripe/orders/:userId - Get user orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          prompts (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// GET /api/stripe/purchased-prompts/:userId - Get purchased prompts for user
router.get('/purchased-prompts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        order_items (
          prompts (
            id,
            title,
            content_es,
            content_en,
            category,
            tags,
            media_url,
            media_type
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Extract unique prompts from all orders
    const promptsMap = new Map();
    orders?.forEach(order => {
      order.order_items?.forEach(item => {
        if (item.prompts && !promptsMap.has(item.prompts.id)) {
          promptsMap.set(item.prompts.id, {
            ...item.prompts,
            purchasedAt: order.created_at
          });
        }
      });
    });

    const purchasedPrompts = Array.from(promptsMap.values());

    res.json({ prompts: purchasedPrompts });
  } catch (error) {
    console.error('Error fetching purchased prompts:', error);
    res.status(500).json({ error: 'Error fetching purchased prompts' });
  }
});

// GET /api/stripe/download/:token - Download prompt with token
router.get('/download/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Get download record
    const { data: download, error: downloadError } = await supabase
      .from('downloads')
      .select(`
        *,
        prompts (*)
      `)
      .eq('download_token', token)
      .single();

    if (downloadError || !download) {
      return res.status(404).json({ error: 'Download link not found or expired' });
    }

    // Check if expired
    if (new Date(download.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    // Check download limit
    if (download.download_count >= download.max_downloads) {
      return res.status(403).json({ error: 'Download limit reached' });
    }

    // Increment download count
    await supabase
      .from('downloads')
      .update({ download_count: download.download_count + 1 })
      .eq('id', download.id);

    // Return prompt content
    res.json({
      prompt: download.prompts,
      downloadCount: download.download_count + 1,
      maxDownloads: download.max_downloads,
      expiresAt: download.expires_at,
    });
  } catch (error) {
    console.error('Error downloading prompt:', error);
    res.status(500).json({ error: 'Error downloading prompt' });
  }
});

export default router;
