import dotenv from './server/node_modules/dotenv/lib/main.js';
dotenv.config({ path: '.env' });
import Razorpay from './server/node_modules/razorpay/dist/razorpay.js';
const r = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
try {
  const o = await r.orders.create({ amount: 19900, currency: 'INR', receipt: 'test_1' });
  console.log('OK', o.id);
} catch(e) {
  console.error('RAZORPAY ERROR:', e.message, JSON.stringify(e.error));
}
