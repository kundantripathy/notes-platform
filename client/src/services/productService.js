import { api } from './api.js';

export const getSeller = () => api('/seller').then((d) => d.seller);
export const getProducts = (type = 'all') =>
  api(`/products${type !== 'all' ? `?type=${encodeURIComponent(type)}` : ''}`).then((d) => d.products);
export const getProduct = (id) => api(`/products/${id}`).then((d) => d.product);
export const createOrder = (productId, couponCode) =>
  api('/checkout/create-order', { method: 'POST', body: { productId, couponCode } });
export const applyCoupon = (productId, couponCode) =>
  api('/checkout/apply-coupon', { method: 'POST', body: { productId, couponCode } });
export const verifyPayment = (payload) => api('/checkout/verify', { method: 'POST', body: payload });
