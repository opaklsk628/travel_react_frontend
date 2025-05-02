import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <div>
        <h1>Find Your Perfect Getaway</h1>
        <p>Discover amazing places to stay around the world.</p>
        <Link to="/hotels">Browse Hotels</Link>
      </div>
      
      <div>
        <div>
          <h2>Unique Selection</h2>
          <p>Discover handpicked hotels that offer exceptional experiences.</p>
        </div>
        
        <div>
          <h2>Best Prices</h2>
          <p>Find the best deals and offers for your dream vacation.</p>
        </div>
        
        <div>
          <h2>Secure Booking</h2>
          <p>Book with confidence knowing your information is protected.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;