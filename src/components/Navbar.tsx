import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const isLoggedIn = false;
  const isOperator = false;
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };
  
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Wanderlust Travel</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/hotels">Hotels</Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/profile">My Profile</Link>
            {isOperator && <Link to="/operator">Dashboard</Link>}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;