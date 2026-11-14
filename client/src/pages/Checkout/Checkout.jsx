import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products.js';
import { createOrder, verifyPayment } from '../../services/productService.js';
import { formatINR } from '../../utils/format.js';
import CreatorBar from '../../components/CreatorBar/CreatorBar.jsx';
import { ShieldIcon } from '../../components/Icons.jsx';
import './Checkout.css';

// Razorpay SDK is loaded once via a <script> tag injected into <head>.
function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | paying | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const rzpRef = useRef(null);

  // Resolve product from static data (API fallback handled in ProductDetails already).
  useEffect(() => {
    const p = PRODUCTS.find((x) => x._id === id);
    if (p) setProduct(p);
    else setErrorMsg('Product not found.');
  }, [id]);

  async function handlePay() {
    setStatus('paying');
    setErrorMsg('');

    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded) {
      setErrorMsg('Could not load payment SDK. Check your internet connection.');
      setStatus('error');
      return;
    }

    let orderData;
    try {
      orderData = await createOrder(id);
    } catch (err) {
      setErrorMsg(err.message || 'Could not create payment order. Please try again.');
      setStatus('error');
      return;
    }

    const options = {
      // ── Merchant identity ──────────────────────────────────────────────────
      // "name" and "image" here are the business name and logo shown in the
      // Razorpay modal. The verified legal name on your Razorpay account
      // (set in the Dashboard) takes precedence for regulated fields.
      key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      name: 'Aman Singh Nayak',
      description: orderData.product.description || orderData.product.name,
      image: '', // Set to your logo URL, e.g. 'https://yourdomain.com/logo.png'

      // ── Order ──────────────────────────────────────────────────────────────
      order_id: orderData.order.id,
      amount: orderData.order.amount,   // paise — set by server, not frontend
      currency: orderData.order.currency,

      // ── Pre-fill customer fields (optional, improves UX) ──────────────────
      prefill: {
        name: '',    // filled by customer at checkout
        email: '',
        contact: '',
      },

      // ── Notes visible in Razorpay Dashboard ───────────────────────────────
      notes: {
        product_id: orderData.product.id,
        product_name: orderData.product.name,
        purpose: 'Purchase of Digital Educational Notes and Study Materials',
      },

      theme: { color: '#0a2f2a' },

      // ── Callbacks ─────────────────────────────────────────────────────────
      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setStatus('success');
          navigate(`/payment-success/${response.razorpay_order_id}`);
        } catch {
          setErrorMsg('Payment received but verification failed. Contact support.');
          setStatus('error');
        }
      },

      modal: {
        ondismiss: () => {
          if (status !== 'success') setStatus('idle');
        },
      },
    };

    rzpRef.current = new window.Razorpay(options);
    rzpRef.current.on('payment.failed', (resp) => {
      setErrorMsg(`Payment failed: ${resp.error.description}`);
      setStatus('error');
    });
    rzpRef.current.open();
  }

  if (errorMsg && !product) {
    return (
      <div className="co-wrap">
        <CreatorBar backTo={`/product/${id}`} />
        <div className="card empty" role="alert">{errorMsg}</div>
      </div>
    );
  }

  if (!product) return <div className="co-wrap"><div className="spinner" aria-label="Loading" /></div>;

  return (
    <div className="co-wrap">
      <CreatorBar backTo={`/product/${id}`} />

      <article className="co-card">
        <h1 className="co-title">Order Summary</h1>

        {/* Product summary */}
        <div className="co-product">
          <div className="co-product__thumb">
            {product.thumbnail
              ? <img src={product.thumbnail} alt="" />
              : <span>{[...product.name][0]}</span>}
          </div>
          <div className="co-product__info">
            <p className="co-product__name">{product.name}</p>
            <p className="co-product__type">{product.type === 'video_call' ? 'Video Call' : 'Digital Product'}</p>
          </div>
        </div>

        <hr className="co-rule" />

        {/* Price breakdown */}
        <div className="co-price-row">
          <span>Price</span>
          <s className="co-original">{formatINR(product.originalPrice)}</s>
        </div>
        <div className="co-price-row co-price-row--total">
          <span>You Pay</span>
          <span className="co-final">
            {formatINR(product.sellingPrice)}
            <em>{product.discount}% off</em>
          </span>
        </div>

        <hr className="co-rule" />

        {/* Security badges */}
        <div className="co-badges">
          <span><ShieldIcon width={13} height={13} /> Secure Payment</span>
          <span>🔒 256-bit SSL</span>
          <span>⚡ Instant Access</span>
        </div>

        {errorMsg && <p className="co-error" role="alert">{errorMsg}</p>}

        <button
          className="btn btn--primary btn--pill co-pay-btn"
          onClick={handlePay}
          disabled={status === 'paying'}
        >
          {status === 'paying' ? 'Opening Payment…' : `Pay ${formatINR(product.sellingPrice)}`}
        </button>

        <p className="co-note">
          Powered by Razorpay · UPI, Cards, Net Banking, Wallets accepted
        </p>
      </article>
    </div>
  );
}
