import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelService } from '../services/api';

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    country: string;
  };
  pricePerNight: number;
  images: string[];
  rating?: number;
}

const HotelListPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await hotelService.getAll();
        setHotels(response.data);
      } catch (err) {
        setError('Failed to fetch hotels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, []);
  
  if (loading) return <div>Loading hotels...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="hotel-list-page">
      <h1>Available Hotels</h1>
      
      <div className="hotel-grid">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <img
              src={hotel.images[0] || '/placeholder.jpg'}
              alt={hotel.name}
              className="hotel-image"
            />
            <div className="hotel-info">
              <h2>{hotel.name}</h2>
              <p className="location">
                {hotel.location.city}, {hotel.location.country}
              </p>
              <p className="price">${hotel.pricePerNight} per night</p>
              {hotel.rating && (
                <div className="rating">Rating: {hotel.rating}/5</div>
              )}
              <Link to={`/hotels/${hotel.id}`} className="view-button">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelListPage;