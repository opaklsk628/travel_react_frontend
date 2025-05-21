import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/api';

// 酒店詳情介面
interface HotelDetail {
  id: string;
  name: string;
  image: string | null;
  stars: string;
  cityCode: string;
  description: string;
  features: string[];
}

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelDetail = async () => {
      if (!id) {
        navigate('/hotels');
        return;
      }
      
      try {
        setLoading(true);
        const response = await hotelService.getById(id);
        setHotel(response.data);
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError('無法獲取酒店詳情');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [id, navigate]);

  if (loading) return <div>載入酒店詳情</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!hotel) return <div>找不到此酒店</div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{hotel.name}</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        marginBottom: '2rem' 
      }}>
        <div>
          {hotel.image ? (
            <img 
              src={hotel.image} 
              alt={hotel.name} 
              style={{ width: '100%', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ 
              height: '300px', 
              background: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              無圖片
            </div>
          )}
        </div>
        
        <div>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            星級: {hotel.stars}
          </p>
          <p>城市代碼: {hotel.cityCode}</p>
          <p>酒店ID: {hotel.id}</p>
          
          <h3>酒店設施</h3>
          <ul>
            {hotel.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h3>酒店描述</h3>
        <p>{hotel.description}</p>
      </div>
      
      <button 
        onClick={() => navigate('/hotels')}
        style={{ 
          marginTop: '2rem',
          padding: '0.5rem 1rem',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        返回酒店列表
      </button>
    </div>
  );
}