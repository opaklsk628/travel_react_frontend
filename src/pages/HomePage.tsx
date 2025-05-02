import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Welcome to Wanderlust Travel</h1>
      <p>Find your perfect getaway destination</p>
      
      <div className="cta-buttons">
        <Link to="/hotels" className="cta-button">
          Browse Hotels
        </Link>
        <Link to="/register" className="cta-button secondary">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default HomePage;