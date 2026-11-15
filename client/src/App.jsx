import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Footer from './components/Footer/Footer.jsx';
import Home from './pages/Home/Home.jsx';
import ProductDetails from './pages/ProductDetails/ProductDetails.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import MyOrders from './pages/MyOrders/MyOrders.jsx';
import MyDownloads from './pages/MyDownloads/MyDownloads.jsx';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, []);

  return (
    <div className="app">
      <main className="app__main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-downloads" element={<MyDownloads />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<div className="empty">Page not found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
