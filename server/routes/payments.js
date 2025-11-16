import express from 'express';
import Stripe from 'stripe';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// Create Payment Intent
router.post('/create-intent', authenticateUser, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { user_id: req.user.id },
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        user_id: req.user.id,
        ...metadata,
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
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process Refund
router.post('/refund', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const refundData = {
      payment_intent: paymentIntentId,
    };

    // Add optional amount for partial refunds
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    // Add optional reason
    if (reason && ['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100, // Convert back to dollars
      currency: refund.currency,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Payment Intent Status
router.get('/status/:paymentIntentId', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
