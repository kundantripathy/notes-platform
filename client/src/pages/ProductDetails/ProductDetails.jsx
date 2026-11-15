import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreatorBar from '../../components/CreatorBar/CreatorBar.jsx';
import { DocIcon, VideoIcon, ShieldIcon, ClockIcon } from '../../components/Icons.jsx';
import { getProduct } from '../../services/productService.js';
import { formatINR } from '../../utils/format.js';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError('');
    getProduct(id)
      .then((p) => { if (!cancelled) setProduct(p); })
      .catch(() => { if (!cancelled) setError('This product is not available.'); });
    return () => { cancelled = true; };
  }, [id]);

  const isCall = product?.type === 'video_call';

  return (
    <div className="pd-wrap">
      <CreatorBar backTo="/" />

      {error && <div className="card empty" role="alert">{error}</div>}
      {!error && !product && <div className="spinner" aria-label="Loading" />}

      {product && (
        <article className="pd-card">

          {/* Title + type badge */}
          <h1 className="pd-title">{product.name}</h1>
          <span className="pd-type-badge">
            {isCall ? <VideoIcon width={11} height={11} /> : <DocIcon width={11} height={11} />}
            {isCall ? 'Video Call' : 'Digital Product'}
          </span>

          {/* Main image */}
          <div className="pd-image">
            {product.image || product.thumbnail
              ? <img src={product.image || product.thumbnail} alt={product.name} />
              : <span className="pd-image-fallback">{product.name}</span>}
          </div>

          {/* Description */}
          {product.description && (
            <p className="pd-desc">{product.description}</p>
          )}

          {/* What's included */}
          {product.subjects?.length > 0 && (
            <div className="pd-section">
              <h2 className="pd-section-title">What's Included</h2>
              <ul className="pd-subjects">
                {product.subjects.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <ul className="pd-features">
              {product.features.map((f) => (
                <li key={f}><span className="pd-check" aria-hidden="true">✔</span>{f}</li>
              ))}
            </ul>
          )}

          {/* Security tags */}
          <div className="pd-tags">
            <span><ShieldIcon width={12} height={12} /> Secure Payment</span>
            {!isCall && <span><ClockIcon width={12} height={12} /> Instant Access</span>}
          </div>

          <hr className="pd-rule" />

          {/* Price + CTA */}
          <div className="pd-footer">
            <div className="pd-price">
              <strong>{formatINR(product.sellingPrice)}.00</strong>
              {product.discount > 0 && <s>{formatINR(product.originalPrice)}.00</s>}
              {product.discount > 0 && <em>{product.discount}% off</em>}
            </div>
            <button
              className="btn btn--primary btn--pill pd-buy"
              onClick={() => navigate(`/checkout/${product._id}`)}
            >
              Proceed to Payment
            </button>
          </div>

        </article>
      )}
    </div>
  );
}
