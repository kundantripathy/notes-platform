import express from 'express';
import crypto from 'node:crypto';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  if (!env.isProd) app.use(morgan('dev'));

  // Razorpay webhook — must receive the RAW body for HMAC verification.
  app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req, res) => {
      try {
        const sig = req.headers['x-razorpay-signature'];
        if (env.razorpayWebhookSecret && sig) {
          const expected = crypto
            .createHmac('sha256', env.razorpayWebhookSecret)
            .update(req.body)
            .digest('hex');
          if (expected !== sig) return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
        const event = JSON.parse(req.body.toString());
        // TODO Phase 7: handle payment.captured, order.paid, refund.created events here.
        console.log('[webhook]', event.event);
        res.json({ success: true });
      } catch {
        res.status(400).json({ success: false, message: 'Webhook error' });
      }
    },
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
