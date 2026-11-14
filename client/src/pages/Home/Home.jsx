import { useEffect, useState } from 'react';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import { SendIcon, StarIcon, InstagramIcon, YoutubeIcon } from '../../components/Icons.jsx';
import { getProducts } from '../../services/productService.js';
import { useSeller } from '../../services/useSeller.js';
import { SELLER } from '../../data/seller.js';
import { PRODUCTS } from '../../data/products.js';
import './Home.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'video_call', label: 'Video Call' },
  { key: 'digital', label: 'Digital' },
];

function SellerPanel({ seller }) {
  return (
    <aside className="seller-profile">
      {seller.avatar
        ? <img src={seller.avatar} alt={seller.name} />
        : (
          <div className="seller-avatar-fallback">
            {seller.name.charAt(0)}
          </div>
        )}
      <h1 className="seller-name">{seller.name}</h1>
      <p className="seller-description">{seller.headline}</p>
      <div className="social-icons">
        {seller.instagram && (
          <a href={seller.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram">
            <InstagramIcon width={15} height={15} />
          </a>
        )}
        {seller.youtube && (
          <a href={seller.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube">
            <YoutubeIcon width={15} height={15} />
          </a>
        )}
      </div>
      <div className="profile-actions">
        <a className="profile-btn" href={seller.email ? `mailto:${seller.email}` : '#about'}>
          <SendIcon width={12} height={12} /> Message
        </a>
        <a className="profile-btn" href="#about">
          <StarIcon width={12} height={12} /> Reviews
        </a>
      </div>
    </aside>
  );
}

const FEATURED_ID = 'p1';

function filterProducts(products, key) {
  const byType = key === 'all' ? products
    : key === 'video_call' ? products.filter((p) => p.type === 'video_call')
    : products.filter((p) => p.type === 'digital');
  return byType.filter((p) => p._id === FEATURED_ID);
}

export default function Home() {
  const apiSeller = useSeller();
  const seller = apiSeller || SELLER;

  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState(() => filterProducts(PRODUCTS, 'all'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts(filter)
      .then((p) => { if (!cancelled) setProducts(filterProducts(p, filter)); })
      .catch(() => { if (!cancelled) setProducts(filterProducts(PRODUCTS, filter)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter]);

  return (
    <div className="page-container">

      <div className="top-layout">
        <SellerPanel seller={seller} />

        <main className="product-section" id="products">
          <div className="home__tabs" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`home__tab${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {loading
            ? <div className="spinner" aria-label="Loading" />
            : <ProductGrid products={products} />}
        </main>
      </div>

      <section className="about-section" id="about">
        <h2>About me</h2>
        <p>{seller.about}</p>
      </section>

    </div>
  );
}
