'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, TrendingUp, DollarSign, Award, Users, AlertTriangle,
  Plus, Search, RefreshCw, Eye, Edit2, Trash2, Calendar, CheckCircle2,
  FileSpreadsheet, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './TargetManagement.css';
import { exportToExcel } from '../../../../services/export.service';

const ELIGIBLE_ORDER_STATUSES = [
  'ORDER_CONFIRMED',
  'CONFIRMED',
  'SENT_TO_PLANT',
  'SENT_TO_PLANT_HEAD',
  'PLANT_APPROVED',
  'PLANT_HEAD_ACCEPTED',
  'PRODUCTION_PLANNED',
  'READY_FOR_PRODUCTION',
  'WORK_ORDER_CREATED',
  'PRODUCTION_STARTED',
  'IN_PRODUCTION',
  'PRODUCTION_COMPLETED',
  'QC_PENDING',
  'QC_APPROVED',
  'READY_FOR_DISPATCH',
  'DISPATCH_CREATED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'ORDER_CLOSED',
  'COMPLETED'
];

export default function SalesTargetManagementView({
  salesTargets = [],
  setSalesTargets,
  orders = [],
  usersList = [],
  apiClient,
  showToast,
  fireSwal,
  queryClient,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'Monthly' | 'Quarterly' | 'Yearly'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'ATTENTION' | 'BEHIND'
  const [salespersonFilter, setSalespersonFilter] = useState('ALL'); // 'ALL' | 'CORE' | 'SUPER' | salespersonId

  // Live Users & Orders fetched directly from backend to ensure 100% dynamic telemetry
  const [liveUsers, setLiveUsers] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (apiClient) {
      apiClient.get('/admin/users')
        .then(res => {
          const raw = res.data?.data || res.data?.users || res.data || [];
          if (isMounted && Array.isArray(raw) && raw.length > 0) {
            setLiveUsers(raw);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [apiClient]);

  useEffect(() => {
    let isMounted = true;
    if (apiClient && (!orders || orders.length === 0)) {
      apiClient.get('/sales/orders?limit=1000')
        .then(res => {
          const raw = res.data?.data || res.data?.orders || res.data || [];
          if (isMounted && Array.isArray(raw) && raw.length > 0) {
            setLiveOrders(raw);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [apiClient, orders]);

  // Combined source of users & orders
  const activeUsersSource = useMemo(() => {
    if (liveUsers.length > 0) return liveUsers;
    return Array.isArray(usersList) && usersList.length > 0 ? usersList : [];
  }, [liveUsers, usersList]);

  const activeOrdersSource = useMemo(() => {
    if (Array.isArray(orders) && orders.length > 0) return orders;
    return liveOrders;
  }, [orders, liveOrders]);

  // Modals state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showVelocityModal, setShowVelocityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target Form state
  const [formData, setFormData] = useState({
    id: '',
    salespersonId: '',
    salespersonName: '',
    period: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    targetAmount: 5000000,
    remarks: ''
  });

  // Currency Formatter
  const formatCurrency = useCallback((val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  }, []);

  const WORD_TO_NUM = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20
  };

  // Structured & Naturally Sorted Sales Personnel
  const salesPersonnelData = useMemo(() => {
    const isArchived = (u) => {
      if (u.isArchived === true) return true;
      if (String(u.status || '').toLowerCase() === 'archived') return true;
      const email = String(u.email || '').toLowerCase();
      const name = String(u.name || '').toLowerCase();
      return email.includes('archived') || name.includes('archived');
    };

    const isSales = (u) => {
      if (isArchived(u)) return false;
      const role = String(u.role?.name || u.role || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      const name = String(u.name || '').toLowerCase();
      return role.includes('sales') || role.includes('executive') || role.includes('manager') || email.includes('sales') || name.includes('sales');
    };

    const eligible = activeUsersSource.filter(isSales);

    const list = eligible.length > 0 ? eligible : [
      { id: 'sales-1', name: 'Sales One', email: 'sales1@himalayaerp.com' },
      { id: 'sales-2', name: 'Sales Two', email: 'sales2@himalayaerp.com' },
      { id: 'sales-3', name: 'Sales Three', email: 'sales3@himalayaerp.com' },
      { id: 'sales-4', name: 'Sales Four', email: 'sales4@himalayaerp.com' },
      { id: 'sales-5', name: 'Sales Five', email: 'sales5@himalayaerp.com' },
      { id: 'sales-6', name: 'Sales Six', email: 'sales6@himalayaerp.com' },
      { id: 'sales-7', name: 'Sales Seven', email: 'sales7@himalayaerp.com' },
      { id: 'sales-11', name: 'Sales Eleven', email: 'sales11@himalayaerp.com' },
      { id: 'sales-12', name: 'Jyoti Sales 12', email: 'sales12@himalayaerp.com' },
      { id: 'sales-13', name: 'Sales Thirteen', email: 'sales13@himalayaerp.com' },
      { id: 'sales-14', name: 'Sales Fourteen', email: 'sales14@himalayaerp.com' },
      { id: 'supersales-1', name: 'SuperSales One', email: 'supersales1@himalayaerp.com' },
      { id: 'supersales-2', name: 'SuperSales Two', email: 'supersales2@himalayaerp.com' },
      { id: 'taher-super', name: 'Taher Sir', email: 'taher@himalaya.com' }
    ];

    const core = [];
    const superList = [];
    const other = [];

    list.forEach(u => {
      const name = String(u.name || '').trim();
      const email = String(u.email || '').trim().toLowerCase();
      const nameLower = name.toLowerCase();

      // 1. Check Super Sales
      const isSuper = email.includes('supersales') || nameLower.includes('super sales') || nameLower.includes('supersales') || nameLower.includes('taher');
      if (isSuper) {
        let num = 99;
        const matchNum = email.match(/supersales(\d+)/) || nameLower.match(/supersales\s*(\d+)/);
        if (matchNum) {
          num = parseInt(matchNum[1], 10);
        } else {
          for (const [w, n] of Object.entries(WORD_TO_NUM)) {
            if (nameLower.includes(w) || email.includes(w)) {
              num = n;
              break;
            }
          }
        }
        superList.push({
          id: u.id,
          name: u.name,
          email: u.email,
          num,
          group: 'SUPER',
          displayLabel: `SuperSales ${num < 99 ? num : ''} — ${name} (${email || 'rep'})`.replace(/\s+/g, ' ')
        });
        return;
      }

      // 2. Check Core Sales (strictly Sales 1 to 14)
      let coreNum = null;
      const matchCoreEmail = email.match(/^sales(\d+)@/);
      if (matchCoreEmail) {
        coreNum = parseInt(matchCoreEmail[1], 10);
      } else if (nameLower.startsWith('sales ') || nameLower.includes(' sales ') || nameLower === 'sales') {
        const matchNameNum = nameLower.match(/sales\s*(\d+)/);
        if (matchNameNum) {
          coreNum = parseInt(matchNameNum[1], 10);
        } else {
          for (const [w, n] of Object.entries(WORD_TO_NUM)) {
            if (nameLower === `sales ${w}` || nameLower.startsWith(`sales ${w} `) || nameLower.endsWith(` sales ${w}`) || nameLower.endsWith(` ${w}`)) {
              coreNum = n;
              break;
            }
          }
        }
      }

      if (coreNum !== null) {
        core.push({
          id: u.id,
          name: u.name,
          email: u.email,
          num: coreNum,
          group: 'CORE',
          displayLabel: `Sales ${coreNum} — ${name} (${email || 'rep'})`
        });
        return;
      }

      // 3. Other Sales Representatives
      other.push({
        id: u.id,
        name: u.name,
        email: u.email,
        num: 999,
        group: 'OTHER',
        displayLabel: `${name} (${email || 'Sales Rep'})`
      });
    });

    // Natural numeric sorting
    core.sort((a, b) => a.num - b.num);
    superList.sort((a, b) => a.num - b.num);
    other.sort((a, b) => a.name.localeCompare(b.name));

    return {
      all: [...core, ...superList, ...other],
      core,
      superList,
      other
    };
  }, [activeUsersSource]);

  const salesPersonnel = salesPersonnelData.all;

  // Date String Normalizer
  const normalizeDate = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Enriched Target Rows with Live Qualifying Orders & Velocity across ALL sales personnel
  const enrichedTargets = useMemo(() => {
    const allReps = salesPersonnelData.all;
    if (allReps.length === 0) return [];

    const existingTargets = Array.isArray(salesTargets) ? salesTargets.filter(Boolean) : [];
    const rows = [];
    const processedRepIds = new Set();

    // 1. Process all explicitly saved targets from database
    existingTargets.forEach(t => {
      const salespersonId = String(t.salespersonId || t.salesperson_id || t.userId || '');
      processedRepIds.add(salespersonId);
      const repMatch = allReps.find(u => String(u.id) === salespersonId);
      const salespersonName =
        (t.salespersonName && t.salespersonName !== 'Unknown')
          ? t.salespersonName
          : (t.salesperson?.name || repMatch?.name || 'Sales Representative');
      const salespersonEmail = t.salesperson?.email || repMatch?.email || '';
      const startDate = normalizeDate(t.startDate || t.start_date || t.periodStart) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = normalizeDate(t.endDate || t.end_date || t.periodEnd) || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
      const targetAmount = Number(t.targetAmount || t.revenueTarget || 0);

      // Find qualifying orders
      const qualifyingOrders = (activeOrdersSource || []).filter(o => {
        if (!o || typeof o !== 'object') return false;

        const orderSalesId = String(o.salespersonId || o.salesperson_id || o.salesExecutiveId || o.salesExecutive?.id || o.createdById || '');
        const orderSalesName = String(o.salesperson || o.salesExecutive?.name || o.salesExecutive || o.createdByName || '').toLowerCase();
        const matchesSalesperson = (orderSalesId && (orderSalesId === salespersonId || (salespersonEmail && o.salesExecutive?.email === salespersonEmail))) ||
          (salespersonName && orderSalesName && (orderSalesName.includes(salespersonName.toLowerCase()) || salespersonName.toLowerCase().includes(orderSalesName)));

        const orderDate = normalizeDate(o.orderDate || o.createdAt || o.date);
        const inPeriod = Boolean(orderDate && startDate && endDate && orderDate >= startDate && orderDate <= endDate);

        const currentStatus = String(o.orderLifecycleStatus || o.workflowStatus || o.status || '').toUpperCase();
        const isEligible = ELIGIBLE_ORDER_STATUSES.includes(currentStatus) && currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED';

        return matchesSalesperson && inPeriod && isEligible;
      });

      const calculatedAchieved = qualifyingOrders.reduce((sum, o) => {
        return sum + Number(o.totalAmount || o.grandTotal || o.amount || 0);
      }, 0);

      const achieved = calculatedAchieved > 0 ? calculatedAchieved : Number(t.achieved || 0);
      const pct = targetAmount > 0 ? Math.round((achieved / targetAmount) * 100) : Number(t.achievement || 0);
      const remaining = Math.max(0, targetAmount - achieved);

      // Velocity & Day calculations
      const now = new Date();
      const endD = endDate ? new Date(endDate) : new Date();
      const startD = startDate ? new Date(startDate) : new Date();
      const totalDays = Math.max(1, Math.round((endD - startD) / 86400000) + 1);
      const daysRemaining = Math.max(0, Math.round((endD - now) / 86400000));
      const requiredDaily = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : remaining;

      let statusInfo = { label: 'Behind Pace', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', class: 'tm-badge-behind' };
      if (pct >= 100) {
        statusInfo = { label: 'Achieved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', class: 'tm-badge-achieved' };
      } else if (pct >= 80) {
        statusInfo = { label: 'On Track', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', class: 'tm-badge-ontrack' };
      } else if (pct >= 50) {
        statusInfo = { label: 'Needs Attention', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', class: 'tm-badge-attention' };
      }

      rows.push({
        ...t,
        id: t.id,
        salespersonId,
        salespersonName,
        salespersonEmail,
        period: t.period || t.targetPeriod || 'Monthly',
        startDate,
        endDate,
        targetAmount,
        achieved,
        remaining,
        pct,
        totalDays,
        daysRemaining,
        requiredDaily,
        status: statusInfo,
        qualifyingOrders,
        hasExplicitTarget: true,
        remarks: t.remarks || ''
      });
    });

    // 2. For every active sales rep who doesn't have an explicit target yet, add their dynamic row!
    allReps.forEach(rep => {
      if (processedRepIds.has(String(rep.id))) return;

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Find qualifying orders in current month window
      const qualifyingOrders = (activeOrdersSource || []).filter(o => {
        if (!o || typeof o !== 'object') return false;

        const orderSalesId = String(o.salespersonId || o.salesperson_id || o.salesExecutiveId || o.salesExecutive?.id || o.createdById || '');
        const orderSalesName = String(o.salesperson || o.salesExecutive?.name || o.salesExecutive || o.createdByName || '').toLowerCase();
        const repName = (rep.name || '').toLowerCase();
        const matchesSalesperson = (orderSalesId && (orderSalesId === String(rep.id) || (rep.email && o.salesExecutive?.email === rep.email))) ||
          (repName && orderSalesName && (orderSalesName.includes(repName) || repName.includes(orderSalesName)));

        const orderDate = normalizeDate(o.orderDate || o.createdAt || o.date);
        const inPeriod = Boolean(orderDate && startDate && endDate && orderDate >= startDate && orderDate <= endDate);

        const currentStatus = String(o.orderLifecycleStatus || o.workflowStatus || o.status || '').toUpperCase();
        const isEligible = ELIGIBLE_ORDER_STATUSES.includes(currentStatus) && currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED';

        return matchesSalesperson && inPeriod && isEligible;
      });

      const achieved = qualifyingOrders.reduce((sum, o) => {
        return sum + Number(o.totalAmount || o.grandTotal || o.amount || 0);
      }, 0);

      const targetAmount = 5000000; // default ₹50 Lakhs benchmark
      const remaining = Math.max(0, targetAmount - achieved);
      const pct = Math.round((achieved / targetAmount) * 100);

      const s = new Date(startDate);
      const e = new Date(endDate);
      const totalDays = Math.max(1, Math.round((e - s) / 86400000) + 1);
      const daysRemaining = Math.max(0, Math.round((e - now) / 86400000));
      const requiredDaily = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0;

      let statusInfo = { label: 'Benchmark Pace', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', class: 'tm-badge-ontrack' };
      if (pct >= 100) {
        statusInfo = { label: 'Achieved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', class: 'tm-badge-achieved' };
      } else if (pct >= 80) {
        statusInfo = { label: 'On Track', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', class: 'tm-badge-ontrack' };
      } else if (pct >= 50) {
        statusInfo = { label: 'Needs Attention', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', class: 'tm-badge-attention' };
      } else {
        statusInfo = { label: 'Behind Pace', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', class: 'tm-badge-behind' };
      }

      rows.push({
        id: `dyn-${rep.id}`,
        salespersonId: rep.id,
        salespersonName: rep.name,
        salespersonEmail: rep.email,
        period: 'Monthly',
        startDate,
        endDate,
        targetAmount,
        achieved,
        remaining,
        pct,
        totalDays,
        daysRemaining,
        requiredDaily,
        status: statusInfo,
        qualifyingOrders,
        hasExplicitTarget: false,
        remarks: 'Dynamic Monthly Benchmark'
      });
    });

    return rows;
  }, [salesTargets, activeOrdersSource, salesPersonnelData]);

  // Filtered target list
  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter(t => {
      // Period filter
      if (periodFilter !== 'ALL' && t.period.toLowerCase() !== periodFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter === 'ACHIEVED' && t.pct < 100) return false;
      if (statusFilter === 'ON_TRACK' && (t.pct < 80 || t.pct >= 100)) return false;
      if (statusFilter === 'ATTENTION' && (t.pct < 50 || t.pct >= 80)) return false;
      if (statusFilter === 'BEHIND' && t.pct >= 50) return false;

      // Salesperson filter
      if (salespersonFilter === 'CORE') {
        const isCore = salesPersonnelData.core.some(c => String(c.id) === String(t.salespersonId));
        if (!isCore) return false;
      } else if (salespersonFilter === 'SUPER') {
        const isSuper = salesPersonnelData.superList.some(s => String(s.id) === String(t.salespersonId));
        if (!isSuper) return false;
      } else if (salespersonFilter !== 'ALL') {
        if (String(t.salespersonId) !== String(salespersonFilter)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.salespersonName.toLowerCase().includes(q);
        const matchesRemarks = (t.remarks || '').toLowerCase().includes(q);
        const matchesPeriod = t.period.toLowerCase().includes(q);
        if (!matchesName && !matchesRemarks && !matchesPeriod) return false;
      }

      return true;
    });
  }, [enrichedTargets, periodFilter, statusFilter, salespersonFilter, searchQuery, salesPersonnelData]);

  // Aggregate Metrics
  const totalTarget = useMemo(() => enrichedTargets.reduce((s, t) => s + t.targetAmount, 0), [enrichedTargets]);
  const totalAchieved = useMemo(() => enrichedTargets.reduce((s, t) => s + t.achieved, 0), [enrichedTargets]);
  const totalRemaining = Math.max(0, totalTarget - totalAchieved);
  const overallAchievement = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  const countAchieved = enrichedTargets.filter(t => t.pct >= 100).length;
  const countOnTrack = enrichedTargets.filter(t => t.pct >= 80 && t.pct < 100).length;
  const countBehind = enrichedTargets.filter(t => t.pct < 80).length;

  // Leaderboard ranking
  const leaderboard = useMemo(() => {
    return [...enrichedTargets]
      .sort((a, b) => b.achieved - a.achieved)
      .slice(0, 5);
  }, [enrichedTargets]);

  // Chart data for Target vs Actual
  const chartData = useMemo(() => {
    return enrichedTargets.slice(0, 8).map(t => ({
      name: t.salespersonName.split(' ')[0] || 'Rep',
      Target: t.targetAmount / 100000,
      Achieved: t.achieved / 100000,
      pct: t.pct
    }));
  }, [enrichedTargets]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultPerson = salesPersonnelData.core[0] || salesPersonnelData.all[0] || { id: 'sales-1', name: 'Sales One' };
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    setFormData({
      id: '',
      salespersonId: defaultPerson.id,
      salespersonName: defaultPerson.name,
      period: 'Monthly',
      startDate: start,
      endDate: end,
      targetAmount: 5000000,
      remarks: ''
    });
    setModalMode('create');
    setShowTargetModal(true);
  };

  // Open Edit / Assign Modal
  const handleOpenEdit = (row) => {
    if (!row.hasExplicitTarget) {
      setFormData({
        id: '',
        salespersonId: row.salespersonId,
        salespersonName: row.salespersonName,
        period: row.period || 'Monthly',
        startDate: row.startDate,
        endDate: row.endDate,
        targetAmount: row.targetAmount || 5000000,
        remarks: ''
      });
      setModalMode('create');
      setShowTargetModal(true);
      return;
    }
    setFormData({
      id: row.id,
      salespersonId: row.salespersonId,
      salespersonName: row.salespersonName,
      period: row.period,
      startDate: row.startDate,
      endDate: row.endDate,
      targetAmount: row.targetAmount,
      remarks: row.remarks || ''
    });
    setModalMode('edit');
    setShowTargetModal(true);
  };

  // Save Target API
  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      salespersonId: formData.salespersonId,
      targetPeriod: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
      revenueTarget: Number(formData.targetAmount),
      remarks: formData.remarks || ''
    };

    try {
      if (modalMode === 'create' && (formData.salespersonId === 'ALL_SALES' || formData.salespersonId === 'ALL_SUPERSALES')) {
        const targetReps = formData.salespersonId === 'ALL_SUPERSALES'
          ? salesPersonnelData.superList
          : [...salesPersonnelData.core, ...salesPersonnelData.other];

        if (targetReps.length === 0) {
          throw new Error('No sales representatives found in this selection.');
        }

        let successCount = 0;
        let alreadyActiveCount = 0;
        const createdTargets = [];

        for (const rep of targetReps) {
          try {
            const repPayload = {
              ...payload,
              salespersonId: rep.id
            };
            const res = await apiClient.post('/backend/sales-targets', repPayload);
            if (res.success && res.data?.data) {
              successCount++;
              createdTargets.push(res.data.data);
            }
          } catch (repErr) {
            const msg = repErr.response?.data?.message || repErr.message || '';
            if (msg.includes('already exists') || msg.includes('overlapping')) {
              alreadyActiveCount++;
            }
          }
        }

        if (setSalesTargets && createdTargets.length > 0) {
          setSalesTargets(prev => [...createdTargets, ...prev]);
        }

        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
        }
        setShowTargetModal(false);
        if (onRefresh) onRefresh();

        if (successCount > 0) {
          showToast(
            `Allocated revenue quota across ${successCount} sales personnel.` +
            (alreadyActiveCount > 0 ? ` (${alreadyActiveCount} already had active targets)` : ''),
            'success'
          );
        } else if (alreadyActiveCount > 0) {
          fireSwal({
            title: 'Targets Already Active',
            text: `All ${alreadyActiveCount} selected sales representatives already have active targets during this date window.`,
            icon: 'info'
          });
        }
        return;
      }

      if (modalMode === 'create') {
        const res = await apiClient.post('/backend/sales-targets', payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to create sales target.');
        }
        showToast(res.data?.message || 'Revenue target allocated successfully.', 'success');
        if (setSalesTargets && res.data?.data) {
          setSalesTargets(prev => [res.data.data, ...prev]);
        }
      } else {
        const res = await apiClient.patch(`/backend/sales-targets/${formData.id}`, payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to update sales target.');
        }
        showToast(res.data?.message || 'Revenue target updated successfully.', 'success');
        if (setSalesTargets && res.data?.data) {
          setSalesTargets(prev => prev.map(t => t.id === formData.id ? { ...t, ...res.data.data } : t));
        }
      }

      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
      }
      setShowTargetModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      fireSwal({
        title: 'Target Save Failed',
        text: err.response?.data?.message || err.message || 'An error occurred while saving the target.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Target API
  const handleDeleteTarget = async (row) => {
    if (!row.hasExplicitTarget) {
      showToast('This row is a live dynamic benchmark. To assign a custom target quota, click "+"', 'info');
      return;
    }

    const confirmed = await fireSwal({
      title: 'Remove Target?',
      text: `Are you sure you want to delete the revenue target for ${row.salespersonName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete Target'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await apiClient.delete(`/backend/sales-targets/${row.id}`);
      if (setSalesTargets) {
        setSalesTargets(prev => prev.filter(t => t.id !== row.id));
      }
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
      }
      showToast('Sales target deleted successfully.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Failed to delete target: ' + err.message, 'error');
    }
  };

  // Export Table to Excel
  const handleExport = () => {
    const exportData = filteredTargets.map(t => ({
      Salesperson: t.salespersonName,
      Period: t.period,
      'Start Date': t.startDate,
      'End Date': t.endDate,
      'Revenue Target (INR)': t.targetAmount,
      'Confirmed Sales (INR)': t.achieved,
      'Remaining Deficit (INR)': t.remaining,
      'Achievement %': `${t.pct}%`,
      'Status': t.status.label,
      'Eligible Orders Count': t.qualifyingOrders?.length || 0,
      'Remarks': t.remarks || ''
    }));

    exportToExcel(exportData, `Sales_Targets_Export_${new Date().toISOString().split('T')[0]}`);
    showToast('Sales targets exported to Excel.', 'success');
  };

  // Live Velocity Calculator in Modal
  const modalLiveVelocity = useMemo(() => {
    if (!formData.startDate || !formData.endDate || !formData.targetAmount) {
      return { totalDays: 30, dailyRequired: 0 };
    }
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    const totalDays = Math.max(1, Math.round((e - s) / 86400000) + 1);
    const dailyRequired = Math.round(Number(formData.targetAmount) / totalDays);
    return { totalDays, dailyRequired };
  }, [formData.startDate, formData.endDate, formData.targetAmount]);

  return (
    <div className="tm-container">
      {/* ── Executive Hero Banner ── */}
      <div className="tm-hero">
        <div className="tm-hero-content">
          <div className="tm-hero-badge">
            <ShieldCheck size={13} /> Executive Command Suite
          </div>
          <h1 className="tm-hero-title">
            <Target size={28} style={{ color: '#38bdf8' }} />
            Sales Revenue Targets & Quota Command
          </h1>
          <p className="tm-hero-subtitle">
            Dynamic milestone pacing, individual rep quota allocation, verified confirmed order telemetry, and real-time team benchmarking.
          </p>
        </div>

        <div className="tm-hero-actions">
          <button className="tm-btn-secondary" onClick={handleExport} title="Export current list to Excel">
            <FileSpreadsheet size={16} /> Export Quotas
          </button>
          <button className="tm-btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Assign Revenue Target
          </button>
        </div>
      </div>

      {/* ── KPI Deck ── */}
      <div className="tm-kpi-grid">
        {/* Total Target */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-primary)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Cumulative Goal</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(59, 130, 246, 0.12)', '--icon-color': '#3b82f6' }}>
              <Target size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value">{formatCurrency(totalTarget)}</div>
          </div>
          <div className="tm-kpi-footer">
            <span>{enrichedTargets.length} Assigned Quotas</span>
            <span className="tm-trend-badge tm-trend-neutral">Target Pool</span>
          </div>
        </div>

        {/* Confirmed Achieved */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-emerald)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Confirmed Revenue</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(16, 185, 129, 0.12)', '--icon-color': '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#10b981' }}>{formatCurrency(totalAchieved)}</div>
          </div>
          <div className="tm-kpi-footer">
            <span>{overallAchievement}% Overall Conversion</span>
            <span className="tm-trend-badge tm-trend-positive">
              <ArrowUpRight size={12} /> {overallAchievement >= 80 ? 'On Track' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Remaining Deficit */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-rose)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Remaining Shortfall</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(244, 63, 94, 0.12)', '--icon-color': '#f43f5e' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: totalRemaining > 0 ? '#f43f5e' : '#10b981' }}>
              {formatCurrency(totalRemaining)}
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>Awaiting Order Closure</span>
            <span className="tm-trend-badge tm-trend-negative">Gap To Goal</span>
          </div>
        </div>

        {/* Quota Health Distribution */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-indigo)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Team Quota Health</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(99, 102, 241, 0.12)', '--icon-color': '#6366f1' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#6366f1' }}>
              {countAchieved + countOnTrack} / {enrichedTargets.length || 0}
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>{countAchieved} Hit · {countOnTrack} Track · {countBehind} Lag</span>
            <span className="tm-trend-badge tm-trend-neutral">Reps Benchmarked</span>
          </div>
        </div>
      </div>

      {/* ── Visual Intelligence & Leaderboard ── */}
      <div className="tm-analytics-grid">
        {/* Target vs Actual Chart */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <TrendingUp size={18} style={{ color: '#3b82f6' }} />
                Target vs Actual Confirmed Revenue (₹ Lakhs)
              </h3>
              <div className="tm-card-subtitle">Real-time comparison across active sales personnel</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ height: '280px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No active targets to display in telemetry chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="L" />
                  <Tooltip
                    formatter={(val, name) => [`₹${(Number(val) * 100000).toLocaleString('en-IN')}`, name]}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Achieved" radius={[4, 4, 0, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pct >= 80 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="Achieved" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales Leaderboard */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <Award size={18} style={{ color: '#eab308' }} />
                Sales Performance Leaderboard
              </h3>
              <div className="tm-card-subtitle">Ranked by verified confirmed revenue</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ overflowY: 'auto', maxHeight: '280px' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '13px' }}>
                No sales targets recorded.
              </div>
            ) : (
              <div className="tm-leaderboard-list">
                {leaderboard.map((item, index) => {
                  const rankClass = index === 0 ? 'tm-rank-1' : index === 1 ? 'tm-rank-2' : index === 2 ? 'tm-rank-3' : 'tm-rank-other';
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
                  return (
                    <div key={item.id} className="tm-leader-item">
                      <div className={`tm-leader-rank ${rankClass}`}>{medal}</div>
                      <div className="tm-leader-info">
                        <div className="tm-leader-avatar">
                          {item.salespersonName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="tm-leader-name">{item.salespersonName}</div>
                          <div className="tm-leader-meta">
                            {item.qualifyingOrders?.length || 0} Orders · {item.period}
                          </div>
                        </div>
                      </div>
                      <div className="tm-leader-stats">
                        <div className="tm-leader-amount">{formatCurrency(item.achieved)}</div>
                        <span className={`tm-badge ${item.status.class}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="tm-filter-bar">
        <div className="tm-filter-pills">
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginRight: '6px' }}>PERIOD:</span>
          {['ALL', 'Monthly', 'Quarterly', 'Yearly'].map(p => (
            <button
              key={p}
              className={`tm-filter-pill ${periodFilter === p ? 'active' : ''}`}
              onClick={() => setPeriodFilter(p)}
            >
              {p}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: '0 6px 0 12px' }}>STATUS:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACHIEVED', label: 'Achieved (≥100%)' },
            { id: 'ON_TRACK', label: 'On Track (≥80%)' },
            { id: 'ATTENTION', label: 'Needs Attention' },
            { id: 'BEHIND', label: 'Behind (<50%)' }
          ].map(s => (
            <button
              key={s.id}
              className={`tm-filter-pill ${statusFilter === s.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: '0 6px 0 12px' }}>SALESPERSON:</span>
          <select
            className="tm-form-select"
            style={{ width: 'auto', minWidth: '190px', padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
          >
            <option value="ALL">All Sales Users</option>
            <option value="CORE">👤 Core Sales (Sales 1 - 14)</option>
            <option value="SUPER">⚡ Super Sales Only</option>
            {salesPersonnelData.core.length > 0 && (
              <optgroup label="Core Sales Reps">
                {salesPersonnelData.core.map(p => (
                  <option key={p.id} value={p.id}>{p.displayLabel}</option>
                ))}
              </optgroup>
            )}
            {salesPersonnelData.superList.length > 0 && (
              <optgroup label="Super Sales Reps">
                {salesPersonnelData.superList.map(p => (
                  <option key={p.id} value={p.id}>{p.displayLabel}</option>
                ))}
              </optgroup>
            )}
            {salesPersonnelData.other.length > 0 && (
              <optgroup label="Other Sales">
                {salesPersonnelData.other.map(p => (
                  <option key={p.id} value={p.id}>{p.displayLabel}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tm-search-wrap">
            <Search size={15} className="tm-search-icon" />
            <input
              type="text"
              className="tm-search-input"
              placeholder="Search by salesperson or period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button className="tm-action-btn" onClick={onRefresh} title="Refresh telemetry">
              <RefreshCw size={15} color="#64748b" />
            </button>
          )}
        </div>
      </div>

      {/* ── Targets Table & Mobile Cards ── */}
      <div className="tm-card">
        <div className="tm-card-header">
          <div>
            <h3 className="tm-card-title">
              Active Sales Quotas & Velocity Registry
            </h3>
            <div className="tm-card-subtitle">Showing {filteredTargets.length} of {enrichedTargets.length} allocated targets</div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="tm-desktop-only">
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Salesperson</th>
                  <th>Target Period</th>
                  <th>Target Amount</th>
                  <th>Confirmed Revenue</th>
                  <th>Remaining Deficit</th>
                  <th style={{ width: '180px' }}>Achievement Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No sales targets found matching your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="tm-leader-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {row.salespersonName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{row.salespersonName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {row.startDate} → {row.endDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tm-filter-pill" style={{ padding: '3px 10px', fontSize: '11px', background: '#f8fafc' }}>
                          {row.period}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a' }}>{formatCurrency(row.targetAmount)}</strong>
                          {!row.hasExplicitTarget && (
                            <span style={{
                              fontSize: '10px',
                              padding: '1.5px 6px',
                              borderRadius: '9999px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: '700',
                              border: '1px solid #bfdbfe',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              Benchmark
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981' }}>{formatCurrency(row.achieved)}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {row.qualifyingOrders?.length || 0} Eligible Orders
                        </div>
                      </td>
                      <td>
                        <span style={{ color: row.remaining > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                          {row.remaining > 0 ? formatCurrency(row.remaining) : 'Fulfilled ✅'}
                        </span>
                        {row.remaining > 0 && row.daysRemaining > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            Req: {formatCurrency(row.requiredDaily)}/day
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="tm-progress-bar-wrap">
                            <div
                              className="tm-progress-bar-fill"
                              style={{
                                width: `${Math.min(100, row.pct)}%`,
                                background: row.pct >= 100
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : row.pct >= 80
                                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                    : row.pct >= 50
                                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                      : 'linear-gradient(90deg, #ef4444, #dc2626)'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '35px' }}>{row.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tm-badge ${row.status.class}`}>
                          {row.status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="tm-action-btn tm-action-orders"
                            onClick={() => {
                              setSelectedTarget(row);
                              setShowOrdersModal(true);
                            }}
                            title="View Contributing Confirmed Orders"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="tm-action-btn tm-action-velocity"
                            onClick={() => {
                              setSelectedTarget(row);
                              setShowVelocityModal(true);
                            }}
                            title="Pacing & Run-rate Telemetry"
                          >
                            <TrendingUp size={14} />
                          </button>
                          {row.hasExplicitTarget ? (
                            <>
                              <button
                                className="tm-action-btn tm-action-edit"
                                onClick={() => handleOpenEdit(row)}
                                title="Edit Target Allocation"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="tm-action-btn tm-action-delete"
                                onClick={() => handleDeleteTarget(row)}
                                title="Delete Target"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="tm-action-btn tm-action-edit"
                              style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}
                              onClick={() => handleOpenEdit(row)}
                              title="Assign Custom Target Quota"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="tm-mobile-only" style={{ padding: '16px' }}>
          {filteredTargets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              No targets configured.
            </div>
          ) : (
            filteredTargets.map(row => (
              <div
                key={row.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{row.salespersonName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.period} · {row.startDate} to {row.endDate}</div>
                  </div>
                  <span className={`tm-badge ${row.status.class}`}>
                    {row.status.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>
                      TARGET {!row.hasExplicitTarget && <span style={{ color: '#2563eb' }}>(BENCHMARK)</span>}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(row.targetAmount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>ACHIEVED</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(row.achieved)}</div>
                  </div>
                </div>

                <div className="tm-progress-bar-wrap">
                  <div
                    className="tm-progress-bar-fill"
                    style={{
                      width: `${Math.min(100, row.pct)}%`,
                      background: row.pct >= 80 ? '#10b981' : '#3b82f6'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{row.pct}% Completed</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="tm-action-btn tm-action-orders"
                      onClick={() => { setSelectedTarget(row); setShowOrdersModal(true); }}
                      title="View Confirmed Orders"
                    >
                      <Eye size={14} />
                    </button>
                    {row.hasExplicitTarget ? (
                      <>
                        <button
                          className="tm-action-btn tm-action-edit"
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Target"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="tm-action-btn tm-action-delete"
                          onClick={() => handleDeleteTarget(row)}
                          title="Delete Target"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="tm-action-btn tm-action-edit"
                        style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}
                        onClick={() => handleOpenEdit(row)}
                        title="Assign Custom Quota"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Assign / Edit Target Modal (with Live Pacing Calculator) ── */}
      {showTargetModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card">
            <div className="tm-modal-header">
              <div className="tm-modal-header-left">
                <div className="tm-modal-icon-badge">
                  <Target size={22} />
                </div>
                <div>
                  <h3 className="tm-modal-title">
                    {modalMode === 'create' ? 'Assign Sales Revenue Quota' : 'Modify Revenue Quota'}
                  </h3>
                  <p className="tm-modal-subtitle">
                    Configure milestone quota and calculate required run-rate
                  </p>
                </div>
              </div>
              <button className="tm-modal-close" onClick={() => setShowTargetModal(false)} type="button">✕</button>
            </div>

            <form onSubmit={handleSaveTarget}>
              <div className="tm-modal-body">
                {/* Salesperson Selector */}
                <div className="tm-form-group">
                  <label className="tm-form-label">
                    Salesperson <span className="tm-required">*</span>
                  </label>
                  <select
                    className="tm-form-select"
                    required
                    value={formData.salespersonId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'ALL_SALES') {
                        setFormData({
                          ...formData,
                          salespersonId: 'ALL_SALES',
                          salespersonName: 'All Sales Personnel (Team-Wide Quota)'
                        });
                      } else if (val === 'ALL_SUPERSALES') {
                        setFormData({
                          ...formData,
                          salespersonId: 'ALL_SUPERSALES',
                          salespersonName: 'All Super Sales Team (SuperSales 1 & 2)'
                        });
                      } else {
                        const sel = salesPersonnel.find(p => String(p.id) === String(val));
                        setFormData({
                          ...formData,
                          salespersonId: val,
                          salespersonName: sel?.name || ''
                        });
                      }
                    }}
                  >
                    <optgroup label="⭐ Team-Wide Quota Presets">
                      <option value="ALL_SALES">
                        ⭐ All Sales Personnel ({salesPersonnelData.core.length + salesPersonnelData.other.length} Reps)
                      </option>
                      <option value="ALL_SUPERSALES">
                        ⚡ All Super Sales ({salesPersonnelData.superList.length} Reps)
                      </option>
                    </optgroup>

                    {salesPersonnelData.core.length > 0 && (
                      <optgroup label="👤 Core Sales Representatives (Sales 1 - 14)">
                        {salesPersonnelData.core.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.displayLabel}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {salesPersonnelData.superList.length > 0 && (
                      <optgroup label="🚀 Super Sales Executive Team">
                        {salesPersonnelData.superList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.displayLabel}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {salesPersonnelData.other.length > 0 && (
                      <optgroup label="💼 Other Sales Personnel">
                        {salesPersonnelData.other.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.displayLabel}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Period Preset & Date Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Target Period <span className="tm-required">*</span>
                    </label>
                    <select
                      className="tm-form-select"
                      value={formData.period}
                      onChange={(e) => {
                        const period = e.target.value;
                        const now = new Date();
                        let start = '';
                        let end = '';
                        if (period === 'Monthly') {
                          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                        } else if (period === 'Quarterly') {
                          const q = Math.floor(now.getMonth() / 3);
                          start = new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0];
                        } else if (period === 'Yearly') {
                          start = new Date(now.getFullYear(), 3, 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear() + 1, 2, 31).toISOString().split('T')[0];
                        }
                        setFormData({ ...formData, period, startDate: start, endDate: end });
                      }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Revenue Target (INR) <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Start Date <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      End Date <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Live Pacing Calculation Box */}
                <div className="tm-velocity-widget">
                  <div className="tm-velocity-header">
                    <span className="tm-velocity-title">
                      <TrendingUp size={13} style={{ color: '#2563eb' }} />
                      Live Pacing &amp; Velocity Telemetry
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      {formData.salespersonId === 'ALL_SALES'
                        ? `Allocating across ${salesPersonnelData.core.length + salesPersonnelData.other.length} Reps`
                        : formData.salespersonId === 'ALL_SUPERSALES'
                        ? `Allocating across ${salesPersonnelData.superList.length} Super Sales`
                        : 'Auto-calculated'}
                    </span>
                  </div>
                  <div className="tm-velocity-grid">
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">Window Duration</span>
                      <span className="tm-velocity-pill-value">{modalLiveVelocity.totalDays} Days</span>
                      <span className="tm-velocity-pill-sub">Target period</span>
                    </div>
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">
                        {formData.salespersonId === 'ALL_SALES' || formData.salespersonId === 'ALL_SUPERSALES'
                          ? 'Target / Rep'
                          : 'Target Revenue'}
                      </span>
                      <span className="tm-velocity-pill-value highlight-primary">{formatCurrency(formData.targetAmount)}</span>
                      <span className="tm-velocity-pill-sub">
                        {formData.salespersonId === 'ALL_SALES'
                          ? `Pool: ${formatCurrency(formData.targetAmount * (salesPersonnelData.core.length + salesPersonnelData.other.length))}`
                          : formData.salespersonId === 'ALL_SUPERSALES'
                          ? `Pool: ${formatCurrency(formData.targetAmount * salesPersonnelData.superList.length)}`
                          : 'Total quota'}
                      </span>
                    </div>
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">Required Velocity</span>
                      <span className="tm-velocity-pill-value highlight-emerald">
                        {formatCurrency(modalLiveVelocity.dailyRequired)}
                      </span>
                      <span className="tm-velocity-pill-sub">
                        {formData.salespersonId === 'ALL_SALES' || formData.salespersonId === 'ALL_SUPERSALES'
                          ? 'Per rep / day'
                          : 'Per day required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="tm-form-group">
                  <label className="tm-form-label">Strategic Remarks / Notes</label>
                  <textarea
                    className="tm-form-textarea"
                    rows={2}
                    placeholder="e.g. Focus on moulded products and top distributor renewals..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-modal-footer">
                <button
                  type="button"
                  className="tm-btn-ghost"
                  onClick={() => setShowTargetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tm-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Target...' : modalMode === 'create' ? 'Assign Target' : 'Update Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contributing Confirmed Orders Modal ── */}
      {showOrdersModal && selectedTarget && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card tm-modal-card-lg">
            <div className="tm-modal-header">
              <div className="tm-modal-header-left">
                <div className="tm-modal-icon-badge emerald">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="tm-modal-title">
                    Confirmed Orders — {selectedTarget.salespersonName}
                  </h3>
                  <p className="tm-modal-subtitle">
                    Target Period: {selectedTarget.startDate} to {selectedTarget.endDate} · {formatCurrency(selectedTarget.achieved)} Confirmed
                  </p>
                </div>
              </div>
              <button className="tm-modal-close" onClick={() => setShowOrdersModal(false)} type="button">✕</button>
            </div>

            <div className="tm-modal-body" style={{ maxHeight: '60vh', padding: '0' }}>
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Order Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTarget.qualifyingOrders || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No eligible confirmed sales orders recorded for this rep in this period window.
                      </td>
                    </tr>
                  ) : (
                    selectedTarget.qualifyingOrders.map((ord, idx) => (
                      <tr key={ord.id || idx}>
                        <td>
                          <strong style={{ color: '#2563eb' }}>{ord.orderId || ord.orderNo || ord.id}</strong>
                        </td>
                        <td>
                          <div>{ord.customer?.name || ord.customerName || ord.cust || 'Direct Customer'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.productName || ord.products || 'Finished Goods'}</div>
                        </td>
                        <td>
                          {normalizeDate(ord.createdAt || ord.date || ord.orderDate)}
                        </td>
                        <td>
                          <span className="tm-badge tm-badge-active" style={{ fontSize: '10.5px' }}>
                            {ord.orderLifecycleStatus || ord.workflowStatus || ord.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#0f172a' }}>
                            {formatCurrency(ord.grandTotal || ord.totalAmount || ord.amount || 0)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="tm-modal-footer">
              <button className="tm-btn-primary" onClick={() => setShowOrdersModal(false)}>
                Done Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pacing & Velocity Telemetry Modal ── */}
      {showVelocityModal && selectedTarget && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card">
            <div className="tm-modal-header">
              <div className="tm-modal-header-left">
                <div className="tm-modal-icon-badge">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 className="tm-modal-title">
                    Pacing Telemetry: {selectedTarget.salespersonName}
                  </h3>
                  <p className="tm-modal-subtitle">
                    Live velocity run-rate and milestone trajectory
                  </p>
                </div>
              </div>
              <button className="tm-modal-close" onClick={() => setShowVelocityModal(false)} type="button">✕</button>
            </div>

            <div className="tm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>QUOTA ASSIGNMENT</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    {formatCurrency(selectedTarget.targetAmount)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{selectedTarget.period} Window</div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ACHIEVED SALES</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                    {formatCurrency(selectedTarget.achieved)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>
                    {selectedTarget.pct}% Completed
                  </div>
                </div>
              </div>

              <div className="tm-velocity-widget">
                <div className="tm-velocity-header">
                  <span className="tm-velocity-title">
                    <TrendingUp size={13} style={{ color: '#2563eb' }} />
                    Run-Rate Breakdown
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    Active Window
                  </span>
                </div>
                <div className="tm-velocity-grid">
                  <div className="tm-velocity-pill">
                    <span className="tm-velocity-pill-label">Days Total</span>
                    <span className="tm-velocity-pill-value">{selectedTarget.totalDays} Days</span>
                    <span className="tm-velocity-pill-sub">Full duration</span>
                  </div>
                  <div className="tm-velocity-pill">
                    <span className="tm-velocity-pill-label">Days Left</span>
                    <span className="tm-velocity-pill-value" style={{ color: '#ef4444' }}>{selectedTarget.daysRemaining} Days</span>
                    <span className="tm-velocity-pill-sub">Remaining</span>
                  </div>
                  <div className="tm-velocity-pill">
                    <span className="tm-velocity-pill-label">Daily Run-Rate</span>
                    <span className="tm-velocity-pill-value highlight-primary">
                      {formatCurrency(selectedTarget.requiredDaily)}
                    </span>
                    <span className="tm-velocity-pill-sub">Per day required</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', color: '#166534' }}>
                💡 <strong>Target Benchmark:</strong> At the current confirmed revenue rate of <strong>{formatCurrency(selectedTarget.achieved)}</strong>, this representative is <strong>{selectedTarget.status.label}</strong> with {selectedTarget.qualifyingOrders?.length || 0} confirmed client purchases.
              </div>
            </div>

            <div className="tm-modal-footer">
              <button className="tm-btn-primary" onClick={() => setShowVelocityModal(false)}>
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
