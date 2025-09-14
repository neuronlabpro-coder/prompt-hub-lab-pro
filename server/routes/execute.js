import express from 'express';
import { db } from '../db.js';
import { executions, users, tokenPrices } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateUser } from './auth.js';

const router = express.Router();

// Execute prompt
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { promptId, provider, model, parameters, content } = req.body;

    if (!promptId || !provider || !model || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check user token limits
    const estimatedTokens = Math.ceil(content.length / 4);
    
    if (req.user.tokensUsed + estimatedTokens > req.user.tokensLimit) {
      return res.status(429).json({ error: 'Token limit exceeded' });
    }

    // Get model pricing
    const pricing = await db
      .select()
      .from(tokenPrices)
      .where(eq(tokenPrices.model, model))
      .limit(1);

    const startTime = Date.now();
    let result = '';
    let inputTokens = estimatedTokens;
    let outputTokens = 0;
    let cost = 0;

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content }],
            ...parameters,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'OpenAI API error');
        }

        result = data.choices[0].message.content;
        inputTokens = data.usage?.prompt_tokens || estimatedTokens;
        outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4);
        
      } else if (provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'PromptHub v2',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content }],
            ...parameters,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'OpenRouter API error');
        }

        result = data.choices[0].message.content;
        inputTokens = data.usage?.prompt_tokens || estimatedTokens;
        outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4);
      }

      // Calculate cost
      if (pricing.length > 0) {
        const pricingData = pricing[0];
        const inputCost = (inputTokens / 1000000) * parseFloat(pricingData.inputCostBase) * (1 + parseFloat(pricingData.inputMarginPercent) / 100);
        const outputCost = (outputTokens / 1000000) * parseFloat(pricingData.outputCostBase) * (1 + parseFloat(pricingData.outputMarginPercent) / 100);
        cost = (inputCost + outputCost) * parseFloat(pricingData.fxRate);
      }

      const latency = Date.now() - startTime;
      const totalTokens = inputTokens + outputTokens;

      // Save execution record
      await db.insert(executions).values({
        promptId,
        userId: req.user.id,
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: cost.toString(),
        latency,
        result,
        parameters: parameters || {},
      });

      // Update user token usage
      await db
        .update(users)
        .set({ 
          tokensUsed: req.user.tokensUsed + totalTokens,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id));

      res.json({
        result,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          latency,
        },
      });

    } catch (apiError) {
      console.error('API Error:', apiError);
      res.status(500).json({ error: apiError.message });
    }

  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user executions
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const userExecutions = await db
      .select()
      .from(executions)
      .where(eq(executions.userId, req.user.id))
      .orderBy(executions.createdAt)
      .limit(parseInt(limit))
      .offset(offset);

    res.json(userExecutions);
  } catch (error) {
    console.error('Error fetching execution history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

export default router;