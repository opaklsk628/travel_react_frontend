import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#eee' }}>
      <Link to="/">Home</Link>
      <Link to="/hotels">Hotels</Link>

      {isAuthenticated && (
        <>
          <Link to="/favorites">Favorites</Link>

          {role === 'operator' && (
            <Link to="/operator/dashboard">Dashboard</Link>
          )}

          {role === 'admin' && (
            <Link to="/admin">Admin</Link>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <span style={{ marginRight: '0.5rem' }}>
              {user?.username ?? user?.email ?? 'Account'}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}

      {!isAuthenticated && (
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/login">Login</Link>
          <Link to="/register" style={{ marginLeft: '0.5rem' }}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
