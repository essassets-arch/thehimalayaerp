'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { backendFetch } from '../../../lib/backendFetch';
import Swal from 'sweetalert2';
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Boxes,
  Layers,
  Scale,
  Activity,
  Printer,
  ChevronRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  Send,
  X,
  Eye,
  Sliders,
  ClipboardList,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Zap,
  Target,
  Percent,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  ComposedChart,
  Line
} from 'recharts';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProductionReportsView() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Responsive Breakpoint Detection
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isLarge = windowWidth >= 1440;

  // Raw API Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [testingRecords, setTestingRecords] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);

  // Filter States
  const [activeTab, setActiveTab] = useState('work-orders');
  const [preset, setPreset] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Chart Metric Toggle
  const [chartMetric, setChartMetric] = useState('sets'); // 'sets' | 'weight'

  // Modal State for viewing detail
  const [detailModal, setDetailModal] = useState(null);

  /* ── Load All Data Concurrently from Backend with Live Cache-Busting ── */
  const fetchAllReportData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [dashRes, woRes, dailyRes, testRes, qcInspRes, matRes] = await Promise.all([
        backendFetch('/api/backend/production/dashboard', { cacheTtlMs: 0 }).catch(() => null),
        backendFetch('/api/backend/production/work-orders', { cacheTtlMs: 0 }).catch(() => null),
        backendFetch('/api/backend/production/daily-reports?limit=1000', { cacheTtlMs: 0 }).catch(() => null),
        backendFetch('/api/backend/production/testing', { cacheTtlMs: 0 }).catch(() => null),
        backendFetch('/api/backend/qc/inspections', { cacheTtlMs: 0 }).catch(() => null),
        backendFetch('/api/backend/material-requests', { cacheTtlMs: 0 }).catch(() => null)
      ]);

      if (dashRes) setDashboardData(dashRes);

      // 1. Work Orders
      const woList = Array.isArray(woRes)
        ? woRes
        : (Array.isArray(woRes?.data) ? woRes.data : (dashRes?.recentWorkOrders || []));
      setWorkOrders(woList);

      // 2. Daily Shift Reports
      const dailyList = Array.isArray(dailyRes?.items)
        ? dailyRes.items
        : (Array.isArray(dailyRes?.data) ? dailyRes.data : (Array.isArray(dailyRes) ? dailyRes : []));
      setDailyReports(dailyList);

      // 3. Testing Records + QC Inspections
      const rawTest = Array.isArray(testRes?.data) ? testRes.data : (Array.isArray(testRes) ? testRes : []);
      const rawQc = Array.isArray(qcInspRes?.data) ? qcInspRes.data : (Array.isArray(qcInspRes) ? qcInspRes : []);
      
      const combinedTesting = [...rawTest];
      const seenTestIds = new Set(rawTest.map(t => String(t.id || t.referenceNo || '')));
      for (const qc of rawQc) {
        const idKey = String(qc.id || qc.referenceNo || '');
        if (!seenTestIds.has(idKey)) {
          combinedTesting.push({
            id: qc.id,
            referenceNo: qc.inspectionNumber || qc.referenceNo || `QC-${qc.id?.slice(0, 6)}`,
            productName: qc.productName || qc.item?.name || qc.product?.name || 'Inspected Product',
            quantity: Number(qc.sampleSize || qc.quantity || 1),
            status: qc.result === 'PASS' || qc.status === 'PASSED' || qc.status === 'APPROVED' ? 'Approved' : (qc.result === 'FAIL' || qc.status === 'FAILED' || qc.status === 'REJECTED' ? 'Rejected' : 'Pending'),
            reviewedBy: qc.inspector?.name || qc.reviewedBy || 'QC Inspector',
            remarks: qc.remarks || qc.notes || qc.failureReason || '—',
            createdAt: qc.inspectedAt || qc.createdAt || new Date().toISOString()
          });
        }
      }
      setTestingRecords(combinedTesting);

      // 4. Material Requests
      const matList = Array.isArray(matRes?.data) ? matRes.data : (Array.isArray(matRes) ? matRes : []);
      setMaterialRequests(matList);

    } catch (err) {
      console.error('[ProductionReportsView] Error loading report data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReportData();
  }, [fetchAllReportData]);

  /* ── Date Filtering Helper ── */
  const isWithinDateRange = useCallback((dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    const now = new Date();
    if (preset === 'Today') {
      return d.toDateString() === now.toDateString();
    }
    if (preset === 'Yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return d.toDateString() === y.toDateString();
    }
    if (preset === 'Last 7 Days') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      past7.setHours(0, 0, 0, 0);
      return d >= past7;
    }
    if (preset === 'This Month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (d < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }, [preset, startDate, endDate]);

  /* ── Filtered Datasets ── */
  const workOrdersList = useMemo(() => {
    return workOrders.filter((wo) => {
      const woNum = String(wo.workOrderNumber || wo.orderNumber || wo.id || '').toLowerCase();
      const pName = String(wo.salesOrderItem?.product?.name || wo.product?.name || wo.productName || '').toLowerCase();
      const cName = String(wo.salesOrder?.customer?.name || wo.customerName || '').toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        woNum.includes(searchQuery.toLowerCase()) ||
        pName.includes(searchQuery.toLowerCase()) ||
        cName.includes(searchQuery.toLowerCase());

      const statusVal = String(wo.productionStatus || wo.workflowStatus || wo.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'All' || statusVal === statusFilter.toUpperCase() ||
        (statusFilter === 'COMPLETED' && (statusVal.includes('COMPLET') || statusVal === 'QC_PASSED')) ||
        (statusFilter === 'IN_PRODUCTION' && (statusVal.includes('PROGRESS') || statusVal.includes('STARTED') || statusVal === 'IN_PRODUCTION')) ||
        (statusFilter === 'PENDING' && (statusVal.includes('PEND') || statusVal === 'PLANNED' || statusVal === 'QUEUED'));

      const matchesDate = isWithinDateRange(wo.createdAt || wo.startDate || wo.date);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [workOrders, searchQuery, statusFilter, isWithinDateRange]);

  const filteredDailyReports = useMemo(() => {
    return dailyReports.filter((r) => {
      const repNo = String(r.reportNo || r.id || '').toLowerCase();
      const sup = String(r.shiftSupervisorName || r.supervisorName || '').toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        repNo.includes(searchQuery.toLowerCase()) ||
        sup.includes(searchQuery.toLowerCase());

      const matchesShift = shiftFilter === 'All' || String(r.shift || '').toLowerCase().includes(shiftFilter.toLowerCase().replace('shift ', ''));
      const statusVal = String(r.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'All' || statusVal === statusFilter.toUpperCase();
      const matchesDate = isWithinDateRange(r.reportDate || r.createdAt);
      return matchesSearch && matchesShift && matchesStatus && matchesDate;
    });
  }, [dailyReports, searchQuery, shiftFilter, statusFilter, isWithinDateRange]);

  const filteredTestingRecords = useMemo(() => {
    return testingRecords.filter((t) => {
      const refNo = String(t.referenceNo || t.id || '').toLowerCase();
      const pName = String(t.productName || '').toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        refNo.includes(searchQuery.toLowerCase()) ||
        pName.includes(searchQuery.toLowerCase());

      const st = String(t.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'All' || st === statusFilter.toUpperCase() ||
        (statusFilter === 'APPROVED' && (st === 'APPROVED' || st === 'PASS' || st === 'PASSED')) ||
        (statusFilter === 'PENDING' && (st === 'PENDING' || st === 'IN_TESTING'));

      const matchesDate = isWithinDateRange(t.createdAt);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [testingRecords, searchQuery, statusFilter, isWithinDateRange]);

  const filteredMaterialRequests = useMemo(() => {
    return materialRequests.filter((m) => {
      const reqNo = String(m.requestNo || m.id || '').toLowerCase();
      const reqPerson = String(m.requester || m.requestedBy?.name || '').toLowerCase();
      const woRef = String(m.workOrderNo || m.workOrderId || '').toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        reqNo.includes(searchQuery.toLowerCase()) ||
        reqPerson.includes(searchQuery.toLowerCase()) ||
        woRef.includes(searchQuery.toLowerCase());

      const st = String(m.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'All' || st === statusFilter.toUpperCase();
      const matchesDate = isWithinDateRange(m.requestDate || m.createdAt);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [materialRequests, searchQuery, statusFilter, isWithinDateRange]);

  /* ── Dynamic KPI Stats Calculation ── */
  const kpiStats = useMemo(() => {
    const totalWO = workOrdersList.length;
    const activeWO = workOrdersList.filter(wo => {
      const s = String(wo.productionStatus || wo.workflowStatus || wo.status || '').toUpperCase();
      return s === 'IN_PRODUCTION' || s === 'IN_PROGRESS' || s === 'RUNNING' || s === 'STARTED' || s === 'PAUSED';
    }).length;
    const completedWO = workOrdersList.filter(wo => {
      const s = String(wo.productionStatus || wo.workflowStatus || wo.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'QC_PASSED' || s === 'FINISHED';
    }).length;

    // Output volumes from shift reports & work orders
    const totalWeightKg = filteredDailyReports.reduce((sum, r) => sum + (Number(r.totalWeight) || 0), 0);
    const totalWeightMT = (totalWeightKg / 1000).toFixed(2);
    const totalSets = filteredDailyReports.reduce((sum, r) => sum + (Number(r.totalSets) || 0), 0);
    const totalCovers = filteredDailyReports.reduce((sum, r) => sum + (Number(r.totalCovers) || 0), 0);
    const totalFrames = filteredDailyReports.reduce((sum, r) => sum + (Number(r.totalFrames) || 0), 0);

    // Dynamic QC Yield Rate
    const totalTested = filteredTestingRecords.length;
    const passedTested = filteredTestingRecords.filter(t => {
      const s = String(t.status || '').toUpperCase();
      return s === 'APPROVED' || s === 'PASS' || s === 'PASSED';
    }).length;
    const failedTested = filteredTestingRecords.filter(t => {
      const s = String(t.status || '').toUpperCase();
      return s === 'REJECTED' || s === 'FAIL' || s === 'FAILED';
    }).length;

    const qcYieldPct = totalTested > 0
      ? ((passedTested / totalTested) * 100).toFixed(1)
      : '100.0';

    const completionRate = totalWO > 0
      ? Math.round((completedWO / totalWO) * 100)
      : 0;

    return {
      totalWO,
      activeWO,
      completedWO,
      completionRate,
      totalWeightKg: totalWeightKg.toLocaleString(),
      totalWeightMT,
      totalSets: totalSets.toLocaleString(),
      totalCovers: totalCovers.toLocaleString(),
      totalFrames: totalFrames.toLocaleString(),
      qcYieldPct,
      totalTested,
      passedTested,
      failedTested,
      materialReqCount: filteredMaterialRequests.length,
    };
  }, [workOrdersList, filteredDailyReports, filteredTestingRecords, filteredMaterialRequests]);

  /* ── Dynamic Chart 1: Daily Production Output & Trend (Dual Metrics) ── */
  const dailyOutputTrendData = useMemo(() => {
    const dateMap = new Map();

    // 1. Populate days from daily reports
    filteredDailyReports.forEach(r => {
      const d = r.reportDate || r.createdAt;
      if (!d) return;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return;
      const isoDate = dateObj.toISOString().slice(0, 10);
      const dateKey = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      const current = dateMap.get(isoDate) || { isoDate, name: dateKey, sets: 0, weightKg: 0, weightMT: 0, covers: 0, frames: 0, workOrders: 0 };
      current.sets += Number(r.totalSets || 0);
      const w = Number(r.totalWeight || 0);
      current.weightKg += w;
      current.weightMT = Number((current.weightKg / 1000).toFixed(2));
      current.covers += Number(r.totalCovers || 0);
      current.frames += Number(r.totalFrames || 0);
      dateMap.set(isoDate, current);
    });

    // 2. Also map from work orders produced quantities
    workOrdersList.forEach(wo => {
      const d = wo.createdAt || wo.startDate;
      if (!d) return;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return;
      const isoDate = dateObj.toISOString().slice(0, 10);
      const dateKey = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      const current = dateMap.get(isoDate) || { isoDate, name: dateKey, sets: 0, weightKg: 0, weightMT: 0, covers: 0, frames: 0, workOrders: 0 };
      current.workOrders += 1;
      if (current.sets === 0) {
        current.sets += Number(wo.quantityProduced || wo.producedQty || 0);
      }
      dateMap.set(isoDate, current);
    });

    const entries = Array.from(dateMap.values()).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    if (entries.length > 0) {
      return entries.slice(-14);
    }

    // Default real zero 7-day chronological window if completely empty
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      result.push({
        name: label,
        sets: 0,
        covers: 0,
        frames: 0,
        weightMT: 0,
        weightKg: 0
      });
    }
    return result;
  }, [filteredDailyReports, workOrdersList]);

  /* ── Dynamic Chart 2: Shift Distribution (A / B / C) ── */
  const shiftComparisonData = useMemo(() => {
    const shifts = {
      'Shift A': { name: 'Shift A (Morning)', sets: 0, weightMT: 0, covers: 0, frames: 0, fill: '#10b981' },
      'Shift B': { name: 'Shift B (Evening)', sets: 0, weightMT: 0, covers: 0, frames: 0, fill: '#3b82f6' },
      'Shift C': { name: 'Shift C (Night)', sets: 0, weightMT: 0, covers: 0, frames: 0, fill: '#8b5cf6' }
    };

    filteredDailyReports.forEach(r => {
      const rawShift = String(r.shift || '').toUpperCase();
      let key = 'Shift A';
      if (rawShift.includes('B') || rawShift.includes('EVENING')) key = 'Shift B';
      else if (rawShift.includes('C') || rawShift.includes('NIGHT')) key = 'Shift C';
      
      shifts[key].sets += Number(r.totalSets || 0);
      shifts[key].covers += Number(r.totalCovers || 0);
      shifts[key].frames += Number(r.totalFrames || 0);
      shifts[key].weightMT += Number((Number(r.totalWeight || 0) / 1000).toFixed(2));
    });

    return Object.values(shifts);
  }, [filteredDailyReports]);

  /* ── Dynamic Chart 3: QC Pass vs Fail Breakdown ── */
  const qcStatusPieData = useMemo(() => {
    let pass = 0;
    let fail = 0;
    let pending = 0;

    filteredTestingRecords.forEach(t => {
      const s = String(t.status || '').toUpperCase();
      if (s === 'APPROVED' || s === 'PASS' || s === 'PASSED') pass++;
      else if (s === 'REJECTED' || s === 'FAIL' || s === 'FAILED') fail++;
      else pending++;
    });

    if (pass === 0 && fail === 0 && pending === 0) {
      return [
        { name: 'No Testing Records', value: 1, color: '#cbd5e1' }
      ];
    }

    const data = [];
    if (pass > 0) data.push({ name: 'Passed / Approved', value: pass, color: '#10b981' });
    if (pending > 0) data.push({ name: 'In Inspection', value: pending, color: '#38bdf8' });
    if (fail > 0) data.push({ name: 'Rework / Defect', value: fail, color: '#ef4444' });
    return data;
  }, [filteredTestingRecords]);

  /* ── Dynamic Chart 4: Top Manufactured Products ── */
  const topProductsData = useMemo(() => {
    const map = new Map();

    // 1. From Work Orders
    workOrdersList.forEach(wo => {
      const name = wo.salesOrderItem?.product?.name || wo.product?.name || wo.productName || 'Standard Assembly';
      const current = map.get(name) || { name: name.length > 20 ? name.slice(0, 18) + '...' : name, fullName: name, target: 0, produced: 0 };
      current.target += Number(wo.targetQuantity || wo.quantity || 10);
      current.produced += Number(wo.quantityProduced || wo.producedQty || 0);
      map.set(name, current);
    });

    // 2. From Daily Shift line items
    filteredDailyReports.forEach(r => {
      if (Array.isArray(r.items)) {
        r.items.forEach(it => {
          const name = it.product?.name || it.customProductName || it.productName || 'Manhole Cover / Frame';
          const current = map.get(name) || { name: name.length > 20 ? name.slice(0, 18) + '...' : name, fullName: name, target: 0, produced: 0 };
          const sets = Math.min(Number(it.coverQty || 0), Number(it.frameQty || 0)) || Number(it.coverQty || 0) || Number(it.frameQty || 0);
          current.produced += sets;
          if (current.target === 0) current.target += sets;
          map.set(name, current);
        });
      }
    });

    const arr = Array.from(map.values()).sort((a, b) => b.produced - a.produced);
    if (arr.length > 0) return arr.slice(0, 5);

    return [
      { name: 'No Production in Range', target: 0, produced: 0 }
    ];
  }, [workOrdersList, filteredDailyReports]);

  /* ── CSV Export Handler ── */
  const handleExportCSV = (exportType) => {
    try {
      let headers = [];
      let rows = [];
      let filename = '';

      if (exportType === 'master-executive') {
        filename = `Master_Executive_Production_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = ['Category', 'Metric Name', 'Value / Details', 'Report Timestamp'];
        rows = [
          ['Executive KPI', 'Total Work Orders in Scope', String(kpiStats.totalWO), new Date().toLocaleString()],
          ['Executive KPI', 'Active Floor Jobs', String(kpiStats.activeWO), new Date().toLocaleString()],
          ['Executive KPI', 'Completed & Passed Orders', String(kpiStats.completedWO), new Date().toLocaleString()],
          ['Executive KPI', 'Plant Completion Rate (%)', `${kpiStats.completionRate}%`, new Date().toLocaleString()],
          ['Executive KPI', 'Quality Yield Rate (%)', `${kpiStats.qcYieldPct}%`, new Date().toLocaleString()],
          ['Executive KPI', 'Total Production Weight (MT)', `${kpiStats.totalWeightMT} MT`, new Date().toLocaleString()],
          ['Executive KPI', 'Total Sets Produced', String(kpiStats.totalSets), new Date().toLocaleString()],
          ['Executive KPI', 'Total Covers Produced', String(kpiStats.totalCovers), new Date().toLocaleString()],
          ['Executive KPI', 'Total Frames Produced', String(kpiStats.totalFrames), new Date().toLocaleString()],
          ['Executive KPI', 'Total Material Requisitions', String(kpiStats.materialReqCount), new Date().toLocaleString()],
          ['Executive KPI', 'Total Shift Logs Recorded', String(filteredDailyReports.length), new Date().toLocaleString()],
          ['Executive KPI', 'Total QC Test Register Items', String(filteredTestingRecords.length), new Date().toLocaleString()]
        ];

        // Append active work orders details
        rows.push(['', '', '', '']);
        rows.push(['Work Orders Breakdown', 'Work Order #', 'Product', 'Target Qty', 'Produced Qty', 'Status', 'QC Result', 'Date']);
        workOrdersList.forEach((wo) => {
          rows.push([
            'Work Order Record',
            `"${wo.workOrderNumber || wo.orderNumber || wo.id || ''}"`,
            `"${(wo.salesOrderItem?.product?.name || wo.productName || 'N/A').replace(/"/g, '""')}"`,
            String(wo.targetQuantity || wo.quantity || 0),
            String(wo.quantityProduced || wo.producedQty || 0),
            `"${wo.productionStatus || wo.workflowStatus || wo.status || ''}"`,
            `"${wo.qcResult || 'Pending'}"`,
            `"${new Date(wo.createdAt || Date.now()).toLocaleDateString('en-GB')}"`
          ]);
        });
      } else if (activeTab === 'work-orders') {
        filename = `Work_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = ['Work Order No', 'Product Name', 'Target Qty', 'Produced Qty', 'Completion %', 'Status', 'Target Date', 'QC Result', 'Created At'];
        rows = workOrdersList.map((wo) => {
          const target = Number(wo.targetQuantity || wo.quantity || 10);
          const produced = Number(wo.quantityProduced || wo.producedQty || 0);
          const pct = target > 0 ? Math.min(100, Math.round((produced / target) * 100)) : 0;
          return [
            `"${wo.workOrderNumber || wo.orderNumber || wo.id || ''}"`,
            `"${(wo.salesOrderItem?.product?.name || wo.productName || 'N/A').replace(/"/g, '""')}"`,
            String(target),
            String(produced),
            `${pct}%`,
            `"${wo.productionStatus || wo.workflowStatus || wo.status || 'IN_PROGRESS'}"`,
            `"${wo.targetDate || wo.deliveryDate || 'N/A'}"`,
            `"${wo.qcResult || 'PENDING'}"`,
            `"${new Date(wo.createdAt || Date.now()).toLocaleDateString('en-GB')}"`
          ];
        });
      } else if (activeTab === 'daily-shifts') {
        filename = `Daily_Shift_Production_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = ['Report No', 'Report Date', 'Shift', 'Supervisor', 'Covers Produced', 'Frames Produced', 'Total Sets', 'Weight (KG)', 'Weight (MT)', 'Status', 'Remarks'];
        rows = filteredDailyReports.map((r) => {
          const w = Number(r.totalWeight || 0);
          return [
            `"${r.reportNo || r.id || ''}"`,
            `"${r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : ''}"`,
            `"${r.shift || ''}"`,
            `"${(r.shiftSupervisorName || r.supervisorName || '').replace(/"/g, '""')}"`,
            String(r.totalCovers || 0),
            String(r.totalFrames || 0),
            String(r.totalSets || 0),
            w.toFixed(2),
            (w / 1000).toFixed(3),
            `"${r.status || 'DRAFT'}"`,
            `"${(r.remarks || '').replace(/"/g, '""')}"`
          ];
        });
      } else if (activeTab === 'qc-testing') {
        filename = `Quality_Testing_Register_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = ['Reference No', 'Product / Material', 'Quantity', 'UOM', 'Status', 'Tested By', 'Remarks', 'Date Created'];
        rows = filteredTestingRecords.map((t) => [
          `"${t.referenceNo || t.id || ''}"`,
          `"${(t.productName || '').replace(/"/g, '""')}"`,
          String(t.quantity || 0),
          'PCS',
          `"${t.status || 'Pending'}"`,
          `"${(t.reviewedBy || 'QC Inspector').replace(/"/g, '""')}"`,
          `"${(t.remarks || '').replace(/"/g, '""')}"`,
          `"${new Date(t.createdAt || Date.now()).toLocaleDateString('en-GB')}"`
        ]);
      } else if (activeTab === 'material-requests') {
        filename = `Material_Requests_Requisition_${new Date().toISOString().slice(0, 10)}.csv`;
        headers = ['Request No', 'Date', 'Warehouse', 'Requester', 'Priority', 'Work Order #', 'Status', 'Notes'];
        rows = filteredMaterialRequests.map((m) => [
          `"${m.requestNo || m.id || ''}"`,
          `"${m.requestDate || (m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-GB') : '')}"`,
          `"${(m.warehouse || 'Main Store').replace(/"/g, '""')}"`,
          `"${(m.requester || m.requestedBy?.name || '').replace(/"/g, '""')}"`,
          `"${m.priority || 'Normal'}"`,
          `"${m.workOrderNo || m.workOrderId || 'N/A'}"`,
          `"${m.status || 'Submitted'}"`,
          `"${(m.notes || '').replace(/"/g, '""')}"`
        ]);
      }

      if (rows.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Records to Export',
          text: 'There are no records matching your current filter criteria.',
          confirmButtonColor: '#2563eb'
        });
        return;
      }

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Report Exported!',
        text: `Successfully downloaded ${filename}`,
        timer: 1800,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('[ProductionReportsView] CSV Export error:', err);
      Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An error occurred while generating the CSV file.' });
    }
  };

  /* ── Status Badge Renderer ── */
  const renderStatusBadge = (status) => {
    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#cbd5e1';

    const st = (status || '').toUpperCase();
    if (st.includes('COMPLET') || st.includes('APPROV') || st.includes('PASS')) {
      bg = '#f0fdf4'; color = '#15803d'; border = '#bbf7d0';
    } else if (st.includes('PROGRESS') || st.includes('START') || st.includes('RUNNING')) {
      bg = '#f0f9ff'; color = '#0284c7'; border = '#bae6fd';
    } else if (st.includes('PENDING') || st.includes('SUBMIT') || st.includes('DRAFT') || st.includes('QUEUED')) {
      bg = '#fffbeb'; color = '#b45309'; border = '#fde68a';
    } else if (st.includes('FAIL') || st.includes('REJECT') || st.includes('CANCEL')) {
      bg = '#fef2f2'; color = '#b91c1c'; border = '#fecaca';
    } else if (st.includes('PAUSE') || st.includes('HOLD')) {
      bg = '#fff7ed'; color = '#c2410c'; border = '#fed7aa';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '6px',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', padding: isMobile ? '12px' : 'clamp(16px, 2.5vw, 24px)', background: '#F5FAFE', minHeight: '100vh', fontFamily: 'Inter, sans-serif', width: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* ── SECTION 1: HEADER & MASTER ACTIONS BAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #DCE5F0',
        borderRadius: '16px',
        padding: isMobile ? '14px 16px' : 'clamp(16px, 2vw, 24px)',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)', width: isMobile ? '36px' : '42px', height: isMobile ? '36px' : '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', flexShrink: 0 }}>
              <BarChart2 size={isMobile ? 20 : 24} />
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                Production Reports & Analytics
                <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} /> LIVE FEED
                </span>
              </h1>
              <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#5E6B82', margin: '3px 0 0 0' }}>
                Manufacturing intelligence, shift outputs, quality yields, and requisitions.
              </p>
            </div>
          </div>
        </div>

        {/* Master Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button
            type="button"
            onClick={fetchAllReportData}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              borderRadius: '10px',
              border: '1px solid #DCE5F0',
              background: '#ffffff',
              color: '#334155',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              flex: isMobile ? '1 1 calc(50% - 4px)' : 'none'
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => handleExportCSV('active-tab')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              flex: isMobile ? '1 1 calc(50% - 4px)' : 'none'
            }}
          >
            <Download size={14} /> Export Tab
          </button>

          <button
            type="button"
            onClick={() => handleExportCSV('master-executive')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #24345C 0%, #2F4375 100%)',
              color: '#ffffff',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(36, 52, 92, 0.25)',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <FileText size={14} /> Master Executive CSV
          </button>
        </div>
      </div>

      {/* ── SECTION 2: FILTERS & PRESETS BAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #DCE5F0',
        borderRadius: '16px',
        padding: isMobile ? '12px 14px' : '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', padding: '0 6px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Range:</span>
            {['All', 'Today', 'Yesterday', 'Last 7 Days', 'This Month'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                style={{
                  padding: isMobile ? '5px 10px' : '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: preset === p ? '#ffffff' : 'transparent',
                  color: preset === p ? '#1e293b' : '#64748b',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: preset === p ? '800' : '600',
                  cursor: 'pointer',
                  boxShadow: preset === p ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #DCE5F0', padding: '5px 10px', borderRadius: '8px', flex: isMobile ? '1 1 calc(50% - 4px)' : 'none' }}>
              <Calendar size={13} color="#64748b" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPreset('Custom'); }}
                style={{ border: 'none', background: 'transparent', fontSize: '11.5px', outline: 'none', fontWeight: '600', color: '#1e293b', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #DCE5F0', padding: '5px 10px', borderRadius: '8px', flex: isMobile ? '1 1 calc(50% - 4px)' : 'none' }}>
              <Calendar size={13} color="#64748b" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPreset('Custom'); }}
                style={{ border: 'none', background: 'transparent', fontSize: '11.5px', outline: 'none', fontWeight: '600', color: '#1e293b', width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Second Row: Filters & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 240px', minWidth: '180px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search order #, report #, product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #DCE5F0',
                fontSize: '12.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Shift Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: isMobile ? '1 1 calc(50% - 5px)' : 'none' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>Shift:</label>
            <select
              value={shiftFilter}
              onChange={e => setShiftFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #DCE5F0', fontSize: '12px', fontWeight: '600', color: '#1e293b', outline: 'none', background: '#fff' }}
            >
              <option value="All">All Shifts</option>
              <option value="Shift A">Shift A (Morning)</option>
              <option value="Shift B">Shift B (Evening)</option>
              <option value="Shift C">Shift C (Night)</option>
            </select>
          </div>

          {/* Status Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: isMobile ? '1 1 calc(50% - 5px)' : 'none' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>Status:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #DCE5F0', fontSize: '12px', fontWeight: '600', color: '#1e293b', outline: 'none', background: '#fff' }}
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All' || shiftFilter !== 'All' || preset !== 'All') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); setShiftFilter('All'); setPreset('All'); setStartDate(''); setEndDate(''); }}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', flex: isMobile ? '1 1 100%' : 'none' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 3: KPI METRICS CARDS GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(clamp(150px, 16vw, 220px), 1fr))',
        gap: isMobile ? '10px' : '16px'
      }}>
        
        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <ClipboardList size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Total Work Orders</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#0f172a', marginTop: '1px' }}>{kpiStats.totalWO}</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#2563eb', fontWeight: '700', whiteSpace: 'nowrap' }}>{kpiStats.completionRate}% Done</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <Activity size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Active Floor Jobs</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#0284c7', marginTop: '1px' }}>{kpiStats.activeWO}</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#0369a1', fontWeight: '700', whiteSpace: 'nowrap' }}>Live On Floor</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <CheckCircle size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Completed Orders</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#16a34a', marginTop: '1px' }}>{kpiStats.completedWO}</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#15803d', fontWeight: '700', whiteSpace: 'nowrap' }}>Ready / Stock</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <ShieldCheck size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Quality Yield</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#7c3aed', marginTop: '1px' }}>{kpiStats.qcYieldPct}%</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#6d28d9', fontWeight: '700', whiteSpace: 'nowrap' }}>{kpiStats.passedTested}/{kpiStats.totalTested} Passed</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#d97706', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <Scale size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Total Weight</div>
            <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: '900', color: '#d97706', marginTop: '1px' }}>{kpiStats.totalWeightMT} MT</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#b45309', fontWeight: '700', whiteSpace: 'nowrap' }}>{kpiStats.totalWeightKg} KG</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: isMobile ? '12px 14px' : '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.08)', color: '#ca8a04', padding: isMobile ? '8px' : '12px', borderRadius: '10px', flexShrink: 0 }}>
            <Layers size={isMobile ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Requisitions</div>
            <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#ca8a04', marginTop: '1px' }}>{kpiStats.materialReqCount}</div>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#a16207', fontWeight: '700', whiteSpace: 'nowrap' }}>Active Store Reqs</div>
          </div>
        </div>

      </div>

      {/* ── SECTION 4: PROPER VISUAL ANALYTICS CHARTS SUITE ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: isMobile ? '14px' : '20px'
      }}>
        
        {/* Chart 1: Daily Production Output & Trend (Dual Metrics Toggle) */}
        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: '800', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="#0284c7" />
                Daily Production Output Trend
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>Daily timeline of sets, covers, frames, and weight</p>
            </div>

            {/* Toggle Sets vs Weight */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setChartMetric('sets')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: chartMetric === 'sets' ? '#ffffff' : 'transparent',
                  color: chartMetric === 'sets' ? '#2563eb' : '#64748b',
                  boxShadow: chartMetric === 'sets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Sets
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('weight')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: chartMetric === 'weight' ? '#ffffff' : 'transparent',
                  color: chartMetric === 'weight' ? '#d97706' : '#64748b',
                  boxShadow: chartMetric === 'weight' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Weight (MT)
              </button>
            </div>
          </div>

          <div style={{ height: isMobile ? '230px' : isTablet ? '260px' : '280px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'sets' ? (
                <BarChart data={dailyOutputTrendData} margin={{ top: 10, right: 10, left: isMobile ? -25 : -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} interval={isMobile ? 'preserveStartEnd' : 0} />
                  <YAxis stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10.5px' : '12px', paddingTop: '8px' }} />
                  <Bar dataKey="sets" name="Sets" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="covers" name="Covers" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="frames" name="Frames" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={dailyOutputTrendData} margin={{ top: 10, right: 10, left: isMobile ? -25 : -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} interval={isMobile ? 'preserveStartEnd' : 0} />
                  <YAxis stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10.5px' : '12px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="weightMT" name="Tonnage (MT)" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Output by Shift Performance */}
        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: '800', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#059669" />
                Shift Performance Comparison
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>Volume across Shifts A, B, and C</p>
            </div>
            <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>
              3 Shifts
            </span>
          </div>

          <div style={{ height: isMobile ? '230px' : isTablet ? '260px' : '280px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftComparisonData} margin={{ top: 10, right: 10, left: isMobile ? -25 : -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={isMobile ? 9.5 : 11}
                  tickLine={false}
                  tickFormatter={(val) => isMobile ? String(val).split(' ')[0] + ' ' + (String(val).split(' ')[1] || '') : val}
                />
                <YAxis stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10.5px' : '12px', paddingTop: '8px' }} />
                <Bar dataKey="sets" name="Sets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weightMT" name="Weight (MT)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: QC Pass vs Fail Breakdown Donut */}
        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: '800', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieIcon size={16} color="#7c3aed" />
                Quality Inspection & Yield
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>Approval vs defect rework ratio</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#10b981' }}>{kpiStats.qcYieldPct}%</span>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>YIELD RATE</div>
            </div>
          </div>

          <div style={{ height: isMobile ? '230px' : isTablet ? '260px' : '280px', width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qcStatusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 42 : 60}
                  outerRadius={isMobile ? 68 : 90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {qcStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10.5px' : '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Products Manufactured */}
        <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: '800', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#f59e0b" />
                Top Manufactured Products
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>Highest volume items produced</p>
            </div>
            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>
              Top 5
            </span>
          </div>

          <div style={{ height: isMobile ? '230px' : isTablet ? '260px' : '280px', width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 15, left: isMobile ? -15 : 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={isMobile ? 9.5 : 11} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={isMobile ? 9 : 11}
                  tickLine={false}
                  width={isMobile ? 75 : 110}
                  tickFormatter={(name) => name.length > (isMobile ? 9 : 18) ? name.slice(0, isMobile ? 7 : 16) + '…' : name}
                />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: isMobile ? '10.5px' : '12px', paddingTop: '8px' }} />
                <Bar dataKey="produced" name="Produced" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── SECTION 5: MULTI-TAB DETAILED REPORT GRIDS ── */}
      <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
        
        {/* Tab Switcher Toolbar */}
        <div style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', padding: isMobile ? '10px 12px' : '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}>
            <button
              type="button"
              onClick={() => setActiveTab('work-orders')}
              style={{
                padding: isMobile ? '6px 10px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: isMobile ? '11.5px' : '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: activeTab === 'work-orders' ? '#ffffff' : 'transparent',
                color: activeTab === 'work-orders' ? '#24345C' : '#64748b',
                boxShadow: activeTab === 'work-orders' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📋 Work Orders ({workOrdersList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('daily-shifts')}
              style={{
                padding: isMobile ? '6px 10px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: isMobile ? '11.5px' : '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: activeTab === 'daily-shifts' ? '#ffffff' : 'transparent',
                color: activeTab === 'daily-shifts' ? '#24345C' : '#64748b',
                boxShadow: activeTab === 'daily-shifts' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📝 Shift Logs ({filteredDailyReports.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qc-testing')}
              style={{
                padding: isMobile ? '6px 10px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: isMobile ? '11.5px' : '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: activeTab === 'qc-testing' ? '#ffffff' : 'transparent',
                color: activeTab === 'qc-testing' ? '#24345C' : '#64748b',
                boxShadow: activeTab === 'qc-testing' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              🔬 Testing ({filteredTestingRecords.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('material-requests')}
              style={{
                padding: isMobile ? '6px 10px' : '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: isMobile ? '11.5px' : '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: activeTab === 'material-requests' ? '#ffffff' : 'transparent',
                color: activeTab === 'material-requests' ? '#24345C' : '#64748b',
                boxShadow: activeTab === 'material-requests' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📦 Requisitions ({filteredMaterialRequests.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleExportCSV('active-tab')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #10b981', background: '#ecfdf5', color: '#059669', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
          >
            <Download size={13} /> Export Tab CSV
          </button>
        </div>

        {/* Tab Data Table & Mobile Cards */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            ⏳ Loading production report records from live database...
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTab === 'work-orders' && (
              workOrdersList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>No work orders match the filter.</div>
              ) : (
                workOrdersList.map((wo, idx) => {
                  const target = Number(wo.targetQuantity || wo.quantity || 10);
                  const produced = Number(wo.quantityProduced || wo.producedQty || 0);
                  const pct = target > 0 ? Math.min(100, Math.round((produced / target) * 100)) : 0;
                  return (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '13px', color: '#2563eb' }}>
                            {wo.workOrderNumber || wo.orderNumber || wo.id}
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                            {wo.salesOrderItem?.product?.name || wo.product?.name || wo.productName || 'Item'}
                          </div>
                        </div>
                        {renderStatusBadge(wo.productionStatus || wo.workflowStatus || wo.status || 'IN_PROGRESS')}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                        <span>Target: <strong>{target} PCS</strong></span>
                        <span>Produced: <strong style={{ color: '#059669' }}>{produced} PCS</strong></span>
                        <span>QC: <strong style={{ color: String(wo.qcResult).toUpperCase() === 'PASS' ? '#16a34a' : '#dc2626' }}>{wo.qcResult || 'Pending'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155' }}>{pct}%</span>
                        <button
                          type="button"
                          onClick={() => setDetailModal({ type: 'WORK_ORDER', data: wo })}
                          style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#2563eb', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {activeTab === 'daily-shifts' && (
              filteredDailyReports.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>No shift logs found matching the filter.</div>
              ) : (
                filteredDailyReports.map((r, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '13px', color: '#7c3aed' }}>
                          {r.reportNo || r.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          {r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : '-'} • <strong>{r.shift || 'Shift A'}</strong>
                        </div>
                      </div>
                      {renderStatusBadge(r.status || 'DRAFT')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#334155', borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                      <span>Sets: <strong style={{ color: '#0284c7' }}>{(r.totalSets || 0)}</strong></span>
                      <span>Covers/Frames: <strong>{r.totalCovers || 0}/{r.totalFrames || 0}</strong></span>
                      <span>Weight: <strong style={{ color: '#d97706' }}>{Number(r.totalWeight || 0)} kg</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>By: {r.shiftSupervisorName || r.supervisorName || 'Supervisor'}</span>
                      <button
                        type="button"
                        onClick={() => setDetailModal({ type: 'DAILY_REPORT', data: r })}
                        style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'qc-testing' && (
              filteredTestingRecords.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>No quality testing records found.</div>
              ) : (
                filteredTestingRecords.map((t, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '13px', color: '#0284c7' }}>
                          {t.referenceNo || t.id}
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                          {t.productName}
                        </div>
                      </div>
                      {renderStatusBadge(t.status || 'Pending')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                      <span>Qty: <strong>{t.quantity} PCS</strong></span>
                      <span>By: <strong>{t.reviewedBy || 'QC Officer'}</strong></span>
                      <button
                        type="button"
                        onClick={() => setDetailModal({ type: 'QC_TEST', data: t })}
                        style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'material-requests' && (
              filteredMaterialRequests.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>No material requisitions found.</div>
              ) : (
                filteredMaterialRequests.map((m, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '13px', color: '#ca8a04' }}>
                          {m.requestNo || m.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          {m.warehouse || 'Main Store'} • By {m.requester || m.requestedBy?.name || 'Operator'}
                        </div>
                      </div>
                      {renderStatusBadge(m.status || 'Submitted')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                      <span style={{ background: m.priority === 'High' ? '#fef2f2' : '#f1f5f9', color: m.priority === 'High' ? '#dc2626' : '#475569', padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>
                        {m.priority || 'Normal'} Priority
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailModal({ type: 'MATERIAL_REQ', data: m })}
                        style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#ca8a04', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        ) : (
          /* Desktop & Tablet Table View */
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              
              {/* TAB 1: WORK ORDERS REPORT */}
              {activeTab === 'work-orders' && (
                <>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 18px' }}>Work Order #</th>
                      <th style={{ padding: '12px 18px' }}>Product Item</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Target Qty</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Produced</th>
                      <th style={{ padding: '12px 18px', textAlign: 'center' }}>Completion</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px' }}>QC Result</th>
                      <th style={{ padding: '12px 18px' }}>Created Date</th>
                      <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrdersList.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#8893A7' }}>No work orders match the current filter criteria.</td></tr>
                    ) : (
                      workOrdersList.map((wo, idx) => {
                        const target = Number(wo.targetQuantity || wo.quantity || 10);
                        const produced = Number(wo.quantityProduced || wo.producedQty || 0);
                        const pct = target > 0 ? Math.min(100, Math.round((produced / target) * 100)) : 0;

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px', fontWeight: '800', fontFamily: 'monospace', color: '#2563eb' }}>
                              {wo.workOrderNumber || wo.orderNumber || wo.id}
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: '700', color: '#1e293b' }}>
                              {wo.salesOrderItem?.product?.name || wo.product?.name || wo.productName || 'Manufacturing Assembly'}
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700' }}>
                              {target.toLocaleString()} PCS
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                              {produced.toLocaleString()} PCS
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', maxWidth: '60px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6' }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155' }}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              {renderStatusBadge(wo.productionStatus || wo.workflowStatus || wo.status || 'IN_PROGRESS')}
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: '700', color: String(wo.qcResult).toUpperCase() === 'PASS' ? '#16a34a' : String(wo.qcResult).toUpperCase() === 'FAIL' ? '#dc2626' : '#64748b' }}>
                              {wo.qcResult || 'Pending'}
                            </td>
                            <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12.5px' }}>
                              {new Date(wo.createdAt || Date.now()).toLocaleDateString('en-GB')}
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setDetailModal({ type: 'WORK_ORDER', data: wo })}
                                style={{ background: '#f1f5f9', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#2563eb', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              )}

              {/* TAB 2: DAILY SHIFT LOGS */}
              {activeTab === 'daily-shifts' && (
                <>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 18px' }}>Report #</th>
                      <th style={{ padding: '12px 18px' }}>Report Date</th>
                      <th style={{ padding: '12px 18px' }}>Shift</th>
                      <th style={{ padding: '12px 18px' }}>Shift Supervisor</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Covers</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Frames</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Sets</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Weight (KG)</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailyReports.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#8893A7' }}>No shift logs found matching the filter.</td></tr>
                    ) : (
                      filteredDailyReports.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px', fontWeight: '800', fontFamily: 'monospace', color: '#7c3aed' }}>
                            {r.reportNo || r.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '600', color: '#334155' }}>
                            {r.reportDate ? new Date(r.reportDate).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              {r.shift || 'Shift A'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '700', color: '#1e293b' }}>
                            {r.shiftSupervisorName || r.supervisorName || 'Supervisor'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700' }}>
                            {(r.totalCovers || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700' }}>
                            {(r.totalFrames || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>
                            {(r.totalSets || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: '#d97706' }}>
                            {(Number(r.totalWeight) || 0).toLocaleString()} kg
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {renderStatusBadge(r.status || 'DRAFT')}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setDetailModal({ type: 'DAILY_REPORT', data: r })}
                              style={{ background: '#f1f5f9', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#7c3aed', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {/* TAB 3: QUALITY TESTING REGISTER */}
              {activeTab === 'qc-testing' && (
                <>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 18px' }}>Ref Code</th>
                      <th style={{ padding: '12px 18px' }}>Product / Material</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Tested Qty</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px' }}>Tested By</th>
                      <th style={{ padding: '12px 18px' }}>Remarks</th>
                      <th style={{ padding: '12px 18px' }}>Date</th>
                      <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTestingRecords.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#8893A7' }}>No quality testing records found.</td></tr>
                    ) : (
                      filteredTestingRecords.map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px', fontWeight: '800', fontFamily: 'monospace', color: '#0284c7' }}>
                            {t.referenceNo || t.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '700', color: '#1e293b' }}>
                            {t.productName}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700' }}>
                            {t.quantity} PCS
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {renderStatusBadge(t.status || 'Pending')}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#475569' }}>
                            {t.reviewedBy || 'QC Officer'}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b' }}>
                            {t.remarks || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12.5px' }}>
                            {new Date(t.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setDetailModal({ type: 'QC_TEST', data: t })}
                              style={{ background: '#f1f5f9', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {/* TAB 4: MATERIAL REQUISITIONS */}
              {activeTab === 'material-requests' && (
                <>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 18px' }}>Request #</th>
                      <th style={{ padding: '12px 18px' }}>Request Date</th>
                      <th style={{ padding: '12px 18px' }}>Warehouse</th>
                      <th style={{ padding: '12px 18px' }}>Requester</th>
                      <th style={{ padding: '12px 18px' }}>Priority</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px' }}>Notes</th>
                      <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterialRequests.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#8893A7' }}>No material requisitions found.</td></tr>
                    ) : (
                      filteredMaterialRequests.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px', fontWeight: '800', fontFamily: 'monospace', color: '#ca8a04' }}>
                            {m.requestNo || m.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '600', color: '#334155' }}>
                            {m.requestDate || (m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-GB') : '-')}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#475569' }}>
                            {m.warehouse || 'Main Store'}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '700', color: '#1e293b' }}>
                            {m.requester || m.requestedBy?.name || 'Line Operator'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ background: m.priority === 'High' ? '#fef2f2' : '#f1f5f9', color: m.priority === 'High' ? '#dc2626' : '#475569', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              {m.priority || 'Normal'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {renderStatusBadge(m.status || 'Submitted')}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b' }}>
                            {m.notes || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setDetailModal({ type: 'MATERIAL_REQ', data: m })}
                              style={{ background: '#f1f5f9', border: '1px solid #DCE5F0', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', color: '#ca8a04', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL INSPECTION VIEW ── */}
      {detailModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }} onClick={() => setDetailModal(null)}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: 'min(94vw, 600px)', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: isMobile ? '16px' : '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setDetailModal(null)} style={{ position: 'absolute', right: '14px', top: '14px', background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} />
            </button>

            {detailModal.type === 'WORK_ORDER' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '36px' }}>
                  <ClipboardList color="#2563eb" size={22} />
                  <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', margin: 0, color: '#1e1b4b' }}>Work Order #{detailModal.data.workOrderNumber || detailModal.data.orderNumber || detailModal.data.id}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Product</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.salesOrderItem?.product?.name || detailModal.data.product?.name || detailModal.data.productName || '—'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Target Qty</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.targetQuantity || detailModal.data.quantity || 0} PCS</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Produced Qty</span><div style={{ fontWeight: '800', color: '#059669' }}>{detailModal.data.quantityProduced || detailModal.data.producedQty || 0} PCS</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Status</span><div>{renderStatusBadge(detailModal.data.productionStatus || detailModal.data.workflowStatus || detailModal.data.status)}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>QC Result</span><div style={{ fontWeight: '800', color: detailModal.data.qcResult === 'PASS' ? '#16a34a' : '#dc2626' }}>{detailModal.data.qcResult || 'Pending'}</div></div>
                  <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Created Timestamp</span><div style={{ fontSize: '12px', color: '#334155' }}>{new Date(detailModal.data.createdAt || Date.now()).toLocaleString()}</div></div>
                </div>
              </div>
            )}

            {detailModal.type === 'DAILY_REPORT' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '36px' }}>
                  <FileText color="#7c3aed" size={22} />
                  <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', margin: 0, color: '#1e1b4b' }}>Daily Shift Report #{detailModal.data.reportNo || detailModal.data.id}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Date</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.reportDate ? new Date(detailModal.data.reportDate).toLocaleDateString('en-GB') : '-'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Shift</span><div style={{ fontWeight: '800', color: '#7c3aed' }}>{detailModal.data.shift || 'Shift A'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Supervisor</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.shiftSupervisorName || detailModal.data.supervisorName || '—'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Total Weight</span><div style={{ fontWeight: '800', color: '#d97706' }}>{Number(detailModal.data.totalWeight || 0).toLocaleString()} kg</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sets Output</span><div style={{ fontWeight: '800', color: '#059669' }}>{detailModal.data.totalSets || 0} Sets</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Covers / Frames</span><div style={{ fontWeight: '800', color: '#0284c7' }}>{detailModal.data.totalCovers || 0} / {detailModal.data.totalFrames || 0}</div></div>
                </div>
              </div>
            )}

            {detailModal.type === 'QC_TEST' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '36px' }}>
                  <ShieldCheck color="#0284c7" size={22} />
                  <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', margin: 0, color: '#1e1b4b' }}>Inspection #{detailModal.data.referenceNo || detailModal.data.id}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Product</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.productName}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Tested Qty</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.quantity} PCS</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Status</span><div>{renderStatusBadge(detailModal.data.status)}</div></div>
                  <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Reviewed By</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.reviewedBy || 'QC Inspector'}</div></div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Remarks / Observations</span><div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>{detailModal.data.remarks || 'No issues noted.'}</div></div>
                </div>
              </div>
            )}

            {detailModal.type === 'MATERIAL_REQ' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '36px' }}>
                  <Layers color="#ca8a04" size={22} />
                  <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', margin: 0, color: '#1e1b4b' }}>Material Requisition #{detailModal.data.requestNo || detailModal.data.id}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Warehouse</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.warehouse || 'Main Store'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Requester</span><div style={{ fontWeight: '800', color: '#0f172a' }}>{detailModal.data.requester || detailModal.data.requestedBy?.name || 'Line Operator'}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Status</span><div>{renderStatusBadge(detailModal.data.status)}</div></div>
                  <div><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Priority</span><div style={{ fontWeight: '800', color: detailModal.data.priority === 'High' ? '#dc2626' : '#475569' }}>{detailModal.data.priority || 'Normal'}</div></div>
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Notes</span><div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>{detailModal.data.notes || '—'}</div></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={() => setDetailModal(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #DCE5F0', background: '#f8fafc', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
