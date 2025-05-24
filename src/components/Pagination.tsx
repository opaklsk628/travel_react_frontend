import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  className = ''
}) => {
  const handlePrevClick = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // 頁碼
  const generatePageNumbers = () => {
    if (!totalPages) return [];
    
    const pages = [];
    const delta = 2; // 當前頁前後顯示的頁數
    
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    
    // 第一頁
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }
    
    // 中間頁碼
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // 最後一頁
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`pagination ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '2rem 0',
      borderTop: '1px solid #e0e0e0',
      marginTop: '2rem'
    }}>
      {/* 上一頁按鈕 */}
      <button
        onClick={handlePrevClick}
        disabled={!hasPrevPage}
        style={{
          padding: '0.75rem 1.25rem',
          border: '1px solid #ddd',
          backgroundColor: hasPrevPage ? '#fff' : '#f5f5f5',
          color: hasPrevPage ? '#333' : '#999',
          cursor: hasPrevPage ? 'pointer' : 'not-allowed',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          minWidth: '90px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (hasPrevPage) {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#bbb';
          }
        }}
        onMouseLeave={(e) => {
          if (hasPrevPage) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#ddd';
          }
        }}
      >
        ← 上一頁
      </button>

      {/* 頁碼 */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? handlePageClick(page) : undefined}
            disabled={page === '...'}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              backgroundColor: page === currentPage ? '#1890ff' : '#fff',
              color: page === currentPage ? '#fff' : page === '...' ? '#999' : '#333',
              cursor: page === '...' ? 'default' : 'pointer',
              borderRadius: '8px',
              minWidth: '44px',
              fontSize: '0.9rem',
              fontWeight: page === currentPage ? '600' : '400',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (page !== '...' && page !== currentPage) {
                e.currentTarget.style.backgroundColor = '#f0f8ff';
                e.currentTarget.style.borderColor = '#91d5ff';
                e.currentTarget.style.color = '#1890ff';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== '...' && page !== currentPage) {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.color = '#333';
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 下一頁按鈕 */}
      <button
        onClick={handleNextClick}
        disabled={!hasNextPage}
        style={{
          padding: '0.75rem 1.25rem',
          border: '1px solid #ddd',
          backgroundColor: hasNextPage ? '#fff' : '#f5f5f5',
          color: hasNextPage ? '#333' : '#999',
          cursor: hasNextPage ? 'pointer' : 'not-allowed',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          minWidth: '90px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (hasNextPage) {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#bbb';
          }
        }}
        onMouseLeave={(e) => {
          if (hasNextPage) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#ddd';
          }
        }}
      >
        下一頁 →
      </button>

      {/* 頁面資訊 */}
      <div style={{ 
        marginLeft: '1.5rem', 
        fontSize: '0.85rem', 
        color: '#666',
        whiteSpace: 'nowrap',
        padding: '0.75rem',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #f0f0f0'
      }}>
        第 <strong>{currentPage}</strong> 頁
        {totalPages && ` / 共 ${totalPages} 頁`}
      </div>
    </div>
  );
};

export default Pagination;