import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { amadeusService, favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

interface Hotel {
  id: string;
  name: string;
  cityCode: string;
  description?: string;
  image?: string;
  stars?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  isFromAmadeus: boolean;
}

interface PaginationInfo {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const HotelListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    limit: 16,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // 搜尋和篩選狀態
  const [selectedCity, setSelectedCity] = useState('PAR');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 城市選項
  const cityOptions = [
    { code: 'PAR', name: '巴黎', flag: '🇫🇷' },
    { code: 'NYC', name: '紐約', flag: '🇺🇸' },
    { code: 'LON', name: '倫敦', flag: '🇬🇧' },
    { code: 'TYO', name: '東京', flag: '🇯🇵' },
    { code: 'HKG', name: '香港', flag: '🇭🇰' },
    { code: 'SIN', name: '新加坡', flag: '🇸🇬' },
    { code: 'BKK', name: '曼谷', flag: '🇹🇭' },
    { code: 'DUB', name: '杜拜', flag: '🇦🇪' },
    { code: 'SYD', name: '雪梨', flag: '🇦🇺' },
    { code: 'ROM', name: '羅馬', flag: '🇮🇹' }
  ];

  // 更新分頁和過濾的酒店列表
  const updatePaginationAndFilteredHotels = useCallback((hotelsData: Hotel[], page: number, query: string) => {
    // 應用搜尋過濾
    const filteredHotels = query.trim() 
      ? hotelsData.filter(hotel => 
          hotel.name.toLowerCase().includes(query.toLowerCase()) ||
          hotel.description?.toLowerCase().includes(query.toLowerCase()) ||
          hotel.cityCode.toLowerCase().includes(query.toLowerCase())
        )
      : hotelsData;

    // 計算分頁
    const limit = 16;
    const total = filteredHotels.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedHotels = filteredHotels.slice(startIndex, startIndex + limit);

    // 更新狀態
    setHotels(paginatedHotels);
    setPagination({
      currentPage: page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
    setIsSearching(!!query.trim());
  }, []);

  // 取得酒店列表
  const fetchHotels = useCallback(async (resetError = true) => {
    try {
      setLoading(true);
      if (resetError) setError(null);
      
      console.log('Fetching hotels for city:', selectedCity);
      const response = await amadeusService.list(selectedCity);
      console.log('API Response:', response.data);
      
      // 轉換Amadeus資料格式為統一格式
      const transformedHotels: Hotel[] = response.data.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        cityCode: selectedCity,
        description: `位於${selectedCity}的優質酒店，提供舒適的住宿體驗和完善的服務設施。探索當地文化，享受難忘的住宿體驗。`,
        image: hotel.image,
        stars: hotel.stars,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        amenities: ['WiFi', '空調', '24小時服務', '健身房', '餐廳'],
        priceRange: {
          min: Math.floor(Math.random() * 100) + 80,
          max: Math.floor(Math.random() * 200) + 200,
          currency: 'USD'
        },
        isFromAmadeus: true
      }));
      
      console.log('Transformed hotels:', transformedHotels);
      setAllHotels(transformedHotels);
      
      // 更新分頁狀態
      updatePaginationAndFilteredHotels(transformedHotels, currentPage, searchQuery);
      
    } catch (err: any) {
      console.error('Fetch hotels error:', err);
      const errorMessage = err.response?.data?.message || err.message || '無法獲取酒店列表，請檢查網路連接或稍後再試';
      setError(errorMessage);
      setHotels([]);
      setAllHotels([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, currentPage, searchQuery, updatePaginationAndFilteredHotels]);

  // 取得用戶收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await favoriteService.getAll();
      const hotelIds = response.data.map((fav: any) => fav.hotelId);
      setFavorites(new Set(hotelIds));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  }, [isAuthenticated]);

  // 初始載入和城市變更時重新載入
  useEffect(() => {
    setCurrentPage(1);
    fetchHotels();
  }, [selectedCity]); // 移除 fetchHotels 依賴，因為它會造成無限循環

  // 搜尋或分頁變更時重新處理資料
  useEffect(() => {
    if (allHotels.length > 0) {
      updatePaginationAndFilteredHotels(allHotels, currentPage, searchQuery);
    }
  }, [searchQuery, currentPage, allHotels, updatePaginationAndFilteredHotels]);

  // 認證狀態變更時重新載入收藏
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 處理搜尋
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // 清除搜尋
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setIsSearching(false);
  };

  // 處理分頁
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 收藏/取消收藏
  const toggleFavorite = async (hotel: Hotel, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (!isAuthenticated) {
      alert('請先登入以使用收藏功能');
      return;
    }
    
    try {
      const hotelId = hotel.id;
      
      if (favorites.has(hotelId)) {
        await favoriteService.remove(hotelId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(hotelId);
          return newFavorites;
        });
      } else {
        await favoriteService.add({
          hotelId: hotelId,
          hotelName: hotel.name,
          cityCode: hotel.cityCode,
          image: hotel.image || null
        });
        setFavorites(prev => new Set(prev).add(hotelId));
      }
    } catch (err: any) {
      console.error('收藏操作失敗:', err);
      const errorMessage = err.response?.data?.message || '收藏操作失敗，請重試';
      alert(errorMessage);
    }
  };

  // 格式化價格顯示
  const formatPrice = (priceRange?: Hotel['priceRange']) => {
    if (!priceRange) return 'USD 100 - 300';
    if (priceRange.min === priceRange.max) {
      return `${priceRange.currency} ${priceRange.min}`;
    }
    return `${priceRange.currency} ${priceRange.min} - ${priceRange.max}`;
  };

  // 酒店星級
  const renderStars = (stars?: string) => {
    if (!stars || stars === '—') {
      return <span style={{ color: '#999' }}>未評級</span>;
    }
    const numStars = parseInt(stars);
    if (isNaN(numStars)) {
      return <span style={{ color: '#999' }}>未評級</span>;
    }
    return '⭐'.repeat(numStars) + ` ${numStars} 星`;
  };

  // 處理圖片錯誤
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement;
    
    if (img && placeholder) {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 頁面標題 */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 0.5rem 0',
          background: 'linear-gradient(135deg, #1890ff, #722ed1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏨 酒店預訂
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          探索世界各地的優質酒店，找到您的完美住宿
        </p>
      </div>

      {/* 搜尋和篩選區域 */}
      <div style={{
        backgroundColor: '#fafafa',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* 城市選擇 */}
            <div style={{ minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#333'
              }}>
                選擇城市
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e6f7ff',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1890ff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e6f7ff'}
              >
                {cityOptions.map(city => (
                  <option key={city.code} value={city.code}>
                    {city.flag} {city.name} ({city.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 搜尋框 */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#333'
              }}>
                搜尋酒店
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="輸入酒店名稱或關鍵字..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e6f7ff',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1890ff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e6f7ff'}
              />
            </div>

            {/* 搜尋按鈕 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#40a9ff';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1890ff';
              }}
            >
              {loading ? '搜尋中...' : '🔍 搜尋'}
            </button>

            {/* 清除搜尋按鈕 */}
            {(searchQuery || isSearching) && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                ✕ 清除
              </button>
            )}
          </div>
        </form>

        {/* 結果資訊 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '0.9rem',
          color: '#666',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <span>
            {isSearching ? (
              <>🔍 搜尋結果: "<strong>{searchQuery}</strong>" 在 {selectedCity}</>
            ) : (
              <>📍 瀏覽 <strong>{cityOptions.find(c => c.code === selectedCity)?.name}</strong> 的酒店</>
            )}
          </span>
          <span>
            第 <strong>{pagination.currentPage}</strong> 頁 • 
            共找到 <strong>{pagination.total}</strong> 間酒店
          </span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div style={{
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          color: '#a8071a',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => fetchHotels()}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#ff7875',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            重試
          </button>
        </div>
      )}

      {/* 載入狀態 */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          color: '#666'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            animation: 'bounce 1s infinite'
          }}>
            🏨
          </div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>載入酒店資訊中...</div>
          <div style={{ fontSize: '0.9rem' }}>請稍候片刻</div>
          <style>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          `}</style>
        </div>
      ) : hotels.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#999', marginBottom: '1rem' }}>沒有找到酒店</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
            {isSearching ? 
              '請嘗試調整搜尋關鍵字或選擇不同的城市' : 
              '此城市暫時沒有可用的酒店，請選擇其他城市或稍後再試'
            }
          </p>
          {isSearching && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              瀏覽所有酒店
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 酒店列表 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {hotels.map((hotel) => {
              const isFavorited = favorites.has(hotel.id);
              
              return (
                <div
                  key={hotel.id}
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* 酒店圖片 */}
                  <div style={{ position: 'relative' }}>
                    {hotel.image && (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        style={{
                          width: '100%',
                          height: '220px',
                          objectFit: 'cover'
                        }}
                        onError={handleImageError}
                      />
                    )}
                    
                    {/* 備用圖片佔位符 */}
                    <div 
                      className="image-placeholder"
                      style={{
                        width: '100%',
                        height: '220px',
                        backgroundColor: '#f5f5f5',
                        display: hotel.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        padding: '1rem'
                      }}
                    >
                      🏨 {hotel.name}
                    </div>
                    
                    {/* Amadeus標籤 */}
                    <span style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'rgba(250, 140, 22, 0.95)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(4px)'
                    }}>
                      Amadeus
                    </span>

                    {/* 收藏按鈕 */}
                    <button
                      onClick={(e) => toggleFavorite(hotel, e)}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(4px)'
                      }}
                      title={isFavorited ? '移除收藏' : '加入收藏'}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {isFavorited ? '❤️' : '🤍'}
                    </button>
                  </div>

                  {/* 酒店資訊 */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h3 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '1.25rem',
                        lineHeight: '1.4',
                        color: '#333',
                        fontWeight: '600'
                      }}>
                        {hotel.name}
                      </h3>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        color: '#666',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span>📍 {hotel.cityCode}</span>
                        <span>•</span>
                        <span>{renderStars(hotel.stars)}</span>
                      </div>
                    </div>

                    <p style={{ 
                      margin: '0 0 1rem 0',
                      color: '#666',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.7rem'
                    }}>
                      {hotel.description}
                    </p>

                    {/* 設施標籤 */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '0.2rem 0.5rem',
                                backgroundColor: '#f0f8ff',
                                color: '#1890ff',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                border: '1px solid #e6f7ff'
                              }}
                            >
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: '#999',
                              alignSelf: 'center'
                            }}>
                              +{hotel.amenities.length - 3} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 價格和按鈕 */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#1890ff',
                          lineHeight: '1.2'
                        }}>
                          {formatPrice(hotel.priceRange)}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#999'
                        }}>
                          每晚
                        </div>
                      </div>
                      
                      <Link 
                        to={`/hotels/${hotel.id}`}
                        style={{
                          padding: '0.6rem 1.2rem',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          transition: 'background-color 0.3s',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#40a9ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1890ff';
                        }}
                      >
                        查看詳情 →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 分頁控制 */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HotelListPage;