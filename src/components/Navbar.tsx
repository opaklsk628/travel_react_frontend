import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav>
      <div>
        <Link to="/">Wanderlust Travel</Link>
      </div>
      
      <div>
        <Link to="/hotels">Hotels</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/favorites">Favorites</Link>
            
            {user?.role === 'operator' && (
              <Link to="/operator/dashboard">Dashboard</Link>
            )}
            
            <div>
              <span>{user?.username || 'Account'}</span>
              <Link to="/profile">Profile</Link>
              <Link to="/messages">Messages</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <div>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;