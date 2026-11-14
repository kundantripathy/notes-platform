import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <nav className="header__nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/my-downloads">My Notes</NavLink>
          <NavLink to="/my-orders">Orders</NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
      </div>
    </header>
  );
}
