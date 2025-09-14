import express from 'express';
import { db } from '../db.js';
import { prompts, promptStats } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { authenticateUser } from './auth.js';

const router = express.Router();

// Translate prompt
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { promptId, targetLanguage } = req.body;

    if (!promptId || !targetLanguage || !['es', 'en'].includes(targetLanguage)) {
      return res.status(400).json({ error: 'Invalid prompt ID or target language' });
    }

    // Get original prompt
    const prompt = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, promptId))
      .limit(1);

    if (prompt.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const originalPrompt = prompt[0];
    const sourceLanguage = targetLanguage === 'es' ? 'en' : 'es';
    const sourceContent = sourceLanguage === 'es' ? originalPrompt.contentEs : originalPrompt.contentEn;
    
    const systemPrompt = targetLanguage === 'es' 
      ? 'Eres un traductor profesional especializado en prompts de IA. Traduce el siguiente prompt del inglés al español manteniendo el significado exacto, el tono profesional y preservando todas las variables entre llaves {como_esta}. Devuelve SOLO la traducción, sin explicaciones adicionales.'
      : 'You are a professional translator specialized in AI prompts. Translate the following prompt from Spanish to English maintaining the exact meaning, professional tone and preserving all variables in braces {like_this}. Return ONLY the translation, without additional explanations.';

    // Call OpenAI for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sourceContent }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const translatedContent = data.choices[0].message.content;

    // Update the prompt with the translation
    const updateData = targetLanguage === 'es' 
      ? { contentEs: translatedContent }
      : { contentEn: translatedContent };

    await db
      .update(prompts)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(prompts.id, promptId));

    // Update prompt stats
    await db
      .insert(promptStats)
      .values({
        promptId,
        translations: 1
      })
      .onConflictDoUpdate({
        target: promptStats.promptId,
        set: {
          translations: sql`${promptStats.translations} + 1`,
          updatedAt: new Date()
        }
      });

    // Update character and token counts
    const characters = translatedContent.length;
    const tokens = Math.ceil(characters / 4);

    const statsUpdate = targetLanguage === 'es'
      ? { charactersEs: characters, tokensEs: tokens }
      : { charactersEn: characters, tokensEn: tokens };

    await db
      .update(promptStats)
      .set({
        ...statsUpdate,
        updatedAt: new Date()
      })
      .where(eq(promptStats.promptId, promptId));

    res.json({
      success: true,
      translatedContent,
      targetLanguage,
    });

  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;