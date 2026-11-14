import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../Icons.jsx';
import { useSeller } from '../../services/useSeller.js';
import { SELLER } from '../../data/seller.js';
import './CreatorBar.css';

export default function CreatorBar({ backTo }) {
  const navigate = useNavigate();
  const apiSeller = useSeller();
  const seller = apiSeller || SELLER;
  const goBack = () => (backTo ? navigate(backTo) : navigate(-1));

  return (
    <div className="creator">
      <button className="creator__back" onClick={goBack} aria-label="Go back">
        <ArrowLeft />
      </button>
      {seller.avatar
        ? <img className="creator__avatar" src={seller.avatar} alt="" />
        : <span className="creator__avatar creator__avatar--fallback">{seller.name.charAt(0)}</span>}
      <div className="creator__text">
        <strong>{seller.name}</strong>
        <span>{seller.headline}</span>
      </div>
    </div>
  );
}
