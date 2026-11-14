import ProductCard from '../ProductCard/ProductCard.jsx';
import './ProductGrid.css';

export default function ProductGrid({ products }) {
  if (!products.length) return <div className="empty">No products found in this category.</div>;
  return (
    <div className="pgrid">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
