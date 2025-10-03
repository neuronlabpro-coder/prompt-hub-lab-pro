import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

// Middleware para verificar plan PRO+
const requireProPlan = async (req, res, next) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('plan')
    .eq('id', req.user.id)
    .single();

  if (error || !userData) {
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }

  const proPlan = ['pro', 'business', 'plus'].includes(userData.plan);
  if (!proPlan) {
    return res.status(403).json({ 
      error: 'API keys are only available for PRO, Business, and Plus plans',
      upgrade_url: '/pricing'
    });
  }

  req.userPlan = userData.plan;
  next();
};

// Generar API Key única
const generateApiKey = () => {
  const prefix = 'ph';  // PromptHub prefix
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomPart}`;
};

// GET /api/api-keys - Listar API keys del usuario
router.get('/', requireAuth, requireProPlan, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, prefix, last_used, created_at, expires_at, is_active')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({ error: 'Failed to fetch API keys' });
    }

    res.json({ 
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in GET /api/api-keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/api-keys - Crear nueva API key
router.post('/', requireAuth, requireProPlan, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    // Generar la key (solo se muestra una vez)
    const apiKey = generateApiKey();
    const prefix = apiKey.substring(0, 8); // "ph_xxxxx"

    // Hash de la key para almacenar de forma segura
    const saltRounds = 10;
    const keyHash = await bcrypt.hash(apiKey, saltRounds);

    // Guardar en la base de datos
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        key_hash: keyHash,
        prefix: prefix,
        is_active: true
      })
      .select('id, name, prefix, created_at')
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return res.status(500).json({ error: 'Failed to create API key' });
    }

    // Retornar la key completa SOLO en la creación
    res.json({
      success: true,
      data: {
        ...data,
        api_key: apiKey  // Solo se muestra aquí
      },
      message: 'API key created successfully. Save it now, you won\'t be able to see it again!'
    });
  } catch (error) {
    console.error('Error in POST /api/api-keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/api-keys/:id - Revocar API key
router.delete('/:id', requireAuth, requireProPlan, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la key pertenece al usuario
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Eliminar la key
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting API key:', deleteError);
      return res.status(500).json({ error: 'Failed to delete API key' });
    }

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/api-keys/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/api-keys/:id - Actualizar nombre de API key
router.patch('/:id', requireAuth, requireProPlan, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    // Verificar que la key pertenece al usuario
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Actualizar nombre
    const { data, error } = await supabase
      .from('api_keys')
      .update({ name: name.trim() })
      .eq('id', id)
      .select('id, name, prefix, created_at')
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return res.status(500).json({ error: 'Failed to update API key' });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in PATCH /api/api-keys/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware para autenticar con API Key (para usar en otros endpoints)
export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    // Buscar todas las keys activas
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, user_id, key_hash, is_active')
      .eq('is_active', true);

    if (error || !keys) {
      return res.status(500).json({ error: 'Failed to verify API key' });
    }

    // Comparar con bcrypt
    let validKey = null;
    for (const key of keys) {
      const isValid = await bcrypt.compare(apiKey, key.key_hash);
      if (isValid) {
        validKey = key;
        break;
      }
    }

    if (!validKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Actualizar last_used
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', validKey.id);

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', validKey.user_id)
      .single();

    if (userError || !user) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    req.user = user;
    req.apiKeyId = validKey.id;
    next();
  } catch (error) {
    console.error('Error in API key authentication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default router;
