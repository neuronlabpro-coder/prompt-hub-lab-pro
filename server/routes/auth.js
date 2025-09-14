import express from 'express';
import { db } from '../db.js';
import { users, plans } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Simple auth middleware placeholder
const authenticateUser = async (req, res, next) => {
  try {
    // For now, we'll use a simple approach
    // In production, you'd integrate with a proper auth service
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const userWithPlan = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        planId: users.planId,
        tokensUsed: users.tokensUsed,
        tokensLimit: users.tokensLimit,
        createdAt: users.createdAt,
        plan: {
          id: plans.id,
          name: plans.name,
          price: plans.price,
          tokensIncluded: plans.tokensIncluded,
          overagePrice: plans.overagePrice,
        }
      })
      .from(users)
      .leftJoin(plans, eq(users.planId, plans.id))
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (userWithPlan.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userWithPlan[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updated = await db
      .update(users)
      .set({
        name,
        email,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create or get user (for initial setup)
router.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.json(existingUser[0]);
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        role: 'user',
        planId: 'starter',
        tokensUsed: 0,
        tokensLimit: 500000
      })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user tokens
router.post('/tokens/update', authenticateUser, async (req, res) => {
  try {
    const { tokensUsed } = req.body;

    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return res.status(400).json({ error: 'Invalid tokens amount' });
    }

    const updated = await db
      .update(users)
      .set({
        tokensUsed: req.user.tokensUsed + tokensUsed,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating tokens:', error);
    res.status(500).json({ error: 'Failed to update tokens' });
  }
});

// Get all plans
router.get('/plans', async (req, res) => {
  try {
    const allPlans = await db
      .select()
      .from(plans)
      .where(eq(plans.active, true));

    res.json(allPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

export { authenticateUser };
export default router;