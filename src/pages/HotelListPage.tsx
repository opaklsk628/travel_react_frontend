// src/pages/HotelListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelService, favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Hotel {
  id: string;
  name: string;
  cityCode: string;
  image: string | null;
  stars: string;
}

const HotelListPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();
  
  // 取得酒店列表
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        // default查詢巴黎的酒店
        const response = await hotelService.getAll({ city: 'PAR' });
        setHotels(response.data);
      } catch (err) {
        setError('無法獲取酒店列表');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, []);
  
  // 如果用戶已登入，獲取收藏列表
  useEffect(() => {
    if (isAuthenticated) {
      favoriteService.getAll()
        .then(response => {
          const hotelIds: string[] = response.data.map((fav: any) => fav.hotelId);
          const favIds = new Set<string>(hotelIds);
          setFavorites(favIds);
        })
        .catch(err => console.error('Failed to fetch favorites:', err));
    }
  }, [isAuthenticated]);
  
  // 收藏or取消收藏
  const toggleFavorite = async (hotel: Hotel, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (!isAuthenticated) {
      alert('請先登入以使用收藏功能');
      return;
    }
    
    try {
      if (favorites.has(hotel.id)) {
        // 移除收藏
        await favoriteService.remove(hotel.id);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(hotel.id);
          return newFavorites;
        });
      } else {
        // 增加收藏
        await favoriteService.add({
          hotelId: hotel.id,
          hotelName: hotel.name,
          cityCode: hotel.cityCode,
          image: hotel.image
        });
        setFavorites(prev => new Set(prev).add(hotel.id));
      }
    } catch (err) {
      console.error('收藏操作失敗:', err);
    }
  };
  
  if (loading) return <div>載入酒店資訊中...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>可用酒店</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {hotels.map((hotel) => (
          <div key={hotel.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {hotel.image ? (
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  style={{ maxWidth: '100%', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  無圖片
                </div>
              )}
            </div>
            <h3>{hotel.name}</h3>
            <p>城市: {hotel.cityCode}</p>
            <p>星級: {hotel.stars}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Link to={`/hotels/${hotel.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
                查看詳情
              </Link>
              <button
                onClick={(e) => toggleFavorite(hotel, e)}
                style={{ 
                  background: favorites.has(hotel.id) ? '#ff4d4f' : '#1890ff', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px',
                  cursor: 'pointer' 
                }}
              >
                {favorites.has(hotel.id) ? '取消收藏' : '收藏'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelListPage;