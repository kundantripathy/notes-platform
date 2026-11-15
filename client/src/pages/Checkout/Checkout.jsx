import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, createOrder, verifyPayment, applyCoupon } from '../../services/productService.js';
import { formatINR } from '../../utils/format.js';
import CreatorBar from '../../components/CreatorBar/CreatorBar.jsx';
import { ShieldIcon } from '../../components/Icons.jsx';
import './Checkout.css';

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
  const rzpRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | paying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);   // { code, discountAmount, finalPrice }
  const [couponStatus, setCouponStatus] = useState('idle'); // idle | checking | valid | invalid

  useEffect(() => {
    let cancelled = false;
    getProduct(id)
      .then((p) => { if (!cancelled) setProduct(p); })
      .catch(() => { if (!cancelled) setErrorMsg('Product not found.'); });
    return () => { cancelled = true; };
  }, [id]);

  const finalPrice = coupon ? coupon.finalPrice : product?.sellingPrice ?? 0;
  const savings = product ? product.originalPrice - finalPrice : 0;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponStatus('checking');
    try {
      const data = await applyCoupon(id, couponCode.trim());
      setCoupon(data);
      setCouponStatus('valid');
    } catch (err) {
      setCoupon(null);
      setCouponStatus('invalid');
    }
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponCode('');
    setCouponStatus('idle');
  }

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
      orderData = await createOrder(id, coupon?.code);
    } catch (err) {
      setErrorMsg(err.message || 'Could not create payment order. Please try again.');
      setStatus('error');
      return;
    }

    const options = {
      key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      name: orderData.sellerName,
      description: orderData.product.name.replace(/[^\x20-\x7E]/g, '').trim(),
      order_id: orderData.order.id,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      prefill: { name, email, contact: phone },
      notes: {
        product_id: orderData.product.id,
        product_name: orderData.product.name,
        coupon: coupon?.code || '',
        purpose: 'Purchase of Digital Educational Notes and Study Materials',
      },
      theme: { color: '#0a2f2a' },
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
      modal: { ondismiss: () => { if (status !== 'success') setStatus('idle'); } },
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

        {/* Product row */}
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

        {/* Prefill form */}
        <div className="co-fields">
          <input className="co-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="co-input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="co-input" type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <hr className="co-rule" />

        {/* Coupon */}
        {couponStatus !== 'valid' ? (
          <div className="co-coupon">
            <input
              className="co-input co-coupon__input"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus('idle'); }}
            />
            <button
              className="btn btn--outline co-coupon__btn"
              onClick={handleApplyCoupon}
              disabled={couponStatus === 'checking' || !couponCode.trim()}
            >
              {couponStatus === 'checking' ? '…' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="co-coupon-applied">
            <span>🎉 <strong>{coupon.code}</strong> applied — you save {formatINR(coupon.discountAmount)}</span>
            <button className="co-coupon-remove" onClick={handleRemoveCoupon}>✕</button>
          </div>
        )}
        {couponStatus === 'invalid' && <p className="co-coupon-err">Invalid or expired coupon.</p>}

        <hr className="co-rule" />

        {/* Price breakdown */}
        <div className="co-price-row">
          <span>MRP</span>
          <s className="co-original">{formatINR(product.originalPrice)}</s>
        </div>
        {product.discount > 0 && (
          <div className="co-price-row co-price-row--saving">
            <span>Product discount</span>
            <span className="co-saving">− {formatINR(product.originalPrice - product.sellingPrice)}</span>
          </div>
        )}
        {coupon && (
          <div className="co-price-row co-price-row--saving">
            <span>Coupon ({coupon.code})</span>
            <span className="co-saving">− {formatINR(coupon.discountAmount)}</span>
          </div>
        )}
        <div className="co-price-row co-price-row--total">
          <span>You Pay</span>
          <span className="co-final">
            {formatINR(finalPrice)}
            {savings > 0 && <em>{Math.round((savings / product.originalPrice) * 100)}% off</em>}
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
          {status === 'paying' ? 'Opening Payment…' : `Pay ${formatINR(finalPrice)}`}
        </button>

        <p className="co-note">Powered by Razorpay · UPI, Cards, Net Banking, Wallets accepted</p>
      </article>
    </div>
  );
}
