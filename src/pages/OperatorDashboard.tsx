import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operatorService } from '../services/api';

interface Hotel {
  _id: string;
  name: string;
  description: string;
  cityCode: string;
  address: string;
  pricePerNight: number;
  currency: string;
  stars: number;
  image: string;
  amenities: string[];
  status: 'active' | 'hidden' | 'deleted';
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalHotels: number;
  activeHotels: number;
  hiddenHotels: number;
  hotelsByCity: Array<{ _id: string; count: number }>;
}

const OperatorDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityCode: '',
    address: '',
    pricePerNight: '',
    currency: 'USD',
    stars: '3',
    image: '',
    amenities: [] as string[],
    checkInTime: '15:00',
    checkOutTime: '11:00'
  });

  const availableAmenities = [
    'WiFi', '空調', '停車場', '健身房', '游泳池', 
    '餐廳', '酒吧', '24小時服務', '會議室', '洗衣服務',
    '機場接送', 'SPA', '商務中心', '寵物友善', '禁煙房'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'HKD', 'SGD', 'THB', 'AUD'];

  useEffect(() => {
    if (role !== 'operator' && role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, statsRes] = await Promise.all([
        operatorService.getHotels({ page: currentPage, limit: 10 }),
        operatorService.getStats()
      ]);
      setHotels(hotelsRes.data.hotels);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cityCode: '',
      address: '',
      pricePerNight: '',
      currency: 'USD',
      stars: '3',
      image: '',
      amenities: [],
      checkInTime: '15:00',
      checkOutTime: '11:00'
    });
    setEditingHotel(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        stars: Number(formData.stars)
      };

      if (editingHotel) {
        await operatorService.updateHotel(editingHotel._id, submitData);
      } else {
        await operatorService.createHotel(submitData);
      }
      
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失敗');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setFormData({
      name: hotel.name,
      description: hotel.description,
      cityCode: hotel.cityCode,
      address: hotel.address,
      pricePerNight: hotel.pricePerNight.toString(),
      currency: hotel.currency,
      stars: hotel.stars.toString(),
      image: hotel.image,
      amenities: hotel.amenities,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime
    });
    setEditingHotel(hotel);
    setShowAddForm(true);
  };

  const handleStatusChange = async (hotelId: string, status: string) => {
    try {
      await operatorService.updateHotelStatus(hotelId, status);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || '更新狀態失敗');
    }
  };

  const handleDelete = async (hotelId: string) => {
    if (window.confirm('確定要刪除這間酒店嗎？')) {
      try {
        await operatorService.deleteHotel(hotelId);
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || '刪除失敗');
      }
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (loading) return <div style={{ padding: '2rem' }}>載入中...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>營運商管理面板</h1>
        <p>歡迎回來，{user?.username || user?.email}</p>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fff2f0', 
          border: '1px solid #ffccc7', 
          color: '#a8071a', 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ float: 'right', background: 'none', border: 'none', color: '#a8071a' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 統計卡片 */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            background: '#f0f8ff', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1890ff' }}>總酒店數</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalHotels}</div>
          </div>
          <div style={{ 
            background: '#f6ffed', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#52c41a' }}>活躍酒店</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activeHotels}</div>
          </div>
          <div style={{ 
            background: '#fff7e6', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fa8c16' }}>隱藏酒店</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.hiddenHotels}</div>
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowAddForm(true)}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#1890ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          + 新增酒店
        </button>
      </div>

      {/* 新增/編輯表單 */}
      {showAddForm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>{editingHotel ? '編輯酒店' : '新增酒店'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label>酒店名稱 *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label>描述 *</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>城市代碼 *</label>
                    <input 
                      type="text" 
                      value={formData.cityCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, cityCode: e.target.value.toUpperCase() }))}
                      placeholder="如: PAR, NYC"
                      maxLength={3}
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label>星級 *</label>
                    <select 
                      value={formData.stars}
                      onChange={(e) => setFormData(prev => ({ ...prev, stars: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      {[1, 2, 3, 4, 5].map(star => (
                        <option key={star} value={star}>{star} 星</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label>地址 *</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>每晚價格 *</label>
                    <input 
                      type="number" 
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
                      min="0"
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label>貨幣</label>
                    <select 
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label>酒店圖片 URL</label>
                  <input 
                    type="url" 
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>入住時間</label>
                    <input 
                      type="time" 
                      value={formData.checkInTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label>退房時間</label>
                    <input 
                      type="time" 
                      value={formData.checkOutTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label>設施</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {availableAmenities.map(amenity => (
                      <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input 
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                        />
                        <span style={{ fontSize: '0.9rem' }}>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="submit"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#1890ff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  {editingHotel ? '更新' : '新增'}
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#f5f5f5', 
                    color: '#333', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 酒店列表 */}
      <div>
        <h2>我的酒店</h2>
        {hotels.length === 0 ? (
          <p>還沒有新增任何酒店</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>酒店名稱</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>城市</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>星級</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>價格</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>狀態</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map(hotel => (
                  <tr key={hotel._id}>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{hotel.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {hotel.description.length > 50 
                            ? `${hotel.description.substring(0, 50)}...` 
                            : hotel.description
                          }
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{hotel.cityCode}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{'⭐'.repeat(hotel.stars)}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      {hotel.currency} {hotel.pricePerNight}
                    </td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      <select 
                        value={hotel.status}
                        onChange={(e) => handleStatusChange(hotel._id, e.target.value)}
                        style={{ 
                          padding: '0.25rem', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          backgroundColor: hotel.status === 'active' ? '#f6ffed' : '#fff2f0'
                        }}
                      >
                        <option value="active">活躍</option>
                        <option value="hidden">隱藏</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(hotel)}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: '#1890ff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          編輯
                        </button>
                        <button 
                          onClick={() => handleDelete(hotel._id)}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: '#ff4d4f', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;