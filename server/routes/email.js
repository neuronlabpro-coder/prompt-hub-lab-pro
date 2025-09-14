import express from 'express';
import { authenticateUser } from './auth.js';

const router = express.Router();

// Send email (simplified implementation)
router.post('/send', authenticateUser, async (req, res) => {
  try {
    const { to, template_id, variables } = req.body;

    if (!to || !template_id || !variables) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For now, we'll just log the email and return success
    // In production, you'd integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Email send attempt:', {
      to,
      template_id,
      variables,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      email_id: `email_${Date.now()}`
    });

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;