'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: (number | string)[];
  showAllOption?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  themeColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PaginationControl({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  showAllOption = false,
  onPageChange,
  onPageSizeChange,
  themeColor = '#2F4375',
  className = '',
  style = {},
}: PaginationControlProps) {
  if (totalItems <= 0 && totalPages <= 1) return null;

  const isShowingAll = pageSize >= 99999;
  const startRecord = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = isShowingAll ? totalItems : Math.min(currentPage * pageSize, totalItems);

  // Generate window of page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={className}
      style={{
        padding: '14px 20px',
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.02)',
        ...style,
      }}
    >
      {/* Left: Entries Info + Optional Page Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          {isShowingAll ? (
            <>
              Showing all <strong style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems}</strong> entries
            </>
          ) : (
            <>
              Showing{' '}
              <strong style={{ fontWeight: 700, color: '#0F172A' }}>{startRecord}</strong> to{' '}
              <strong style={{ fontWeight: 700, color: '#0F172A' }}>{endRecord}</strong> of{' '}
              <strong style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems}</strong> entries
              {totalPages > 1 && (
                <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </>
          )}
        </div>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
            <span>Per page:</span>
            <select
              value={isShowingAll ? 'all' : pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 99999 : Number(e.target.value);
                onPageSizeChange(val);
                onPageChange(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#1E293B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {pageSizeOptions.map((opt) => {
                const isAll = opt === 'all' || opt === 'All' || Number(opt) >= 99999;
                return (
                  <option key={String(opt)} value={isAll ? 'all' : opt}>
                    {isAll ? `All (${totalItems})` : opt}
                  </option>
                );
              })}
              {showAllOption && !pageSizeOptions.some((o) => o === 'all' || o === 'All' || Number(o) >= 99999) && (
                <option value="all">All ({totalItems})</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First Page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === 1 ? '#CBD5E1' : '#475569',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 10px',
              height: '32px',
              background: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === 1 ? '#CBD5E1' : '#475569',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={15} /> Prev
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '32px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = currentPage === pageNum;

            return (
              <button
                type="button"
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  border: isActive ? `1px solid ${themeColor}` : '1px solid #CBD5E1',
                  background: isActive ? themeColor : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 4px rgba(47, 67, 117, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 10px',
              height: '32px',
              background: currentPage === totalPages ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === totalPages ? '#CBD5E1' : '#475569',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            Next <ChevronRight size={15} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: currentPage === totalPages ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === totalPages ? '#CBD5E1' : '#475569',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
