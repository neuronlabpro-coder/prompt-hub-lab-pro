import express from 'express';
import { db } from '../db.js';
import { prompts, promptVersions, promptStats } from '../../shared/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateUser } from './auth.js';

const router = express.Router();

// Improve prompt
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { promptId, language } = req.body;

    if (!promptId || !language || !['es', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Invalid prompt ID or language' });
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

    // Check if user can improve this prompt
    if (originalPrompt.type === 'user' && originalPrompt.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const improveConfig = {
      system_prompt: `Eres un experto en prompt engineering con más de 5 años optimizando prompts para modelos de IA. Tu objetivo es mejorar prompts existentes para hacerlos más efectivos, claros y robustos.

Objetivos de mejora:
- Claridad y especificidad en las instrucciones
- Estructura coherente y fácil de seguir
- Contexto adecuado para el modelo
- Manejo de edge cases y variaciones
- Optimización para mejores resultados
- Reducción de ambigüedades
- Mejora de la consistencia en outputs

Analiza el prompt original e identifica áreas de mejora. Mejora la claridad sin cambiar la intención original. Añade contexto relevante si falta. Estructura las instrucciones de forma lógica. Define claramente el formato de output esperado. Preserva variables y placeholders existentes.

Devuelve SOLO el prompt mejorado, sin explicaciones adicionales.`,
    };

    const originalContent = language === 'es' ? originalPrompt.contentEs : originalPrompt.contentEn;
    
    // Call OpenAI to improve the prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: improveConfig.system_prompt },
          { role: 'user', content: `Mejora este prompt:\n\n${originalContent}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const improvedContent = data.choices[0].message.content;

    // Get next version number
    const versions = await db
      .select({ version: promptVersions.version })
      .from(promptVersions)
      .where(eq(promptVersions.promptId, promptId))
      .orderBy(desc(promptVersions.version))
      .limit(1);

    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

    // Create new version
    const newVersion = await db
      .insert(promptVersions)
      .values({
        promptId,
        version: nextVersion,
        contentEs: language === 'es' ? improvedContent : originalPrompt.contentEs,
        contentEn: language === 'en' ? improvedContent : originalPrompt.contentEn,
        improvementReason: 'Automated improvement via AI',
      })
      .returning();

    // Update prompt stats
    await db
      .insert(promptStats)
      .values({
        promptId,
        improvements: 1
      })
      .onConflictDoUpdate({
        target: promptStats.promptId,
        set: {
          improvements: sql`${promptStats.improvements} + 1`,
          updatedAt: new Date()
        }
      });

    res.json({
      success: true,
      version: newVersion[0],
      improvedContent,
    });

  } catch (error) {
    console.error('Improve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;