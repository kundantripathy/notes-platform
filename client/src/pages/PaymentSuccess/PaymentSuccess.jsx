import { useParams, Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const { orderId } = useParams();

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '48px auto', padding: '0 16px' }}>
      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, padding: 32 }}>
        <div style={{ fontSize: '3rem' }}>🎉</div>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--green-900)' }}>Payment Successful!</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.85rem' }}>
          Your order has been confirmed. You will receive your notes shortly.
        </p>
        {orderId && (
          <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--muted)' }}>
            Order ID: <strong style={{ color: 'var(--text)' }}>{orderId}</strong>
          </p>
        )}
        <Link to="/" className="btn btn--primary btn--pill" style={{ marginTop: 8 }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
