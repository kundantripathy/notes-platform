import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/format.js';
import { DocIcon, VideoIcon, ArrowRight, ClockIcon } from '../Icons.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const open = () => navigate(`/product/${product._id}`);
  const isCall = product.type === 'video_call';
  const chips = isCall ? (product.features || []).slice(0, 2) : [];

  return (
    <article
      className="pcard"
      onClick={open}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
    >
      <div className="pcard__top">
        <div className="pcard__thumb">
          {product.thumbnail
            ? <img src={product.thumbnail} alt="" loading="lazy" />
            : <span>{[...product.name][0]}</span>}
        </div>
        <div className="pcard__info">
          <h3 className="pcard__title">{product.name}</h3>
          <p className="pcard__desc">{product.shortDescription}</p>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="pcard__chips">
          {chips.map((c, i) => (
            <span key={c} className="pcard__chip">
              {i === 0 ? <ClockIcon width={11} height={11} /> : null}{c}
            </span>
          ))}
        </div>
      )}

      <div className="pcard__strip">
        <span className="pcard__icon">{isCall ? <VideoIcon /> : <DocIcon />}</span>
        <div className="pcard__meta">
          <span className="pcard__type">{isCall ? 'Video Call' : 'Digital Product'}</span>
          <span className="pcard__price">
            <strong>{formatINR(product.sellingPrice)}</strong>
            {product.discount > 0 && <s>{formatINR(product.originalPrice)}</s>}
            {product.discount > 0 && <em>{product.discount}% off</em>}
          </span>
        </div>
        <button
          className="pcard__cta"
          onClick={(e) => { e.stopPropagation(); open(); }}
          aria-label={`${isCall ? 'Pick a time' : 'Shop Now'} – ${product.name}`}
        >
          {isCall ? 'Pick a time' : 'Shop Now'} <ArrowRight width={13} height={13} />
        </button>
      </div>
    </article>
  );
}
