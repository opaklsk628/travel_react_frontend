import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface Favorite {
  _id: string;
  hotelId: string;
  hotelName: string;
  cityCode: string;
  image: string | null;
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await favoriteService.getAll();
        setFavorites(response.data);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setError('無法載入收藏列表，請重試');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const handleRemove = async (hotelId: string) => {
    try {
      await favoriteService.remove(hotelId);
      setFavorites(favorites.filter(fav => fav.hotelId !== hotelId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('無法移除收藏，請重試');
    }
  };

  if (loading) return <div>載入收藏...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>我的收藏酒店</h2>
      
      {favorites.length === 0 ? (
        <p>還沒有添加任何酒店到收藏</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {favorites.map(fav => (
            <div key={fav._id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {fav.image ? (
                  <img src={fav.image} alt={fav.hotelName} style={{ maxWidth: '100%', height: '150px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    無圖片
                  </div>
                )}
              </div>
              <h3>{fav.hotelName}</h3>
              <p>城市: {fav.cityCode}</p>
              <p>收藏於: {new Date(fav.addedAt).toLocaleDateString()}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Link to={`/hotels/external?city=${fav.cityCode}`} style={{ textDecoration: 'none', color: 'blue' }}>
                  查看詳情
                </Link>
                <button 
                  onClick={() => handleRemove(fav.hotelId)}
                  style={{ 
                    background: '#ff4d4f', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px',
                    cursor: 'pointer' 
                  }}
                >
                  移除收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}