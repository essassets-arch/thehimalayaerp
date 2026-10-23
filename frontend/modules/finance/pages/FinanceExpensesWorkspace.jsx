'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Receipt, Calendar, DollarSign, Filter, Download,
  Eye, Edit2, Layers, Tag, ChevronRight, Search, FileText,
  CheckCircle2, AlertCircle, X, Loader2, TrendingUp, FolderPlus,
  RefreshCw, Upload, Check, Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import Swal from 'sweetalert2';
import { financeExpenseService } from '../../../services/financeExpenseService';
import { exportToCSV } from '../../../services/export.service';
import { useAuthStore } from '@/store/authStore';

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#a855f7'
];

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

  // Determine allowed roles for Master Management
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
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Expenses',
        text: err?.message || 'Unable to synchronize expense transactions with database.',
      });
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

  // Handle Category Filter Change (clears incompatible header)
  const handleCategoryFilterChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedHeader('');
    setPage(1);
  };

  // Handle Form Category Change
  const handleFormCategoryChange = (catId) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      headerId: '', // Reset incompatible header
    }));
  };

  // Handle Receipt Upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Maximum allowed receipt attachment size is 10MB.', 'warning');
      return;
    }

    try {
      setUploadingReceipt(true);
      const res = await financeExpenseService.uploadReceipt(file);
      if (res?.fileUrl || res?.path || res?.fileName) {
        const url = res.fileUrl || res.path || res.fileName;
        setFormData((prev) => ({ ...prev, receiptUrl: url }));
        Swal.fire({
          icon: 'success',
          title: 'Receipt Uploaded',
          text: 'Receipt bill attachment processed securely.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire('Upload Error', err?.message || 'Failed to upload receipt attachment.', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Handle Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExpenseId(null);
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
      headerId: categories[0]?.headers?.[0]?.id || '',
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

  // Handle Open Edit Modal
  const handleOpenEditModal = (exp) => {
    setEditingExpenseId(exp.id);
    setFormData({
      expenseDate: exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : '',
      categoryId: exp.categoryId || '',
      headerId: exp.headerId || '',
      amount: String(exp.amount),
      description: exp.description || '',
      paidTo: exp.paidTo || '',
      paymentMethod: exp.paymentMethod || 'Bank',
      voucherNumber: exp.voucherNumber || '',
      invoiceNumber: exp.invoiceNumber || '',
      receiptUrl: exp.receiptUrl || '',
      notes: exp.notes || '',
    });
    setShowAddModal(true);
  };

  // Handle Submit Expense
  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      Swal.fire('Missing Category', 'Please select an Expense Category.', 'warning');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      Swal.fire('Invalid Amount', 'Please enter a valid numeric amount greater than zero.', 'warning');
      return;
    }
    if (!formData.description.trim()) {
      Swal.fire('Missing Description', 'Please provide an expense description or purpose.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        expenseDate: formData.expenseDate,
        categoryId: formData.categoryId,
        headerId: formData.headerId || undefined,
        amount: Number(formData.amount),
        description: formData.description.trim(),
        paidTo: formData.paidTo?.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        voucherNumber: formData.voucherNumber?.trim() || undefined,
        invoiceNumber: formData.invoiceNumber?.trim() || undefined,
        receiptUrl: formData.receiptUrl || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      if (editingExpenseId) {
        await financeExpenseService.updateExpense(editingExpenseId, payload);
        Swal.fire({
          icon: 'success',
          title: 'Expense Updated',
          text: 'The expense transaction has been updated successfully.',
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await financeExpenseService.createExpense(payload);
        Swal.fire({
          icon: 'success',
          title: 'Expense Logged',
          text: 'Expense saved and verified in PostgreSQL ledger.',
          timer: 1800,
          showConfirmButton: false,
        });
      }

      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Expense submission failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.message || 'Could not save expense transaction. Form data has been preserved.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Category Master Add Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setIsSavingCategory(true);
      await financeExpenseService.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });
      setNewCatName('');
      setNewCatDesc('');
      Swal.fire('Success', 'Category created successfully.', 'success');
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to create category.', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle Category Master Add Header
  const handleCreateHeader = async (e) => {
    e.preventDefault();
    if (!selectedCatForHeader || !newHeaderName.trim()) return;

    try {
      setIsSavingCategory(true);
      await financeExpenseService.createHeader(selectedCatForHeader, {
        name: newHeaderName.trim(),
        description: newHeaderDesc.trim() || undefined,
      });
      setNewHeaderName('');
      setNewHeaderDesc('');
      Swal.fire('Success', 'Header added to category successfully.', 'success');
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to add header.', 'error');
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

  // Helper formatting for currency
  const formatINR = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px' }}>
      {/* 1. Header & Navigation Breadcrumb Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Finance Department</span>
            <ChevronRight size={13} />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Finance Expense</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={24} color="#38bdf8" />
            Finance Expense Management
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Authoritative enterprise expense register, category allocation & P&L cost tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isFinanceManager && (
            <button
              onClick={() => setShowCategoryMasterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <FolderPlus size={16} />
              Category Master
            </button>
          )}

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Print Report"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={18} />
            + Add Expense
          </button>
        </div>
      </div>

      {/* 2. Authoritative Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {/* Card A: Total Expenses */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Expenses</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            {formatINR(summary.totalExpenses)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Matching active filters</span>
        </div>

        {/* Card B: This Month */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>This Month</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            {formatINR(summary.thisMonth)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Calendar month total</span>
        </div>

        {/* Card C: Total Entries */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Entries</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            {summary.totalEntries}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Recorded transactions</span>
        </div>

        {/* Card D: Top Expense Category */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Top Expense Category</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summary.topCategory ? summary.topCategory.categoryName : '—'}
          </div>
          <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
            {summary.topCategory ? `${formatINR(summary.topCategory.amount)} (${summary.topCategory.percentage}%)` : 'No expenses recorded'}
          </span>
        </div>
      </div>

      {/* 3. Comprehensive Filter Bar */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {/* Row 1: Date Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <Calendar size={15} color="#38bdf8" />
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
                onClick={() => {
                  setDatePreset(preset.id);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? '#0284c7' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Custom Date Inputs & Filters */}
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
                  padding: '6px 10px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '12.5px',
                }}
              />
              <span style={{ color: '#64748b', fontSize: '12px' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '12.5px',
                }}
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12.5px',
              }}
            >
              <option value="">All Categories / Subheaders</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Header Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedHeader}
              onChange={(e) => {
                setSelectedHeader(e.target.value);
                setPage(1);
              }}
              disabled={!selectedCategory || filterAvailableHeaders.length === 0}
              style={{
                width: '100%',
                padding: '7px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12.5px',
                opacity: !selectedCategory || filterAvailableHeaders.length === 0 ? 0.5 : 1,
              }}
            >
              <option value="">All Category Headers</option>
              {filterAvailableHeaders.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '7px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12.5px',
              }}
            >
              <option value="">All Methods</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search
              size={15}
              color="#64748b"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
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
                padding: '7px 12px 7px 32px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12.5px',
              }}
            />
          </div>

          {/* Reset Filters Button */}
          {(selectedCategory || selectedHeader || paymentMethodFilter || searchQuery || datePreset !== 'this_month') && (
            <button
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
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Analytics & Category Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Category Breakdown Donut / Bar Chart */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '340px',
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#38bdf8" />
            Category Allocation Overview
          </h3>

          {chartData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
              No expenses recorded for the selected period.
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
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {chartData.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatINR(val)}
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category-wise Summary & Drill-down List */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '360px',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#10b981" />
              Category & Header Breakdown
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>Click row to filter register</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
              No category aggregates available.
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {row.categoryName}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Header: <strong style={{ color: '#cbd5e1' }}>{row.headerName}</strong> ({row.transactionCount} txn{row.transactionCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#38bdf8' }}>
                      {formatINR(row.totalAmount)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {row.percentage}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Expense Register Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
              Expense Transaction Register
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              Showing {expenses.length} of {totalCount} records
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '4px 8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Sr. No.</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Expense No.</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Category / Subheader</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Header</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Paid To</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Method</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Voucher/Bill</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Receipt</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingData ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#38bdf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={18} className="spin" />
                      Loading database expense records...
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <Receipt size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.4 }} />
                    No expense transactions found matching active filters.
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

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>{srNo}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>
                        {row.expenseNumber}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                        {formattedDate}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '11.5px',
                        }}>
                          {row.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>
                        {row.header?.name || <span style={{ color: '#64748b' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#e2e8f0', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.description}>
                        {row.description}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                        {row.paidTo || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                        {row.paymentMethod || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                        {row.voucherNumber || row.invoiceNumber || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#f8fafc' }}>
                        {formatINR(row.amount)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
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
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              borderRadius: '4px',
                              fontSize: '11px',
                              textDecoration: 'none',
                              fontWeight: 600,
                            }}
                          >
                            <FileText size={12} />
                            View
                          </a>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '11px' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedExpense(row);
                              setShowDetailModal(true);
                            }}
                            title="View Details"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#38bdf8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          {row.status !== 'POSTED' && (
                            <button
                              onClick={() => handleOpenEditModal(row)}
                              title="Edit Expense"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e2e8f0',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                              }}
                            >
                              <Edit2 size={15} />
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

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: page <= 1 ? '#475569' : '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: page >= totalPages ? '#475569' : '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. MODAL: Add / Edit Expense                                    */}
      {/* ============================================================== */}
      {showAddModal && (
        <div
          className="modal-overlay active"
          onClick={() => !isSubmitting && setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              width: '560px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {editingExpenseId ? 'Edit Finance Expense' : '+ Add New Finance Expense'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Complete the workflow: Category → Header → Amount → Submit
                </p>
              </div>
              <button
                onClick={() => !isSubmitting && setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Date & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Expense Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Amount (₹) <span style={{ color: '#ef4444' }}>*</span>
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
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category & Header Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Expense Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => handleFormCategoryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  >
                    <option value="">Select Category...</option>
                    {categories.filter((c) => c.isActive).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Header <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Optional)</span>
                  </label>
                  <select
                    value={formData.headerId}
                    onChange={(e) => setFormData({ ...formData, headerId: e.target.value })}
                    disabled={!formData.categoryId || formAvailableHeaders.length === 0}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      opacity: !formData.categoryId || formAvailableHeaders.length === 0 ? 0.5 : 1,
                    }}
                  >
                    <option value="">
                      {formAvailableHeaders.length === 0 ? 'Not yet configured' : 'Select Header...'}
                    </option>
                    {formAvailableHeaders.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                  Description / Purpose <span style={{ color: '#ef4444' }}>*</span>
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
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* Optional Section Divider */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '4px 0', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700 }}>
                  Optional Accounting & Verification Details
                </span>
              </div>

              {/* Row 4: Paid To & Payment Method */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
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
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
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
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
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
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Row 6: Receipt Bill Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                  Receipt / Bill Attachment
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleReceiptUpload}
                    disabled={uploadingReceipt}
                    style={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  {uploadingReceipt && (
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={14} className="spin" /> Uploading...
                    </span>
                  )}
                  {formData.receiptUrl && !uploadingReceipt && (
                    <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingReceipt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 24px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  {isSubmitting && <Loader2 size={16} className="spin" />}
                  {editingExpenseId ? 'Update Expense' : 'Submit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: Expense Details View                                 */}
      {/* ============================================================== */}
      {showDetailModal && selectedExpense && (
        <div
          className="modal-overlay active"
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              width: '580px',
              maxWidth: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
                  Expense Details
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedExpense.expenseNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Date</span>
                <strong style={{ color: '#f8fafc' }}>
                  {new Date(selectedExpense.expenseDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Amount</span>
                <strong style={{ color: '#38bdf8', fontSize: '16px' }}>
                  {formatINR(selectedExpense.amount)}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Category</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.category?.name || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Header</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.header?.name || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Paid To</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.paidTo || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Payment Method</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.paymentMethod || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Voucher Ref</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.voucherNumber || '—'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Invoice/Bill No</span>
                <strong style={{ color: '#f8fafc' }}>{selectedExpense.invoiceNumber || '—'}</strong>
              </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block' }}>Description</span>
              <p style={{ margin: '4px 0 0 0', color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}>
                {selectedExpense.description}
              </p>
            </div>

            {selectedExpense.receiptUrl && (
              <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '11.5px', display: 'block', marginBottom: '6px' }}>Receipt Bill Attachment</span>
                <a
                  href={`/api/backend/finance/expenses/${selectedExpense.id}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <Download size={14} /> Download Receipt Bill
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 18px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 600,
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
      {/* 8. MODAL: Category Master Management UI                        */}
      {/* ============================================================== */}
      {showCategoryMasterModal && (
        <div
          className="modal-overlay active"
          onClick={() => setShowCategoryMasterModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              width: '740px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  Expense Category & Header Master
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Manage authorized category hierarchies, configure headers, and toggle active states.
                </p>
              </div>
              <button
                onClick={() => setShowCategoryMasterModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-form: Add Header to Category */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '16px',
            }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '10px' }}>
                + Configure New Header for a Category
              </span>
              <form onSubmit={handleCreateHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
                <select
                  required
                  value={selectedCatForHeader}
                  onChange={(e) => setSelectedCatForHeader(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12.5px',
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12.5px',
                  }}
                />

                <button
                  type="submit"
                  disabled={isSavingCategory}
                  style={{
                    padding: '8px 16px',
                    background: '#0284c7',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Add Header
                </button>
              </form>
            </div>

            {/* Category Master List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                Active & Configured Categories ({categories.length})
              </span>

              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>#{idx + 1}</span>
                      <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>{cat.name}</strong>
                      {!cat.isActive && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '4px' }}>
                          Inactive
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleCategoryActive(cat)}
                      style={{
                        padding: '3px 10px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        color: cat.isActive ? '#ef4444' : '#10b981',
                        fontSize: '11px',
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
                            background: h.isActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${h.isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            color: h.isActive ? '#93c5fd' : '#f87171',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                          }}
                        >
                          {h.name}
                          <button
                            onClick={() => handleToggleHeaderActive(cat.id, h)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '10px',
                              opacity: 0.6,
                            }}
                            title={h.isActive ? 'Deactivate Header' : 'Activate Header'}
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
                        No headers configured yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowCategoryMasterModal(false)}
                style={{
                  padding: '8px 18px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 600,
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
