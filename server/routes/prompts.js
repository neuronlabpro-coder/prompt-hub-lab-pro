import express from 'express';
import { db } from '../db.js';
import { prompts, promptStats, categories, users } from '../../shared/schema.js';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

const router = express.Router();

// Get all prompts with stats and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, type, userId } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    
    if (category) {
      whereConditions.push(eq(prompts.category, category));
    }
    
    if (type) {
      whereConditions.push(eq(prompts.type, type));
    }
    
    if (userId) {
      whereConditions.push(eq(prompts.userId, userId));
    }
    
    if (search) {
      whereConditions.push(
        or(
          ilike(prompts.title, `%${search}%`),
          ilike(prompts.contentEs, `%${search}%`),
          ilike(prompts.contentEn, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        contentEs: prompts.contentEs,
        contentEn: prompts.contentEn,
        category: prompts.category,
        tags: prompts.tags,
        type: prompts.type,
        userId: prompts.userId,
        isFavorite: prompts.isFavorite,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        stats: {
          visits: promptStats.visits,
          copies: promptStats.copies,
          improvements: promptStats.improvements,
          translations: promptStats.translations,
          ctr: promptStats.ctr,
        }
      })
      .from(prompts)
      .leftJoin(promptStats, eq(prompts.id, promptStats.promptId))
      .where(whereClause)
      .orderBy(desc(prompts.createdAt))
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(prompts)
      .where(whereClause);

    res.json({
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get single prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        contentEs: prompts.contentEs,
        contentEn: prompts.contentEn,
        category: prompts.category,
        tags: prompts.tags,
        type: prompts.type,
        userId: prompts.userId,
        isFavorite: prompts.isFavorite,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        stats: {
          visits: promptStats.visits,
          copies: promptStats.copies,
          improvements: promptStats.improvements,
          translations: promptStats.translations,
          ctr: promptStats.ctr,
        }
      })
      .from(prompts)
      .leftJoin(promptStats, eq(prompts.id, promptStats.promptId))
      .where(eq(prompts.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Create new prompt
router.post('/', async (req, res) => {
  try {
    const { title, contentEs, contentEn, category, tags, userId } = req.body;

    if (!title || !contentEs || !contentEn || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPrompt = await db
      .insert(prompts)
      .values({
        title,
        contentEs,
        contentEn,
        category,
        tags: tags || [],
        type: 'user',
        userId
      })
      .returning();

    // Create initial stats record
    await db
      .insert(promptStats)
      .values({
        promptId: newPrompt[0].id,
        charactersEs: contentEs.length,
        charactersEn: contentEn.length,
        tokensEs: Math.ceil(contentEs.length / 4),
        tokensEn: Math.ceil(contentEn.length / 4),
      });

    res.status(201).json(newPrompt[0]);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update prompt
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contentEs, contentEn, category, tags, isFavorite } = req.body;

    const updated = await db
      .update(prompts)
      .set({
        title,
        contentEs,
        contentEn,
        category,
        tags,
        isFavorite,
        updatedAt: new Date()
      })
      .where(eq(prompts.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Update stats if content changed
    if (contentEs || contentEn) {
      await db
        .update(promptStats)
        .set({
          charactersEs: contentEs ? contentEs.length : undefined,
          charactersEn: contentEn ? contentEn.length : undefined,
          tokensEs: contentEs ? Math.ceil(contentEs.length / 4) : undefined,
          tokensEn: contentEn ? Math.ceil(contentEn.length / 4) : undefined,
        })
        .where(eq(promptStats.promptId, id));
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete prompt
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(prompts)
      .where(eq(prompts.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Increment prompt stats
router.post('/:id/stats/:field', async (req, res) => {
  try {
    const { id, field } = req.params;

    if (!['visits', 'copies', 'improvements', 'translations'].includes(field)) {
      return res.status(400).json({ error: 'Invalid stats field' });
    }

    // Upsert prompt stats
    await db
      .insert(promptStats)
      .values({
        promptId: id,
        [field]: 1
      })
      .onConflictDoUpdate({
        target: promptStats.promptId,
        set: {
          [field]: sql`${promptStats[field]} + 1`,
          updatedAt: new Date()
        }
      });

    // Update CTR if copies or visits changed
    if (field === 'copies' || field === 'visits') {
      await db
        .update(promptStats)
        .set({
          ctr: sql`CASE WHEN visits > 0 THEN (copies::numeric / visits::numeric) * 100 ELSE 0 END`
        })
        .where(eq(promptStats.promptId, id));
    }

    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categoriesResult = await db.select().from(categories);
    res.json(categoriesResult);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;