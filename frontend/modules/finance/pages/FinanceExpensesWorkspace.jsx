'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, Receipt, Calendar, DollarSign, Filter, Download,
  Eye, Edit2, Layers, Tag, ChevronRight, Search, FileText,
  CheckCircle2, AlertCircle, X, Loader2, TrendingUp, FolderPlus,
  RefreshCw, Upload, Check, Printer, ChevronLeft, ChevronsLeft,
  ChevronsRight, ChevronDown, PieChart as PieChartIcon, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import Swal from 'sweetalert2';
import { financeExpenseService } from '../../../services/financeExpenseService';
import { exportToCSV } from '../../../services/export.service';
import { useAuthStore } from '@/store/authStore';

const CHART_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1',
  '#84CC16', '#A855F7'
];

// ──────────────────────────────────────────────────────────
// SMART SEARCHABLE COMBOBOX FOR EXPENSE CATEGORIES
// ──────────────────────────────────────────────────────────
function CategorySmartSearch({
  categories = [],
  selectedCategoryId = '',
  onSelectCategory,
  placeholder = 'Type to search 23 categories (e.g. Petrol, Salary, Repair)...',
  allowAll = false,
  allLabel = '📂 All Categories / Subheaders',
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Active categories
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  // Selected Category
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Filtered categories: searches category name and subheader names
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeCategories;
    return activeCategories.filter((c) => {
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchHeader = (c.headers || []).some((h) => (h.name || '').toLowerCase().includes(q));
      return matchName || matchHeader;
    });
  }, [activeCategories, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCategories]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredCategories.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredCategories.length) % Math.max(1, filteredCategories.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCategories[highlightedIndex]) {
        onSelectCategory(filteredCategories[highlightedIndex].id);
        setIsOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Hidden input for HTML5 required form validation */}
      {required && (
        <input
          tabIndex={-1}
          type="text"
          required
          value={selectedCategoryId || ''}
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            width: 1,
            height: 1
          }}
        />
      )}

      {/* Main Trigger / Search Box */}
      {!isOpen ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setIsOpen(true);
            setSearchQuery('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#FFFFFF',
            border: selectedCategory ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            minHeight: '38px',
            boxShadow: selectedCategory ? '0 0 0 1px #2563EB' : 'none'
          }}
        >
          {selectedCategory ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.04em',
                flexShrink: 0
              }}>
                CATEGORY
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedCategory.name}
              </span>
              {selectedCategory.headers && selectedCategory.headers.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  color: '#64748B',
                  background: '#F1F5F9',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  flexShrink: 0
                }}>
                  {selectedCategory.headers.length} header{selectedCategory.headers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
              <Search size={15} color="#94A3B8" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeholder}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {selectedCategory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('');
                  setSearchQuery('');
                }}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer'
                }}
                title="Clear selection"
              >
                <X size={12} />
              </button>
            )}
            <ChevronDown size={15} color="#64748B" />
          </div>
        </div>
      ) : (
        /* Active Search Input */
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} color="#2563EB" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to filter categories or headers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '8px 34px 8px 34px',
              background: '#FFFFFF',
              border: '1.5px solid #2563EB',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Dropdown Results */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 10050,
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
          maxHeight: '270px',
          overflowY: 'auto'
        }}>
          {/* Header Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 12px',
            background: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9',
            fontSize: '11px',
            color: '#64748B',
            fontWeight: '700'
          }}>
            <span>
              {searchQuery ? `Matching Categories (${filteredCategories.length})` : `All Categories (${filteredCategories.length})`}
            </span>
            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>
              ↑↓ Navigate • ↵ Select
            </span>
          </div>

          {/* Optional "All Categories" option for filters */}
          {allowAll && (
            <div
              onClick={() => {
                onSelectCategory('');
                setIsOpen(false);
                setSearchQuery('');
              }}
              style={{
                padding: '9px 12px',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer',
                background: !selectedCategoryId ? '#EFF6FF' : '#FFFFFF',
                color: !selectedCategoryId ? '#1D4ED8' : '#0F172A',
                fontWeight: !selectedCategoryId ? '800' : '600',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = !selectedCategoryId ? '#EFF6FF' : '#FFFFFF'; }}
            >
              <span>{allLabel}</span>
              {!selectedCategoryId && <Check size={14} color="#2563EB" />}
            </div>
          )}

          {/* Results List */}
          {filteredCategories.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#0F172A' }}>
                No categories found matching "{searchQuery}"
              </p>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', marginTop: '4px' }}>
                Try searching for a different term or clear the search.
              </span>
            </div>
          ) : (
            filteredCategories.map((cat, idx) => {
              const isSelected = cat.id === selectedCategoryId;
              const isHighlighted = idx === highlightedIndex;

              // Check if any subheaders match search query
              const matchingHeaders = searchQuery
                ? (cat.headers || []).filter((h) => h.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                : [];

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: '9px 12px',
                    cursor: 'pointer',
                    background: isSelected ? '#EFF6FF' : isHighlighted ? '#F8FAFC' : '#FFFFFF',
                    borderBottom: '1px solid #F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? '850' : '700',
                        color: isSelected ? '#1D4ED8' : '#0F172A'
                      }}>
                        {cat.name}
                      </span>
                      {cat.headers && cat.headers.length > 0 && (
                        <span style={{
                          fontSize: '10.5px',
                          color: '#64748B',
                          background: isSelected ? '#DBEAFE' : '#F1F5F9',
                          padding: '1px 6px',
                          borderRadius: '10px'
                        }}>
                          {cat.headers.length} headers
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={15} color="#2563EB" />}
                  </div>

                  {/* Subheader hint when searching */}
                  {matchingHeaders.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                      <span style={{ color: '#64748B' }}>Matches header:</span>
                      <strong style={{ background: '#EFF6FF', padding: '1px 5px', borderRadius: '3px' }}>
                        {matchingHeaders[0].name}
                      </strong>
                      {matchingHeaders.length > 1 && (
                        <span style={{ color: '#64748B' }}>+{matchingHeaders.length - 1} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// SMART SEARCHABLE COMBOBOX FOR HEADERS
// ──────────────────────────────────────────────────────────
function HeaderSmartSearch({
  headers = [],
  selectedHeaderId = '',
  onSelectHeader,
  disabled = false,
  placeholder = 'Select or search header (optional)...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const activeHeaders = useMemo(() => {
    return headers.filter((h) => h.isActive !== false);
  }, [headers]);

  const selectedHeader = useMemo(() => {
    return headers.find((h) => h.id === selectedHeaderId) || null;
  }, [headers, selectedHeaderId]);

  const filteredHeaders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeHeaders;
    return activeHeaders.filter((h) => (h.name || '').toLowerCase().includes(q));
  }, [activeHeaders, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredHeaders.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredHeaders.length) % Math.max(1, filteredHeaders.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredHeaders[highlightedIndex]) {
        onSelectHeader(filteredHeaders[highlightedIndex].id);
        setIsOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (disabled || headers.length === 0) {
    return (
      <div style={{
        width: '100%',
        padding: '8px 12px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        color: '#94A3B8',
        fontSize: '12.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'not-allowed',
        boxSizing: 'border-box'
      }}>
        <span>{disabled ? 'Select a category first' : 'No headers configured (optional)'}</span>
        <ChevronDown size={14} color="#CBD5E1" />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {!isOpen ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setIsOpen(true);
            setSearchQuery('');
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#FFFFFF',
            border: selectedHeader ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxSizing: 'border-box',
            minHeight: '38px',
            boxShadow: selectedHeader ? '0 0 0 1px #2563EB' : 'none'
          }}
        >
          {selectedHeader ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
              <span style={{
                background: '#F1F5F9',
                color: '#334155',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                HEADER
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '750',
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedHeader.name}
              </span>
            </div>
          ) : (
            <span style={{ color: '#64748B', fontSize: '13px' }}>{placeholder}</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {selectedHeader && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHeader('');
                  setSearchQuery('');
                }}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer'
                }}
                title="Clear header"
              >
                <X size={12} />
              </button>
            )}
            <ChevronDown size={15} color="#64748B" />
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} color="#2563EB" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search headers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '8px 34px 8px 34px',
              background: '#FFFFFF',
              border: '1.5px solid #2563EB',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 10050,
          background: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
          maxHeight: '220px',
          overflowY: 'auto'
        }}>
          {filteredHeaders.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
              No headers found matching "{searchQuery}"
            </div>
          ) : (
            filteredHeaders.map((h, idx) => {
              const isSelected = h.id === selectedHeaderId;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={h.id}
                  onClick={() => {
                    onSelectHeader(h.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    background: isSelected ? '#EFF6FF' : isHighlighted ? '#F8FAFC' : '#FFFFFF',
                    borderBottom: '1px solid #F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#1D4ED8' : '#0F172A',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <span>{h.name}</span>
                  {isSelected && <Check size={14} color="#2563EB" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function FinanceExpensesWorkspace() {
  const user = useAuthStore((s) => s.user);

  // Filter States
  const [datePreset, setDatePreset] = useState('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedHeader, setSelectedHeader] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Master Data
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Transaction Data & Summaries
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    totalEntries: 0,
    topCategory: null,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryMasterModal, setShowCategoryMasterModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Form State for Add / Edit Expense
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    headerId: '',
    amount: '',
    description: '',
    paidTo: '',
    paymentMethod: 'Bank',
    voucherNumber: '',
    invoiceNumber: '',
    receiptUrl: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Category Master Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [selectedCatForHeader, setSelectedCatForHeader] = useState('');
  const [newHeaderName, setNewHeaderName] = useState('');
  const [newHeaderDesc, setNewHeaderDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Role resolution
  const rawRole = typeof user?.role === 'object' ? user?.role?.code || user?.role?.name : user?.role;
  const isSuperAdmin = String(rawRole || '').toUpperCase().includes('SUPER_ADMIN') || String(rawRole || '').toUpperCase().includes('ADMIN');
  const isFinanceManager = isSuperAdmin || String(rawRole || '').toLowerCase().includes('finance manager') || String(rawRole || '').toLowerCase().includes('finance-lead');

  // Load Categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const res = await financeExpenseService.getCategories({ includeInactive: isFinanceManager });
      const catList = Array.isArray(res) ? res : res?.data || [];
      setCategories(catList);
    } catch (err) {
      console.error('Failed to load expense categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [isFinanceManager]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Headers available for selected category in filters
  const filterAvailableHeaders = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat ? cat.headers || [] : [];
  }, [categories, selectedCategory]);

  // Headers available for selected category in modal form
  const formAvailableHeaders = useMemo(() => {
    if (!formData.categoryId) return [];
    const cat = categories.find((c) => c.id === formData.categoryId);
    return cat ? (cat.headers || []).filter((h) => h.isActive) : [];
  }, [categories, formData.categoryId]);

  // Fetch Expenses, Summary & Breakdown
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const queryParams = {
        page,
        limit,
        datePreset,
        dateFrom: datePreset === 'custom' ? customFrom : undefined,
        dateTo: datePreset === 'custom' ? customTo : undefined,
        categoryId: selectedCategory || undefined,
        headerId: selectedHeader || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        search: searchQuery || undefined,
      };

      const [expRes, sumRes, breakdownRes] = await Promise.all([
        financeExpenseService.getExpenses(queryParams),
        financeExpenseService.getSummary(queryParams),
        financeExpenseService.getCategoryBreakdown(queryParams),
      ]);

      const expList = expRes?.data || (Array.isArray(expRes) ? expRes : []);
      setExpenses(expList);
      setTotalCount(expRes?.total || expList.length);
      setTotalPages(expRes?.totalPages || 1);

      if (sumRes) {
        setSummary({
          totalExpenses: Number(sumRes.totalExpenses || 0),
          thisMonth: Number(sumRes.thisMonth || 0),
          totalEntries: Number(sumRes.totalEntries || 0),
          topCategory: sumRes.topCategory || null,
        });
      }

      if (breakdownRes) {
        setCategoryBreakdown(breakdownRes.breakdown || []);
        setChartData(breakdownRes.chartData || []);
      }
    } catch (err) {
      console.error('Failed to load finance expense data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    page,
    limit,
    datePreset,
    customFrom,
    customTo,
    selectedCategory,
    selectedHeader,
    paymentMethodFilter,
    searchQuery,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExpenseId(null);
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: '',
      headerId: '',
      amount: '',
      description: '',
      paidTo: '',
      paymentMethod: 'Bank',
      voucherNumber: '',
      invoiceNumber: '',
      receiptUrl: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (expense) => {
    setEditingExpenseId(expense.id);
    setFormData({
      expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
      categoryId: expense.categoryId || '',
      headerId: expense.headerId || '',
      amount: expense.amount || '',
      description: expense.description || '',
      paidTo: expense.paidTo || '',
      paymentMethod: expense.paymentMethod || 'Bank',
      voucherNumber: expense.voucherNumber || '',
      invoiceNumber: expense.invoiceNumber || '',
      receiptUrl: expense.receiptUrl || '',
      notes: expense.notes || '',
    });
    setShowAddModal(true);
  };

  // Category filter change
  const handleCategoryFilterChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedHeader('');
    setPage(1);
  };

  // Handle category change in Create/Edit Form
  const handleFormCategoryChange = (catId) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      headerId: '',
    }));
  };

  // Handle Receipt Upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);
      const res = await financeExpenseService.uploadReceipt(file);
      if (res && res.receiptUrl) {
        setFormData((prev) => ({ ...prev, receiptUrl: res.receiptUrl }));
        Swal.fire({
          icon: 'success',
          title: 'Receipt Uploaded',
          text: 'Receipt attached successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire('Upload Failed', err?.message || 'Could not upload receipt image.', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Submit Expense Form
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      Swal.fire('Missing Category', 'Please select an expense category.', 'warning');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      Swal.fire('Invalid Amount', 'Please enter a valid expense amount greater than 0.', 'warning');
      return;
    }
    if (!formData.description || formData.description.trim().length === 0) {
      Swal.fire('Missing Description', 'Please enter an expense description or purpose.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        expenseDate: formData.expenseDate,
        categoryId: formData.categoryId,
        headerId: formData.headerId || null,
        amount: Number(formData.amount),
        description: formData.description.trim(),
        paidTo: formData.paidTo ? formData.paidTo.trim() : null,
        paymentMethod: formData.paymentMethod,
        voucherNumber: formData.voucherNumber ? formData.voucherNumber.trim() : null,
        invoiceNumber: formData.invoiceNumber ? formData.invoiceNumber.trim() : null,
        receiptUrl: formData.receiptUrl || null,
        notes: formData.notes ? formData.notes.trim() : null,
      };

      if (editingExpenseId) {
        await financeExpenseService.updateExpense(editingExpenseId, payload);
        Swal.fire({
          icon: 'success',
          title: 'Expense Updated',
          text: 'The expense transaction was successfully updated.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await financeExpenseService.createExpense(payload);
        Swal.fire({
          icon: 'success',
          title: 'Expense Recorded',
          text: 'New expense transaction created and register updated.',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save expense:', err);
      Swal.fire('Error', err?.message || 'Could not save expense.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Header in Master
  const handleCreateHeader = async (e) => {
    e.preventDefault();
    if (!selectedCatForHeader || !newHeaderName.trim()) {
      Swal.fire('Required Fields', 'Please select a category and header name.', 'warning');
      return;
    }

    try {
      setIsSavingCategory(true);
      await financeExpenseService.createHeader(selectedCatForHeader, {
        name: newHeaderName.trim(),
        description: newHeaderDesc ? newHeaderDesc.trim() : undefined,
      });
      setNewHeaderName('');
      setNewHeaderDesc('');
      Swal.fire({
        icon: 'success',
        title: 'Header Created',
        text: 'Header added to category successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Could not create header.', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Toggle Category Active Status
  const handleToggleCategoryActive = async (category) => {
    try {
      await financeExpenseService.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Could not update category status.', 'error');
    }
  };

  // Toggle Header Active Status
  const handleToggleHeaderActive = async (categoryId, header) => {
    try {
      await financeExpenseService.updateHeader(categoryId, header.id, {
        isActive: !header.isActive,
      });
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Could not update header status.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const queryParams = {
        datePreset,
        dateFrom: datePreset === 'custom' ? customFrom : undefined,
        dateTo: datePreset === 'custom' ? customTo : undefined,
        categoryId: selectedCategory || undefined,
        headerId: selectedHeader || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        search: searchQuery || undefined,
      };
      const data = await financeExpenseService.exportExpenses(queryParams);
      if (!data || data.length === 0) {
        Swal.fire('No Data', 'There are no expense records matching active filters to export.', 'info');
        return;
      }
      exportToCSV(data, `finance-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      Swal.fire('Export Failed', err?.message || 'Could not generate CSV export.', 'error');
    }
  };

  // Standard Indian Rupee Formatter
  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      padding: '16px 20px',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER WITH ENTERPRISE ACTION BAR                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: '#FFFFFF',
        padding: '18px 24px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              color: '#0284C7',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: '#E0F2FE',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              FINANCE
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
              Expense Register & Ledger
            </span>
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '850',
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={18} color="#2563EB" />
            </div>
            Finance Expense Management
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
            Authoritative enterprise expense register, category allocation & P&L cost tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isFinanceManager && (
            <button
              type="button"
              onClick={() => setShowCategoryMasterModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#1E293B',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <FolderPlus size={15} color="#2563EB" />
              <span>Category Master</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            <Download size={15} color="#64748B" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#64748B',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            title="Print Report"
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
          >
            <Printer size={15} />
          </button>

          <button
            type="button"
            onClick={() => fetchData()}
            disabled={isLoadingData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: isLoadingData ? 'not-allowed' : 'pointer'
            }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoadingData ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: '#002E5D',
              border: '1px solid #002E5D',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '750',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 46, 93, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#002244'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#002E5D'; }}
          >
            <Plus size={16} />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. 4 EXECUTIVE STAT KPI CARDS (Crisp Light Enterprise Grid)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Expenses */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL EXPENSES
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {formatINR(summary.totalExpenses)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Filtered Scope</span>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: '4px' }}>
              Active Filter
            </span>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              THIS MONTH
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {formatINR(summary.thisMonth)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Calendar Month Total</span>
            <span style={{ fontSize: '11px', fontWeight: '700', background: '#DCFCE7', color: '#16A34A', padding: '1px 6px', borderRadius: '4px' }}>
              Current
            </span>
          </div>
        </div>

        {/* Card 3: Total Entries */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL TRANSACTIONS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {summary.totalEntries}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Recorded Vouchers</span>
            <span style={{ color: '#D97706', fontWeight: '750' }}>
              {totalCount} Total
            </span>
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOP EXPENSE CATEGORY
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#7C3AED" />
            </div>
          </div>
          <div style={{
            fontSize: summary.topCategory ? '20px' : '26px',
            fontWeight: '900',
            color: '#0F172A',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {summary.topCategory ? summary.topCategory.categoryName : '—'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span style={{ color: summary.topCategory ? '#7C3AED' : '#94A3B8', fontWeight: '700' }}>
              {summary.topCategory ? `${formatINR(summary.topCategory.amount)}` : 'No expenses in filter'}
            </span>
            {summary.topCategory && (
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#EDE9FE', color: '#7C3AED', padding: '1px 6px', borderRadius: '4px' }}>
                {summary.topCategory.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. COMPREHENSIVE FILTER & SEARCH BAR                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Row 1: Date Period Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <Calendar size={15} color="#002E5D" />
            Period:
          </span>
          {[
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'this_fy', label: 'This Financial Year' },
            { id: 'previous_fy', label: 'Previous FY' },
            { id: 'custom', label: 'Custom Range' },
          ].map((preset) => {
            const isActive = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDatePreset(preset.id);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #002E5D' : '1px solid #E2E8F0',
                  background: isActive ? '#002E5D' : '#F8FAFC',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: isActive ? '750' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Selects, Custom Dates & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {datePreset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '7px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  color: '#0F172A',
                  fontSize: '12.5px',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '7px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  color: '#0F172A',
                  fontSize: '12.5px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Category Smart Search in Filter Bar */}
          <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
            <CategorySmartSearch
              allowAll
              allLabel="📂 All Categories / Subheaders"
              categories={categories}
              selectedCategoryId={selectedCategory}
              onSelectCategory={handleCategoryFilterChange}
              placeholder="📂 All Categories / Subheaders"
            />
          </div>

          {/* Header Smart Search in Filter Bar */}
          <div style={{ minWidth: '200px', flex: '1 1 200px' }}>
            <HeaderSmartSearch
              headers={filterAvailableHeaders}
              selectedHeaderId={selectedHeader}
              onSelectHeader={(id) => {
                setSelectedHeader(id);
                setPage(1);
              }}
              disabled={!selectedCategory || filterAvailableHeaders.length === 0}
              placeholder={!selectedCategory ? '🏷️ Select Category First' : filterAvailableHeaders.length === 0 ? 'No Headers for Category' : '🏷️ All Category Headers'}
            />
          </div>

          {/* Payment Method Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: paymentMethodFilter ? '#0F172A' : '#64748B',
                fontSize: '12.5px',
                fontWeight: paymentMethodFilter ? '700' : '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">💳 All Payment Methods</option>
              <option value="Bank">Bank Transfer / NEFT</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / GPay</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ flex: '2 1 240px', position: 'relative' }}>
            <Search
              size={15}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search description, payee, voucher, invoice..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Reset Filters Button */}
          {(selectedCategory || selectedHeader || paymentMethodFilter || searchQuery || datePreset !== 'this_month') && (
            <button
              type="button"
              onClick={() => {
                setDatePreset('this_month');
                setCustomFrom('');
                setCustomTo('');
                setSelectedCategory('');
                setSelectedHeader('');
                setPaymentMethodFilter('');
                setSearchQuery('');
                setPage(1);
              }}
              style={{
                padding: '7px 14px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. VISUAL ANALYTICS & CATEGORY BREAKDOWN CARDS              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Left Card: Category Allocation Overview */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minHeight: '340px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '800',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PieChartIcon size={16} color="#2563EB" />
              </div>
              Category Allocation Overview
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>
              P&L Share
            </span>
          </div>

          {chartData.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px 20px',
              textAlign: 'center',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px dashed #CBD5E1'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <PieChartIcon size={24} color="#3B82F6" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '750', color: '#1E293B', marginBottom: '4px' }}>
                No Expenses in Selected Period
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', maxWidth: '300px' }}>
                Recorded expenses will automatically display category share and P&L allocation here.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#002E5D',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Record First Expense
              </button>
            </div>
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 8)}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {chartData.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Amount']}
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      fontSize: '12px',
                      color: '#0F172A',
                      fontWeight: '600'
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', color: '#475569', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Card: Category-wise Breakdown Drill-down */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minHeight: '340px',
          maxHeight: '380px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '800',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={16} color="#16A34A" />
              </div>
              Category & Header Breakdown
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
              Click row to filter register
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px 20px',
              textAlign: 'center',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px dashed #CBD5E1'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Layers size={24} color="#16A34A" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '750', color: '#1E293B', marginBottom: '4px' }}>
                No Category Aggregates
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', maxWidth: '300px' }}>
                Breakdown of expenses by category, header, and transaction volume will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryBreakdown.map((row, idx) => (
                <div
                  key={`${row.categoryId}-${row.headerId || 'none'}-${idx}`}
                  onClick={() => {
                    setSelectedCategory(row.categoryId);
                    if (row.headerId) setSelectedHeader(row.headerId);
                    setPage(1);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>
                        {row.categoryName}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Header: <strong style={{ color: '#1E293B' }}>{row.headerName}</strong> ({row.transactionCount} txn{row.transactionCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        {formatINR(row.totalAmount)}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB' }}>
                        {row.percentage}% of total
                      </span>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(2, row.percentage))}%`, height: '100%', background: '#2563EB', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. MAIN EXPENSE REGISTER TABLE CARD                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0F172A' }}>
              Expense Transaction Register
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Showing {expenses.length} of {totalCount} records matching active filters
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '5px 8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                color: '#0F172A',
                fontSize: '12px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Crisp Data Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sr. No.</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Voucher No.</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Header</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Paid To</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Method</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bill / Ref</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Receipt</th>
                <th style={{ padding: '12px 14px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingData ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#2563EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={18} className="animate-spin" />
                      <span style={{ fontWeight: '600' }}>Loading expense transactions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <Receipt size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.3 }} />
                    <span style={{ fontWeight: '600', display: 'block' }}>No expense transactions found matching active filters.</span>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Try adjusting your date period, category selection, or record a new expense.</span>
                  </td>
                </tr>
              ) : (
                expenses.map((row, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  const formattedDate = new Date(row.expenseDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  // Method badge style
                  let methodBadgeBg = '#EFF6FF';
                  let methodBadgeColor = '#1D4ED8';
                  if (row.paymentMethod === 'Cash') {
                    methodBadgeBg = '#FEF3C7';
                    methodBadgeColor = '#B45309';
                  } else if (row.paymentMethod === 'UPI') {
                    methodBadgeBg = '#F0FDF4';
                    methodBadgeColor = '#15803D';
                  } else if (row.paymentMethod === 'Cheque') {
                    methodBadgeBg = '#F3E8FF';
                    methodBadgeColor = '#7E22CE';
                  }

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'; }}
                    >
                      <td style={{ padding: '11px 14px', color: '#64748B', fontWeight: '600' }}>{srNo}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          color: '#1D4ED8',
                          background: '#EFF6FF',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          border: '1px solid #DBEAFE'
                        }}>
                          {row.expenseNumber}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#334155', whiteSpace: 'nowrap', fontWeight: '500' }}>
                        {formattedDate}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: '#F1F5F9',
                          color: '#0F172A',
                          borderRadius: '5px',
                          fontWeight: '700',
                          fontSize: '11.5px',
                          border: '1px solid #E2E8F0'
                        }}>
                          {row.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569', fontWeight: '600' }}>
                        {row.header?.name || <span style={{ color: '#94A3B8' }}>—</span>}
                      </td>
                      <td
                        style={{ padding: '11px 14px', color: '#1E293B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={row.description}
                      >
                        {row.description}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>
                        {row.paidTo || '—'}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: methodBadgeBg,
                          color: methodBadgeColor,
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '750'
                        }}>
                          {row.paymentMethod || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#64748B', fontFamily: 'monospace', fontSize: '11.5px' }}>
                        {row.voucherNumber || row.invoiceNumber || '—'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: '850', color: '#0F172A', fontSize: '13px' }}>
                        {formatINR(row.amount)}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        {row.receiptUrl ? (
                          <a
                            href={`/api/backend/finance/expenses/${row.id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              background: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              color: '#059669',
                              borderRadius: '4px',
                              fontSize: '11px',
                              textDecoration: 'none',
                              fontWeight: '750',
                            }}
                          >
                            <FileText size={12} />
                            View
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '11px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExpense(row);
                              setShowDetailModal(true);
                            }}
                            title="View Details"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              color: '#2563EB',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          {row.status !== 'POSTED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(row)}
                              title="Edit Expense"
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                color: '#475569',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Pagination Bar (Standard Enterprise Navigation)           */}
        {/* ────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '6px'
        }}>
          <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>
            Page <strong style={{ color: '#0F172A' }}>{page}</strong> of <strong style={{ color: '#0F172A' }}>{totalPages}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page <= 1 ? '#CBD5E1' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page <= 1 ? '#CBD5E1' : '#334155',
                fontSize: '12px',
                fontWeight: '750',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '12px' }}>...</span>;
              }
              const isAct = p === page;
              return (
                <button
                  key={`page-${p}-${idx}`}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    minWidth: '32px',
                    height: '30px',
                    padding: '0 6px',
                    borderRadius: '6px',
                    border: isAct ? '1.5px solid #002E5D' : '1px solid #CBD5E1',
                    background: isAct ? '#002E5D' : '#FFFFFF',
                    color: isAct ? '#FFFFFF' : '#334155',
                    fontSize: '12px',
                    fontWeight: isAct ? '800' : '600',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page >= totalPages ? '#CBD5E1' : '#334155',
                fontSize: '12px',
                fontWeight: '750',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page >= totalPages ? '#CBD5E1' : '#334155',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer'
              }}
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. MODAL: Add / Edit Expense (Crisp Enterprise White Theme)     */}
      {/* ============================================================== */}
      {showAddModal && (
        <div
          onClick={() => !isSubmitting && setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              width: '580px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0F172A' }}>
                  {editingExpenseId ? 'Edit Finance Expense' : '+ Add New Finance Expense'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Category ➔ Header ➔ Amount ➔ Instant Register & Summary Update
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowAddModal(false)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Date & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Expense Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 15000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      fontWeight: '750',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category & Header Selection with Smart Search */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      Expense Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#2563EB', fontWeight: '700' }}>
                      Smart Search
                    </span>
                  </div>
                  <CategorySmartSearch
                    required
                    categories={categories}
                    selectedCategoryId={formData.categoryId}
                    onSelectCategory={handleFormCategoryChange}
                    placeholder="Type to search category..."
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      Header <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500' }}>(Optional)</span>
                    </label>
                    {formAvailableHeaders.length > 0 && (
                      <span style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: '750' }}>
                        {formAvailableHeaders.length} available
                      </span>
                    )}
                  </div>
                  <HeaderSmartSearch
                    headers={formAvailableHeaders}
                    selectedHeaderId={formData.headerId}
                    onSelectHeader={(id) => setFormData({ ...formData, headerId: id })}
                    disabled={!formData.categoryId}
                    placeholder={!formData.categoryId ? 'Select category first' : formAvailableHeaders.length === 0 ? 'No headers configured (optional)' : 'Search or select header...'}
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Description / Purpose <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October monthly staff petrol allowance reimbursement"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Optional Section Divider */}
              <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '800' }}>
                  Optional Accounting & Verification Details
                </span>
              </div>

              {/* Row 4: Paid To & Payment Method */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Paid To (Payee / Vendor)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance Fuel Station / Ramesh"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Bank">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Voucher & Bill Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Voucher / Reference No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VCH-2026-904"
                    value={formData.voucherNumber}
                    onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Invoice / Bill Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-88412"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 6: Receipt Bill Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Receipt / Bill Attachment
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E1'
                }}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleReceiptUpload}
                    disabled={uploadingReceipt}
                    style={{ fontSize: '12px', color: '#475569' }}
                  />
                  {uploadingReceipt && (
                    <span style={{ fontSize: '12px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </span>
                  )}
                  {formData.receiptUrl && !uploadingReceipt && (
                    <span style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      <CheckCircle2 size={14} /> Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingReceipt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 22px',
                    background: '#002E5D',
                    border: '1px solid #002E5D',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 46, 93, 0.2)'
                  }}
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  <span>{editingExpenseId ? 'Update Expense' : 'Record Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: Expense Details View (Clean Enterprise Drawer)       */}
      {/* ============================================================== */}
      {showDetailModal && selectedExpense && (
        <div
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              width: '580px',
              maxWidth: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2563EB', fontWeight: '800', letterSpacing: '0.05em' }}>
                  Voucher Details
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '850', color: '#0F172A' }}>
                  {selectedExpense.expenseNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Date</span>
                <strong style={{ color: '#0F172A' }}>
                  {new Date(selectedExpense.expenseDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Amount</span>
                <strong style={{ color: '#002E5D', fontSize: '16px', fontWeight: '900' }}>
                  {formatINR(selectedExpense.amount)}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Category</span>
                <strong style={{ color: '#0F172A' }}>{selectedExpense.category?.name || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Header</span>
                <strong style={{ color: '#0F172A' }}>{selectedExpense.header?.name || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Paid To</span>
                <strong style={{ color: '#0F172A' }}>{selectedExpense.paidTo || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Payment Method</span>
                <strong style={{ color: '#0F172A' }}>{selectedExpense.paymentMethod || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Voucher Ref</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{selectedExpense.voucherNumber || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Invoice/Bill No</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{selectedExpense.invoiceNumber || '—'}</strong>
              </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
              <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block' }}>Description</span>
              <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '13px', lineHeight: '1.5' }}>
                {selectedExpense.description}
              </p>
            </div>

            {selectedExpense.receiptUrl && (
              <div style={{ marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <span style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Receipt Bill Attachment</span>
                <a
                  href={`/api/backend/finance/expenses/${selectedExpense.id}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    color: '#1D4ED8',
                    textDecoration: 'none',
                    fontSize: '12.5px',
                    fontWeight: '700',
                  }}
                >
                  <Download size={14} /> Download / View Receipt Bill
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 18px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: Category Master Management UI (Clean Enterprise)     */}
      {/* ============================================================== */}
      {showCategoryMasterModal && (
        <div
          onClick={() => setShowCategoryMasterModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              width: '740px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0F172A' }}>
                  Expense Category & Header Master
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Manage authorized category hierarchies, configure headers, and toggle active states.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryMasterModal(false)}
                style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-form: Add Header to Category */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #E2E8F0',
              marginBottom: '18px',
            }}>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#002E5D', display: 'block', marginBottom: '10px' }}>
                + Configure New Header for a Category
              </span>
              <form onSubmit={handleCreateHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
                <select
                  required
                  value={selectedCatForHeader}
                  onChange={(e) => setSelectedCatForHeader(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#0F172A',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="New Header Name..."
                  value={newHeaderName}
                  onChange={(e) => setNewHeaderName(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#0F172A',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={isSavingCategory}
                  style={{
                    padding: '8px 16px',
                    background: '#002E5D',
                    border: '1px solid #002E5D',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: '750',
                    cursor: 'pointer',
                  }}
                >
                  Add Header
                </button>
              </form>
            </div>

            {/* Category Master List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active & Configured Categories ({categories.length})
              </span>

              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    padding: '12px 16px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '750' }}>#{idx + 1}</span>
                      <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{cat.name}</strong>
                      {!cat.isActive && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: '#FEE2E2', color: '#DC2626', borderRadius: '4px', fontWeight: '700' }}>
                          Inactive
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategoryActive(cat)}
                      style={{
                        padding: '4px 10px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        color: cat.isActive ? '#DC2626' : '#16A34A',
                        fontSize: '11px',
                        fontWeight: '750',
                        cursor: 'pointer',
                      }}
                    >
                      {cat.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {/* Headers List under Category */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    {cat.headers && cat.headers.length > 0 ? (
                      cat.headers.map((h) => (
                        <span
                          key={h.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            background: h.isActive ? '#EFF6FF' : '#FEF2F2',
                            border: `1px solid ${h.isActive ? '#BFDBFE' : '#FECACA'}`,
                            color: h.isActive ? '#1D4ED8' : '#DC2626',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '600'
                          }}
                        >
                          {h.name}
                          <button
                            type="button"
                            onClick={() => handleToggleHeaderActive(cat.id, h)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '10px',
                              opacity: 0.7,
                            }}
                            title={h.isActive ? 'Deactivate Header' : 'Activate Header'}
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                        No headers configured yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowCategoryMasterModal(false)}
                style={{
                  padding: '8px 18px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
