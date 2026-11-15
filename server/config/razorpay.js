import Razorpay from 'razorpay';
import { env } from './env.js';

let _client;
export function getRazorpay() {
  if (!_client) {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _client = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  }
  return _client;
}
