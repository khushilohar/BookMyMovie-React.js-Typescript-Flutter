import React from 'react';
import { PaginationParams } from '../types';
import { PAGINATION_RANGE } from '../utils/constants';

interface PaginationProps {
  pagination: PaginationParams;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, page - Math.floor(PAGINATION_RANGE / 2));
    const endPage = Math.min(totalPages, startPage + PAGINATION_RANGE - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '30px',
      padding: '20px 0'
    }}>

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: '8px 16px',
          backgroundColor: page === 1 ? '#f8f9fa' : '#007bff',
          color: page === 1 ? '#6c757d' : 'white',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        ← Previous
      </button>

      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#007bff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span style={{ padding: '8px', color: '#6c757d' }}>...</span>
          )}
        </>
      )}

    
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          style={{
            padding: '8px 12px',
            backgroundColor: page === pageNumber ? '#007bff' : 'white',
            color: page === pageNumber ? 'white' : '#007bff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: page === pageNumber ? 'bold' : 'normal',
            minWidth: '40px'
          }}
        >
          {pageNumber}
        </button>
      ))}


      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span style={{ padding: '8px', color: '#6c757d' }}>...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#007bff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {totalPages}
          </button>
        </>
      )}

  
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{
          padding: '8px 16px',
          backgroundColor: page === totalPages ? '#f8f9fa' : '#007bff',
          color: page === totalPages ? '#6c757d' : 'white',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        Next →
      </button>

    
      <div style={{
        marginLeft: '20px',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        Page {page} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;