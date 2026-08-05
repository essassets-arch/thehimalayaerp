'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { dispatchService } from '../../../services/dispatch.service';
import { salesService } from '../../../services/sales.service';
import { apiClient } from '../../../lib/apiClient';
import { useERPStore } from '../../../store/erpStore';
import { selectDispatchOrders } from '../../../store/domains/sales/salesSelectors';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { PlusCircle, Box, Truck, ClipboardList, FlaskConical, ArrowRight, X, FileCheck, FileText } from 'lucide-react';
import DispatchBillModal from '../../../shared/components/DispatchBillModal';
import ReturnsPortal from './ReturnsPortal';
import { backendFetch } from '../../../lib/backendFetch';

export default function DispatchPortal() {
  const params = useParams();
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const view = params?.slug?.[0] || (pathSegments[0] === 'dispatch' ? pathSegments[1] : undefined);
  const orderId = params?.slug?.[1];
  const currentView = view || (orderId ? 'partial' : 'dashboard');
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams ? searchParams.get('mode') : null;
  const sampleIdParam = searchParams ? searchParams.get('sampleId') : null;
  const dispatchStatusParam = searchParams ? searchParams.get('status') : null;
  const { state, dispatch, setState, syncData } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const addNotification = useNotificationStore(s => s.addNotification);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [replacementDispatches, setReplacementDispatches] = useState([]);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [backendDispatches, setBackendDispatches] = useState([]);
  const [backendReadyWorkOrders, setBackendReadyWorkOrders] = useState([]);
  const [backendFinishedGoods, setBackendFinishedGoods] = useState([]);
  const [backendReturns, setBackendReturns] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const [dispatchesRes, workOrdersRes, returnsRes, replacementsRes, finishedGoodsRes] = await Promise.allSettled([
        backendFetch('/api/backend/logistics/dispatches'),
        backendFetch('/api/backend/production/work-orders?status=READY_FOR_DISPATCH'),
        backendFetch('/api/backend/sales-returns'),
        backendFetch('/api/backend/replacements'),
        backendFetch('/api/backend/production/finished-goods'),
      ]);

      if (dispatchesRes.status === 'fulfilled' && Array.isArray(dispatchesRes.value)) {
        setBackendDispatches(dispatchesRes.value);
      }
      if (workOrdersRes.status === 'fulfilled' && Array.isArray(workOrdersRes.value)) {
        setBackendReadyWorkOrders(workOrdersRes.value);
      }
      if (returnsRes.status === 'fulfilled' && Array.isArray(returnsRes.value)) {
        setBackendReturns(returnsRes.value);
      }
      if (finishedGoodsRes.status === 'fulfilled') {
        const val = finishedGoodsRes.value;
        const list = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        setBackendFinishedGoods(list);
      }
      if (replacementsRes.status === 'fulfilled' && Array.isArray(replacementsRes.value)) {
        setReplacementDispatches((replacementsRes.value || [])
          .filter((record) => record.status === 'APPROVED' || record.dispatchStatus === 'APPROVED')
          .map((record) => ({
            ...record,
            request_no: record.requestNumber || record.id,
            order_number: record.salesOrder?.orderNumber || record.salesOrderId,
            customer_name: record.salesOrder?.customer?.companyName || record.salesOrder?.customer?.name || '—',
            product_name: record.items?.map((item) => item.product?.name).filter(Boolean).join(', ') || '—',
            approved_qty: record.items?.reduce((sum, item) => sum + Number(item.requestedQuantity || 0), 0) || 1,
            dispatch_status: record.dispatchStatus || record.status || 'APPROVED',
            vehicle_number: record.dispatchDetails?.trackingNumber || record.dispatchDetails?.vehicleNumber,
          })));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchReplacementDispatches = async () => {
    setReplacementLoading(true);
    try {
      const records = await backendFetch('/api/backend/replacements');
      setReplacementDispatches((records || [])
        .filter((record) => record.status === 'APPROVED')
        .map((record) => ({
          ...record,
          request_no: record.requestNumber,
          order_number: record.salesOrder?.orderNumber || record.salesOrderId,
          customer_name: record.salesOrder?.customer?.companyName || record.salesOrder?.customer?.name || '—',
          product_name: record.items?.map((item) => item.product?.name).filter(Boolean).join(', ') || '—',
          approved_qty: record.items?.reduce((sum, item) => sum + Number(item.requestedQuantity || 0), 0),
          dispatch_status: record.dispatchStatus || 'APPROVED',
          vehicle_number: record.dispatchDetails?.trackingNumber || record.dispatchDetails?.vehicleNumber,
        })));
    } catch (err) {
      console.error('Failed to load replacement dispatches', err);
      showToast?.('Failed to load replacement dispatch queue.');
    } finally {
      setReplacementLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (currentView === 'replacements' || currentView === 'history') fetchReplacementDispatches();
  }, [currentView]);

  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
  const [selectedOrderNos, setSelectedOrderNos] = useState([]);
  // Delivery proof modal states
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDispatchForDelivery, setSelectedDispatchForDelivery] = useState(null);
  const [podFile, setPodFile] = useState('');
  const [podPreviewUrl, setPodPreviewUrl] = useState('');

  const [sampleFilter, setSampleFilter] = useState('Pending Dispatch');
  const [historyFilter, setHistoryFilter] = useState('All');

  useEffect(() => {
    if (currentView !== 'sample-dispatch') return;
    const statusFilters = {
      pending: 'Pending Dispatch',
      'in-transit': 'In Transit',
      delivered: 'Delivered',
      all: 'All',
    };
    setSampleFilter(statusFilters[dispatchStatusParam] || 'Pending Dispatch');
  }, [currentView, dispatchStatusParam]);

  // Sample retrieval booking and proof of return states
  const [activeRetrievalSample, setActiveRetrievalSample] = useState(null);
  const [retrievalVehicleNo, setRetrievalVehicleNo] = useState('');
  const [retrievalDriverName, setRetrievalDriverName] = useState('');
  const [retrievalDriverMobile, setRetrievalDriverMobile] = useState('');
  const [retrievalDate, setRetrievalDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRetrievalModal, setShowRetrievalModal] = useState(false);
  const [selectedSampleForRetrievalConfirm, setSelectedSampleForRetrievalConfirm] = useState(null);
  const [retrievalPodFile, setRetrievalPodFile] = useState('');
  const [retrievalPodPreviewUrl, setRetrievalPodPreviewUrl] = useState('');

  // Dispatch Bill modal states
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedDispatchForBill, setSelectedDispatchForBill] = useState(null);

  // Dispatch form states
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const transporter = 'Himalaya Own Fleet';
  const [transportCost, setTransportCost] = useState('0');
  const [lrNumber, setLrNumber] = useState('');
  const [ewayBill, setEwayBill] = useState('');
  const [dispatchQuantities, setDispatchQuantities] = useState({});
  // -- Enhanced create-dispatch form extra fields --
  const [cdCourier, setCdCourier] = useState('');
  const [cdDispatchDate, setCdDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [cdDocFile, setCdDocFile] = useState('');
  const [cdDocPreview, setCdDocPreview] = useState('');
  const [cdRemarks, setCdRemarks] = useState('');

  // Single dispatch page states
  const [singleDispatchQty, setSingleDispatchQty] = useState('');
  const [singleVehicleNo, setSingleVehicleNo] = useState('');
  const [singleDriverName, setSingleDriverName] = useState('');
  const [singleDriverMobile, setSingleDriverMobile] = useState('');
  const [singleTransportCost, setSingleTransportCost] = useState('0');

  // ΓöÇΓöÇ New sample dispatch form state (per-sample, full ERP flow) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [activeSampleDispatch, setActiveSampleDispatch] = useState(null); // sample being dispatched
  const [sdVehicleNo, setSdVehicleNo] = useState('');
  const [sdDriverName, setSdDriverName] = useState('');
  const [sdCourier, setSdCourier] = useState('');
  const [sdLrAwb, setSdLrAwb] = useState('');
  const [sdDispatchDate, setSdDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [sdDocFile, setSdDocFile] = useState('');
  const [sdDocPreview, setSdDocPreview] = useState('');
  const [sdRemarks, setSdRemarks] = useState('');
  const [sdTransportCost, setSdTransportCost] = useState('');

  // ΓöÇΓöÇ New sample delivery confirmation form state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [activeSampleDelivery, setActiveSampleDelivery] = useState(null); // sample confirming delivery
  const [dlDeliveryDate, setDlDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [dlReceiverName, setDlReceiverName] = useState('');
  const [dlReceiverMobile, setDlReceiverMobile] = useState('');
  const [dlRemarks, setDlRemarks] = useState('');
  const [dlPodImage, setDlPodImage] = useState('');
  const [dlPodImagePreview, setDlPodImagePreview] = useState('');
  const [dlPodDoc, setDlPodDoc] = useState('');
  const [dlPodDocPreview, setDlPodDocPreview] = useState('');
  const [dlSignature, setDlSignature] = useState('');
  const [dlSignaturePreview, setDlSignaturePreview] = useState('');

  // ΓöÇΓöÇ Sample Returns Section State ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [sampleSectionTab, setSampleSectionTab] = useState(modeParam === 'return' ? 'returns' : 'dispatch');
  const [activeReturnDispatchSample, setActiveReturnDispatchSample] = useState(null);
  const [rdVehicleNo, setRdVehicleNo] = useState('');
  const [rdDriverName, setRdDriverName] = useState('');
  const [rdDriverPhone, setRdDriverPhone] = useState('');
  const [rdCourier, setRdCourier] = useState('');
  const [rdLrAwb, setRdLrAwb] = useState('');
  const [rdDispatchDate, setRdDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [rdTransportCost, setRdTransportCost] = useState('');
  const [rdDocFile, setRdDocFile] = useState('');
  const [rdDocPreview, setRdDocPreview] = useState('');
  const [rdRemarks, setRdRemarks] = useState('');

  useEffect(() => {
    if (modeParam === 'return') {
      setSampleSectionTab('returns');
    }
  }, [modeParam]);

  useEffect(() => {
    if (!sampleIdParam || modeParam !== 'return' || sampleSectionTab !== 'returns') return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`return-${sampleIdParam}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [sampleIdParam, modeParam, sampleSectionTab]);

  const isMobile = useMediaQuery('(max-width: 768px)');

  // Canonical Dispatch Queue (from Finished Goods & Live Backend Stock)
  const storeDispatchQueueOrders = useERPStore(s => s.dispatch?.dispatchOrders || s.state?.dispatch?.dispatchOrders) || [];

  const dispatchQueueOrders = useMemo(() => {
    const list = [...storeDispatchQueueOrders];
    (backendFinishedGoods || []).forEach((fg) => {
      const fgId = fg.id || fg.workOrderId;
      const orderId = fg.jobNo || fg.workOrder?.workOrderNumber || `WO-${String(fgId).slice(-4)}`;
      if (!list.some(item => item.id === fgId || item.orderId === orderId)) {
        list.push({
          id: fgId,
          orderId,
          batchId: fg.productCode || 'FG-STOCK',
          customerName: fg.customerName || fg.workOrder?.productionPlan?.salesOrder?.customer?.companyName || 'Factory Staging Area',
          items: [{
            productName: fg.productName || 'Finished Good Product',
            approvedQuantity: fg.quantity || 1,
            dispatchableQuantity: fg.availableQuantity ?? fg.quantity ?? 1,
            unit: fg.unit || 'Pcs',
          }],
          status: fg.status === 'READY_FOR_DISPATCH' || fg.status === 'AVAILABLE' ? 'READY_FOR_DISPATCH' : fg.status,
          workOrderId: fg.workOrderId || fg.id,
        });
      }
    });
    return list;
  }, [storeDispatchQueueOrders, backendFinishedGoods]);

  // Legacy selector-based orders (for existing QC-passed records compatibility)
  const orders = useERPStore(selectDispatchOrders);
  const dispatches = state.dispatches || [];

  // ΓöÇΓöÇ Dispatch Category RBAC Filtering ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Determine which dispatch category this user can see based on their role.
  // Dispatch Manager and legacy 'Dispatch' role: sees ALL orders.
  // Dispatch 1 Operator: sees only orders with DISPATCH 1 items.
  // Dispatch 2 Operator: sees only orders with DISPATCH 2 items.
  const DISPATCH_ROLE_MAP = {
    'Dispatch 1 Operator': 'DISPATCH 1',
    'Dispatch 2 Operator': 'DISPATCH 2',
  };
  const userDispatchCategory = DISPATCH_ROLE_MAP[user?.role] || null; // null = sees all

  // Filter orders by dispatch category if the user has a restricted role.
  // An order is visible if ANY of its items belong to the user's dispatch category,
  // or if no category restriction applies.
  const filterOrdersByDispatch = (orderList) => {
    if (!userDispatchCategory) return orderList; // Dispatch Manager / legacy role ΓÇö sees all
    return orderList.filter(o => {
      // Check if order has items tagged with the user's dispatch category
      const items = o.items || o.order_items || [];
      if (items.length > 0) {
        return items.some(item =>
          (item.dispatch_category || item.product_dispatch_category) === userDispatchCategory
        );
      }
      // Fallback: check order-level dispatch_category field if present
      if (o.dispatch_category) return o.dispatch_category === userDispatchCategory;
      // If no category info available, show to all (data not yet migrated)
      return true;
    });
  };

  const filteredOrders = filterOrdersByDispatch(orders);

  const getRemainingQty = (o) => {
    if (!o) return 0;
    if (typeof o.approvedQuantity === 'number' && typeof o.dispatchedQuantity === 'number') {
      return Math.max(0, o.approvedQuantity - o.dispatchedQuantity);
    }
    const raw = o.availableQuantity ?? (o.dispatch?.remaining ?? (o.quantity || o.estimatedQuantity || o.total_tonnage || 0));
    return typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g, '')) || 0 : raw || 0;
  };

  React.useEffect(() => {
    setDispatchQuantities(prev => {
      let changed = false;
      const next = {};
      selectedOrderNos.forEach(no => {
        const order = orders.find(o => o.orderNo === no);
        const remaining = getRemainingQty(order);
        const val = prev[no] !== undefined ? prev[no] : String(Math.min(1, remaining));
        next[no] = val;
        if (prev[no] !== val) changed = true;
      });
      if (Object.keys(prev).length !== Object.keys(next).length) changed = true;
      return changed ? next : prev;
    });
  }, [selectedOrderNos, orders]);

  React.useEffect(() => {
    if (currentView === 'remaining') {
      const remainingOrdersCount = orders.filter(o =>
        ['QC_APPROVED', 'QC Passed', 'DISPATCH_READY', 'Dispatch Created', 'DISPATCH_CREATED', 'IN_TRANSIT', 'In Transit', 'Partially Delivered', 'READY_FOR_DISPATCH', 'Ready for Dispatch'].includes(o.status || o.workflowStatus) &&
        getRemainingQty(o) > 0
      ).length;

      if (remainingOrdersCount === 0) {
        showToast('All dispatches completed! Redirecting to history...');
        navigate.push('/dispatch/history');
      }
    }
  }, [currentView, orders, navigate]);

  // Filter active orders awaiting dispatch (QC Passed, partially delivered, or currently in transit/created with balance)
  // filteredOrders is already role-filtered by dispatch category (D1/D2 Operator restriction)
  const qcPassed = filteredOrders.filter(o =>
    ['QC_APPROVED', 'QC Passed', 'QC_PASSED', 'DISPATCH_READY', 'Dispatch Created', 'DISPATCH_CREATED', 'IN_TRANSIT', 'In Transit', 'Partially Delivered', 'READY_FOR_DISPATCH', 'Ready for Dispatch'].includes(o.status || o.workflowStatus) &&
    getRemainingQty(o) > 0
  );

  const handleAutoFillOne = () => {
    const activeOrders = selectedOrderNos
      .map(no => orders.find(o => o.orderNo === no))
      .filter(Boolean);

    setDispatchQuantities(prev => {
      const next = { ...prev };
      activeOrders.forEach(o => {
        const remaining = getRemainingQty(o);
        next[o.orderNo] = String(Math.min(1, remaining));
      });
      return next;
    });
    showToast('Auto-filled 1 Ton (or remaining capacity) for each order.');
  };

  const handleDistributeEqually = async () => {
    const activeOrders = selectedOrderNos
      .map(no => orders.find(o => o.orderNo === no))
      .filter(Boolean);

    if (activeOrders.length === 0) {
      showToast('Please select at least one active order reference first.');
      return;
    }

    const { value: totalInput } = await Swal.fire({
      title: 'Distribute Quantity Equally',
      text: `Enter the total quantity (Tons) to distribute among ${activeOrders.length} selected orders:`,
      input: 'number',
      inputPlaceholder: 'Total quantity in Tons',
      showCancelButton: true,
      confirmButtonText: 'Distribute',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          return 'Please enter a valid positive number';
        }
      }
    });

    if (totalInput) {
      const totalToDistribute = Number(totalInput);
      let remainingToDistribute = totalToDistribute;

      const orderCapacities = activeOrders.map(o => ({
        orderNo: o.orderNo,
        remaining: getRemainingQty(o),
        allocated: 0
      }));

      let activePool = [...orderCapacities];
      let iterations = 0;
      while (remainingToDistribute > 0.001 && activePool.length > 0 && iterations < 20) {
        iterations++;
        const share = remainingToDistribute / activePool.length;
        let nextPool = [];
        let allocatedThisRound = 0;

        for (const item of activePool) {
          const capacityLeft = item.remaining - item.allocated;
          if (capacityLeft <= 0) continue;

          const allocation = Math.min(share, capacityLeft);
          item.allocated += allocation;
          allocatedThisRound += allocation;

          if (item.allocated < item.remaining) {
            nextPool.push(item);
          }
        }

        remainingToDistribute -= allocatedThisRound;
        activePool = nextPool;

        if (allocatedThisRound === 0) break;
      }

      setDispatchQuantities(prev => {
        const next = { ...prev };
        orderCapacities.forEach(item => {
          next[item.orderNo] = String(Math.round(item.allocated * 100) / 100);
        });
        return next;
      });
      showToast(`Distributed ${totalToDistribute} Tons across selected orders.`);
    }
  };

  const handleSampleDeliveryClick = (sample) => {
    setSelectedDispatchForDelivery({
      id: `SMP-${String(sample.id).padStart(3, '0')}`,
      orderNo: `Lead: LD-${String(sample.leadId).slice(-3)}`,
      customerName: sample.leadName,
      isSample: true,
      sampleId: sample.id
    });
    setPodFile('');
    setPodPreviewUrl('');
    setShowDeliveryModal(true);
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleNo || !vehicleNo.trim()) {
      showToast('Vehicle Number is required.');
      return;
    }
    if (!driverName || !driverName.trim()) {
      showToast('Driver Name is required.');
      return;
    }
    if (!cdCourier || !cdCourier.trim()) {
      showToast('Courier / Transport is required.');
      return;
    }

    // Resolve selected orders — if none selected but we have a selectedOrderForDispatch, use it
    const resolvedOrderNos = selectedOrderNos.length > 0 ? selectedOrderNos : (selectedOrderForDispatch ? [selectedOrderForDispatch.orderNo] : []);

    if (resolvedOrderNos.length === 0) {
      showToast('Please select at least one active order reference.');
      return;
    }

    const selectedOrders = resolvedOrderNos
      .map(no => orders.find(o => o.orderNo === no))
      .filter(Boolean);

    if (selectedOrders.length === 0) {
      showToast('No active orders found for the selected references.');
      return;
    }

    const allocations = [];
    let totalQtyToDispatch = 0;

    for (const order of selectedOrders) {
      const remaining = getRemainingQty(order);
      // Use typed quantity if available, otherwise dispatch full remaining
      const qtyStr = dispatchQuantities[order.orderNo] || '';
      const qtyVal = qtyStr.trim() !== '' ? Number(qtyStr) : remaining;

      if (isNaN(qtyVal) || qtyVal <= 0) {
        showToast(`Please enter a valid positive quantity for Order ${order.orderNo}.`);
        return;
      }

      if (qtyVal > remaining) {
        Swal.fire({
          icon: 'error',
          title: 'Dispatch Limit Exceeded',
          text: `Cannot dispatch ${qtyVal} Pcs for Order ${order.orderNo}. Remaining capacity is ${remaining} Pcs.`
        });
        return;
      }

      allocations.push({ order, qty: qtyVal });
      totalQtyToDispatch += qtyVal;
    }

    if (allocations.length === 0) {
      showToast('No quantity could be allocated.');
      return;
    }

    Swal.fire({
      title: 'Confirm Dispatch?',
      text: `Dispatch ${totalQtyToDispatch} Pcs across ${selectedOrders.length} order(s) via ${cdCourier}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm Dispatch',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        showToast("Booking vehicle and scheduling dispatch consignment...");

        try {
          const createdAt = cdDispatchDate ? new Date(cdDispatchDate).toISOString() : new Date().toISOString();
          const dispatchId = `DSP-${Date.now()}`;

          // Build dispatch records for each allocation
          const localDispatches = allocations.map((allocation, index) => ({
            id: `${dispatchId}-${index + 1}`,
            dispatchId: `${dispatchId}-${index + 1}`,
            orderId: allocation.order.id || allocation.order.orderNo,
            orderNo: allocation.order.orderNo,
            customerName: allocation.order.customerName || allocation.order.customer?.name || 'Not recorded',
            vehicleNo,
            driverName,
            driverMobile,
            transporter: cdCourier,
            courier: cdCourier,
            lrNumber,
            ewayBill,
            dispatchDate: cdDispatchDate,
            transportCost: Number(transportCost || 0),
            dispatchDocument: cdDocFile,
            remarks: cdRemarks,
            quantity: Number(allocation.qty),
            totalQuantity: Number(allocation.qty),
            status: 'DISPATCH_PENDING',
            dispatchStatus: 'DISPATCH_PENDING',
            date: createdAt,
            created_at: createdAt,
            dispatchItems: [{ orderId: allocation.order.id, orderNo: allocation.order.orderNo, qty: Number(allocation.qty) }]
          }));

          // Update orders to mark as DISPATCH_CREATED
          const createdOrderNos = new Set(localDispatches.map(d => String(d.orderNo)));
          const updatedOrders = (state.sales?.orders || []).map(o => {
            if (createdOrderNos.has(String(o.orderNo || o.id))) {
              return { ...o, workflowStatus: 'DISPATCH_CREATED', status: 'Dispatch Created', dispatchStatus: 'created' };
            }
            return o;
          });

          const existingDispatches = state.dispatches || [];
          setState({
            ...state,
            dispatches: [
              ...existingDispatches.filter(item => !createdOrderNos.has(String(item.orderNo || item.order_number))),
              ...localDispatches
            ],
            sales: {
              ...(state.sales || {}),
              orders: updatedOrders
            }
          });

          setSelectedOrderForDispatch(null);
          setSelectedOrderNos([]);
          setDispatchQuantities({});
          setVehicleNo('');
          setDriverName('');
          setDriverMobile('');
          setTransportCost('0');
          setLrNumber('');
          setEwayBill('');
          setCdCourier('');
          setCdDispatchDate(new Date().toISOString().split('T')[0]);
          setCdDocFile('');
          setCdDocPreview('');
          setCdRemarks('');

          showToast('Successfully booked dispatch consignment!');
          navigate.push('/dispatch/in-transit');
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Dispatch Booking Failed', text: err.message || String(err) });
        }
      }
    });
  };


  const handleDepartVehicle = async (dispatchId) => {
    showToast('Recording vehicle departure...');
    try {
      // Find the order linked to this dispatch record
      const dispatchRecord = (state.dispatches || []).find(d => d.id === dispatchId || d.dispatchId === dispatchId);
      const targetId = dispatchRecord?.orderId || dispatchRecord?.orderNo || dispatchId;

      // Update the dispatch record status directly in the ERP store
      const updatedDispatches = (state.dispatches || []).map(d => {
        if (d.id === dispatchId || d.dispatchId === dispatchId) {
          return { ...d, dispatchStatus: 'in_transit', status: 'In Transit', deliveryStartedAt: new Date().toISOString() };
        }
        return d;
      });

      // Also update the matching order's workflowStatus
      const updatedOrders = (state.sales?.orders || []).map(o => {
        if (String(o.id) === String(targetId) || String(o.orderNo) === String(targetId)) {
          return { ...o, workflowStatus: 'IN_TRANSIT', status: 'In Transit', dispatchStatus: 'in_transit' };
        }
        return o;
      });

      setState({
        ...state,
        dispatches: updatedDispatches,
        sales: {
          ...(state.sales || {}),
          orders: updatedOrders
        }
      });
      showToast('Vehicle departed successfully! Status updated to In Transit.');
      navigate.push('/dispatch/delivery');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Departure Failed', text: err.message || String(err) });
    }
  };


  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedDispatchForDelivery(null);
    setPodFile('');
    if (podPreviewUrl) {
      URL.revokeObjectURL(podPreviewUrl);
      setPodPreviewUrl('');
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispatchForDelivery) return;
    // POD/Bill Photo is mandatory for freight dispatches but optional for samples
    if (!podFile && !selectedDispatchForDelivery.isSample) {
      showToast('Bill Photo Image is MANDATORY to mark cargo as Delivered.');
      return;
    }

    if (selectedDispatchForDelivery.isSample) {
      Swal.fire({
        title: 'Mark Sample Delivered?',
        text: `Confirm receipt verification for Sample ${selectedDispatchForDelivery.id} and upload bill photo?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Confirm Delivery',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          confirmButton: 'swal-premium-confirm-btn',
          cancelButton: 'swal-premium-cancel-btn'
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.isConfirmed) {
          showToast("Dispatch: Recording sample proof of delivery...");
          const samples = state.sales?.samples || [];
          const sample = samples.find(s => s.id === selectedDispatchForDelivery.sampleId);
          if (sample) {
            let extra = {};
            if (sample.testingParameters) {
              try {
                extra = JSON.parse(sample.testingParameters);
              } catch {
                // ignore
              }
            }
            const now = new Date();
            const evalEnd = new Date(now);
            evalEnd.setDate(evalEnd.getDate() + 20);

            extra.delivered = true;
            extra.deliveredDate = now.toISOString().split('T')[0];
            extra.podImage = podPreviewUrl || podFile;

            const nowStr = now.toISOString();
            const body = {
              status: 'Client Testing',
              deliveredDate: nowStr,
              deliveredAt: nowStr,
              testingStartDate: nowStr,
              testingEndDate: evalEnd.toISOString(),
              evaluationEndDate: evalEnd.toISOString(),
              dispatchStatus: 'Delivered',
              delivered: true,
              receiverName: extra.receiverName || 'Rajesh Sharma',
              deliveredTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              podUploaded: 'Yes',
              podImage: podPreviewUrl || podFile,
              testingParameters: JSON.stringify(extra)
            };

            try {
              await salesService.updateSample(state, sample.id, body, dispatch, user);
              await syncData();
              showToast(`Sample ${selectedDispatchForDelivery.id} marked DELIVERED successfully!`);
            } catch (err) {
              Swal.fire({ icon: 'error', title: 'Error', text: err.message || err });
            }
          }
          closeDeliveryModal();
        }
      });
      return;
    }

    Swal.fire({
      title: 'Mark Cargo Delivered?',
      text: `Confirm receipt verification for Consignment ${selectedDispatchForDelivery.id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm Delivery',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        showToast('Recording delivery confirmation...');
        try {
          const dispatchId = selectedDispatchForDelivery.id;
          const dispatchRecord = (state.dispatches || []).find(d => d.id === dispatchId || d.dispatchId === dispatchId);
          const targetOrderId = dispatchRecord?.orderId || dispatchRecord?.orderNo || selectedDispatchForDelivery.orderNo;

          const updatedDispatches = (state.dispatches || []).map(d => {
            if (d.id === dispatchId || d.dispatchId === dispatchId) {
              return { ...d, dispatchStatus: 'delivered', status: 'Delivered', deliveredAt: new Date().toISOString() };
            }
            return d;
          });

          const updatedOrders = (state.sales?.orders || []).map(o => {
            if (String(o.id) === String(targetOrderId) || String(o.orderNo) === String(targetOrderId)) {
              return { ...o, workflowStatus: 'DELIVERED', status: 'Delivered', dispatchStatus: 'delivered', deliveredAt: new Date().toISOString() };
            }
            return o;
          });

          setState({ ...state, dispatches: updatedDispatches, orders: updatedOrders });
          showToast(`Consignment ${dispatchId} marked DELIVERED successfully!`);
          closeDeliveryModal();
          navigate.push('/dispatch/history');
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Delivery Failed', text: err.message || String(err) });
        }
      }
    });
  };

  const handleAssignPickupClick = (sample) => {
    setActiveRetrievalSample(sample);
    setRetrievalVehicleNo(`MH-12-PQ-${Math.floor(1000 + Math.random() * 9000)}`);
    setRetrievalDriverName('Satish Kumar');
    setRetrievalDriverMobile('9876543210');
    setRetrievalDate(new Date().toISOString().split('T')[0]);
  };

  const handleRetrievalSubmit = async (e) => {
    e.preventDefault();
    if (!retrievalVehicleNo.trim() || !retrievalDriverName.trim() || !retrievalDate) {
      showToast("Please fill in all mandatory retrieval fields.");
      return;
    }

    showToast(`Assigning return pick-up driver for sample SMP-${String(activeRetrievalSample.id).padStart(3, '0')}...`);

    const sample = activeRetrievalSample;
    let extra = {};
    if (sample.testingParameters) {
      try {
        extra = JSON.parse(sample.testingParameters);
      } catch {
        // ignore
      }
    }
    extra.retrievalStatus = 'In Transit';
    extra.retrievalDetails = {
      vehicleNo: retrievalVehicleNo.trim(),
      driverName: retrievalDriverName.trim(),
      driverMobile: retrievalDriverMobile.trim(),
      pickupDate: retrievalDate
    };

    const body = {
      testingParameters: JSON.stringify(extra)
    };

    try {
      await salesService.updateSample(state, sample.id, body, dispatch, user);
      await syncData();
      showToast(`Return driver assigned successfully for Sample #${activeRetrievalSample.id}!`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || err });
    }

    setActiveRetrievalSample(null);
  };

  const handleConfirmReturnClick = (sample) => {
    setSelectedSampleForRetrievalConfirm(sample);
    setRetrievalPodFile('');
    setRetrievalPodPreviewUrl('');
    setShowRetrievalModal(true);
  };

  const handleReturnConfirmSubmit = (e) => {
    e.preventDefault();
    if (!selectedSampleForRetrievalConfirm) return;
    if (!retrievalPodFile) {
      showToast('Proof of Return (POR) Image is MANDATORY to mark sample cargo as Returned.');
      return;
    }

    Swal.fire({
      title: 'Confirm Return Receipt?',
      text: `Confirm retrieval verification for Sample SMP-${String(selectedSampleForRetrievalConfirm.id).padStart(3, '0')} and upload return proof image?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm Return',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        showToast("Dispatch: Recording sample return proof of delivery...");

        const sample = selectedSampleForRetrievalConfirm;
        let extra = {};
        if (sample.testingParameters) {
          try {
            extra = JSON.parse(sample.testingParameters);
          } catch {
            // ignore
          }
        }
        extra.retrievalStatus = 'Retrieved';
        extra.retrievalDetails = {
          ...(extra.retrievalDetails || {}),
          returnDate: new Date().toISOString().split('T')[0],
          returnPod: retrievalPodPreviewUrl
        };

        const nowStr = new Date().toISOString();
        const body = {
          status: 'Returned',
          returnedDate: nowStr,
          retrievalStatus: 'Retrieved',
          testingParameters: JSON.stringify(extra)
        };

        try {
          await salesService.updateSample(state, sample.id, body, dispatch, user);
          await syncData();

          const notifId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          if (addNotification) {
            addNotification({
              id: notifId,
              module: 'sales',
              title: 'Sample Successfully Returned',
              message: `Sample SMP-${String(sample.id).padStart(3, '0')} for ${sample.leadName || sample.customer || 'ABC Infrastructure Pvt Ltd'} has been successfully returned.`,
              type: 'sample_returned',
              referenceId: sample.id,
              navigationUrl: `/sales/samples?sampleId=${sample.id}`,
              isRead: false,
              is_read: false,
              createdAt: nowStr,
            });
          }

          showToast(`Sample SMP-${String(selectedSampleForRetrievalConfirm.id).padStart(3, '0')} successfully marked as RETURNED to plant! Notification sent.`);
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Error', text: err.message || err });
        }

        setShowRetrievalModal(false);
        setSelectedSampleForRetrievalConfirm(null);
      }
    });
  };

  // ΓöÇΓöÇ Handle Return Dispatch Form Submission ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleReturnDispatchFormSubmit = async (e) => {
    e.preventDefault();
    if (!activeReturnDispatchSample) return;
    if (!rdVehicleNo.trim()) { showToast('Return Vehicle No is required.'); return; }
    if (!rdDriverName.trim()) { showToast('Return Driver Name is required.'); return; }
    if (!rdCourier.trim()) { showToast('Courier / Transport is required.'); return; }

    showToast('Dispatch: Updating sample status to Return In TransitΓÇª');

    const nowStr = new Date().toISOString();
    const body = {
      status: 'Return In Transit',
      returnDispatchDate: rdDispatchDate ? new Date(rdDispatchDate).toISOString() : nowStr,
      returnVehicleNo: rdVehicleNo.trim(),
      returnDriverName: rdDriverName.trim(),
      returnDriverPhone: rdDriverPhone.trim(),
      returnCourier: rdCourier.trim(),
      returnLrAwbNumber: rdLrAwb.trim(),
      returnTransportationCost: rdTransportCost !== '' ? parseFloat(rdTransportCost) || 0 : 0,
      returnDocument: rdDocPreview || null,
      returnRemarks: rdRemarks.trim(),
      retrievalStatus: 'In Transit',
      retrievalDetails: {
        vehicleNo: rdVehicleNo.trim(),
        driverName: rdDriverName.trim(),
        driverMobile: rdDriverPhone.trim(),
        transportMode: rdCourier.trim(),
        lrNumber: rdLrAwb.trim(),
        pickupDate: rdDispatchDate
      }
    };

    try {
      await salesService.updateSample(state, activeReturnDispatchSample.id, body, dispatch, user);
      await syncData();
      showToast(`Sample SMP-${String(activeReturnDispatchSample.id).padStart(3, '0')} return cargo in transit!`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Dispatch Failed', text: err.message || err });
    }

    setActiveReturnDispatchSample(null);
    setRdVehicleNo(''); setRdDriverName(''); setRdDriverPhone(''); setRdCourier('');
    setRdLrAwb(''); setRdDispatchDate(new Date().toISOString().split('T')[0]);
    setRdTransportCost(''); setRdDocFile(''); setRdDocPreview(''); setRdRemarks('');
  };

  // ΓöÇΓöÇ New: Handle the Dispatch Form submission per sample ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleSampleDispatchFormSubmit = async (e) => {
    e.preventDefault();
    if (!sdVehicleNo.trim()) { showToast('Vehicle No is required.'); return; }
    if (!sdDriverName.trim()) { showToast('Driver Name is required.'); return; }
    if (!sdCourier.trim()) { showToast('Courier / Transport is required.'); return; }
    if (!sdDispatchDate) { showToast('Dispatch Date is required.'); return; }

    showToast('Dispatch: Assigning vehicle and updating sample status to In TransitΓÇª');

    const body = {
      vehicle_no: sdVehicleNo.trim(),
      driver_name: sdDriverName.trim(),
      transport_mode: sdCourier.trim(),
      lr_awb_number: sdLrAwb.trim(),
      dispatch_document: sdDocPreview || null,
      dispatch_date: sdDispatchDate,
      dispatch_status: 'In Transit',
      status: 'Dispatched',
      transport_cost: sdTransportCost !== '' ? parseFloat(sdTransportCost) || 0 : 0,
      remarks: sdRemarks.trim(),
      // Also write to legacy JSON fields for backward compat
      transporter: sdCourier.trim(),
      dispatchDate: sdDispatchDate,
    };

    try {
      await salesService.updateSample(state, activeSampleDispatch.id, body, dispatch, user);
      await syncData();
      showToast(`Sample SMP-${String(activeSampleDispatch.id).padStart(3, '0')} dispatched! Status: In Transit.`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Dispatch Failed', text: err.message || err });
    }

    setActiveSampleDispatch(null);
    setSdVehicleNo(''); setSdDriverName(''); setSdCourier(''); setSdLrAwb('');
    setSdDispatchDate(new Date().toISOString().split('T')[0]);
    setSdDocFile(''); setSdDocPreview(''); setSdRemarks(''); setSdTransportCost('');
  };

  // ΓöÇΓöÇ New: Handle the Delivery Confirmation form submission per sample ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleSampleDeliveryFormSubmit = async (e) => {
    e.preventDefault();
    if (!dlPodImagePreview) { showToast('Proof of Delivery Image is MANDATORY.'); return; }
    if (!dlReceiverName.trim()) { showToast('Receiver Name is required.'); return; }
    if (!dlDeliveryDate) { showToast('Delivery Date is required.'); return; }

    showToast('Dispatch: Recording delivery proof and updating sample status to DeliveredΓÇª');

    const deliveredDt = new Date(dlDeliveryDate);
    const evalEnd = new Date(deliveredDt);
    evalEnd.setDate(evalEnd.getDate() + 20);

    const nowStr = deliveredDt.toISOString();
    const body = {
      delivery_date: dlDeliveryDate,
      receiver_name: dlReceiverName.trim(),
      receiverName: dlReceiverName.trim(),
      receiver_mobile: dlReceiverMobile.trim(),
      delivery_remarks: dlRemarks.trim(),
      pod_image: dlPodImagePreview,
      pod_document: dlPodDocPreview || null,
      dispatchStatus: 'Delivered',
      dispatch_status: 'Delivered',
      status: 'Client Testing',
      deliveredAt: nowStr,
      testingStartDate: nowStr,
      testingEndDate: evalEnd.toISOString(),
      deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      podUploaded: 'Yes',
      // Legacy compat
      delivered: true,
      deliveredDate: nowStr,
      evaluationEndDate: evalEnd.toISOString(),
      podImage: dlPodImagePreview,
    };

    try {
      await salesService.updateSample(state, activeSampleDelivery.id, body, dispatch, user);
      await syncData();
      Swal.fire({
        icon: 'success',
        title: 'Delivery Confirmed!',
        html: `Sample <strong>SMP-${String(activeSampleDelivery.id).padStart(3, '0')}</strong> marked as <strong>Delivered</strong>.<br/>Receiver: <strong>${dlReceiverName.trim()}</strong>`,
        confirmButtonText: 'Close',
        customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' },
        buttonsStyling: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delivery Failed', text: err.message || err });
    }

    setActiveSampleDelivery(null);
    setDlDeliveryDate(new Date().toISOString().split('T')[0]);
    setDlReceiverName(''); setDlReceiverMobile(''); setDlRemarks('');
    setDlPodImage(''); setDlPodImagePreview('');
    setDlPodDoc(''); setDlPodDocPreview('');
    setDlSignature(''); setDlSignaturePreview('');
  };

  // 1. Enterprise Dynamic Dispatch Dashboard View
  const renderDashboard = () => {
    // Pure Dynamic KPI Calculations from live backend & ERP state
    const readyCount = backendReadyWorkOrders.length || dispatchQueueOrders.length || qcPassed.length || 0;
    
    const inTransitDispatches = backendDispatches.filter(d => ['IN_TRANSIT', 'In Transit'].includes(d.status || d.dispatchStatus));
    const inTransitCount = inTransitDispatches.length || filteredOrders.filter(o => ['IN_TRANSIT', 'In Transit'].includes(o.status || o.workflowStatus)).length || 0;
    
    const outDeliveryDispatches = backendDispatches.filter(d => ['OUT_FOR_DELIVERY', 'Out for Delivery'].includes(d.status || d.dispatchStatus));
    const outDeliveryCount = outDeliveryDispatches.length || filteredOrders.filter(o => ['OUT_FOR_DELIVERY', 'Out for Delivery'].includes(o.status || o.workflowStatus)).length || 0;
    
    const deliveredDispatches = backendDispatches.filter(d => ['DELIVERED', 'Delivered'].includes(d.status || d.dispatchStatus));
    const deliveredCount = deliveredDispatches.length || filteredOrders.filter(o => ['DELIVERED', 'Delivered'].includes(o.status || o.workflowStatus)).length || 0;
    
    const returnsCount = backendReturns.length || replacementDispatches.length || 0;

    // Today's Performance calculation
    const plannedDispatches = readyCount + inTransitCount + outDeliveryCount + deliveredCount;
    const dispatchedCount = inTransitCount + outDeliveryCount + deliveredCount;
    const deliveredToday = deliveredCount;
    const pendingCount = readyCount;
    const totalPerfDenominator = dispatchedCount + pendingCount;
    const successRate = totalPerfDenominator > 0
      ? Math.min(100, Math.max(0, Math.round((deliveredToday / totalPerfDenominator) * 100)))
      : 100;

    // Status Distribution percentages
    const totalStatusCount = readyCount + inTransitCount + outDeliveryCount + deliveredCount + returnsCount;
    const pctReady = totalStatusCount > 0 ? Math.round((readyCount / totalStatusCount) * 100) : 0;
    const pctInTransit = totalStatusCount > 0 ? Math.round((inTransitCount / totalStatusCount) * 100) : 0;
    const pctOutDelivery = totalStatusCount > 0 ? Math.round((outDeliveryCount / totalStatusCount) * 100) : 0;
    const pctDelivered = totalStatusCount > 0 ? Math.round((deliveredCount / totalStatusCount) * 100) : 0;
    const pctReturns = totalStatusCount > 0 ? Math.round((returnsCount / totalStatusCount) * 100) : 0;

    // Dynamic Ready Queue Data
    const readyQueueData = backendReadyWorkOrders.length > 0
      ? backendReadyWorkOrders.slice(0, 5).map(wo => ({
          dispatchNo: `DISP-${wo.id.slice(-4).toUpperCase()}`,
          customer: wo.productionPlan?.salesOrder?.customer?.companyName || wo.productionPlan?.salesOrder?.customer?.name || 'Customer',
          salesOrder: wo.productionPlan?.salesOrder?.orderNumber || `SO-${wo.salesOrderItemId?.slice(-5) || '10001'}`,
          qty: wo.quantity || 1,
          warehouse: 'FG-01',
          id: wo.id,
        }))
      : dispatchQueueOrders.slice(0, 5).map(d => ({
          dispatchNo: d.id,
          customer: d.customerName || 'Customer',
          salesOrder: d.orderId || 'SO-10001',
          qty: (d.items || []).reduce((s, i) => s + Number(i.dispatchableQuantity || 1), 0),
          warehouse: 'FG-01',
          id: d.id,
        }));

    // Dynamic Active Shipments Data
    const combinedActiveDispatches = [...inTransitDispatches, ...outDeliveryDispatches];
    const activeShipmentsData = combinedActiveDispatches.slice(0, 5).map(d => ({
      dispatchNo: d.dispatchNo || d.id || 'DISP-1001',
      customer: d.salesOrder?.customer?.companyName || d.salesOrder?.customer?.name || d.customerName || 'Customer',
      vehicle: d.vehicleNumber || d.vehicleNo || 'Vehicle',
      driver: d.driverName || 'Driver',
      eta: d.eta ? new Date(d.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending',
      status: d.status === 'OUT_FOR_DELIVERY' || d.status === 'Out for Delivery' ? 'Out' : 'Transit',
    }));

    // Dynamic Pending POD list
    const pendingPodDispatches = backendDispatches.filter(d => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(d.status) && !d.podUrl);
    const pendingPodList = pendingPodDispatches.slice(0, 5).map(d => d.dispatchNo || d.id);

    // Dynamic Returns Summary Cards
    const returnPendingCount = backendReturns.filter(r => ['SUBMITTED', 'PENDING'].includes(r.status)).length;
    const qcInspectionCount = backendReturns.filter(r => ['QC_PENDING', 'INSPECTION'].includes(r.status)).length;
    const replacementReadyCount = replacementDispatches.filter(r => ['APPROVED', 'READY'].includes(r.dispatch_status || r.status)).length;
    const creditNotePendingCount = backendReturns.filter(r => r.status === 'ACCEPTED_FOR_CREDIT').length;

    const todayDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Truck size={24} color="#38bdf8" />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                🚚 Dispatch Dashboard
              </h1>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Enterprise Logistics Management & Real-time Delivery Operations
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '13px',
            fontWeight: '700',
            color: '#e2e8f0'
          }}>
            <span>Today: {todayDateStr}</span>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="app-card" style={{ padding: '18px 20px', borderLeft: '4px solid #3b82f6', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ready</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginTop: '6px' }}>{readyCount}</div>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>Orders waiting for vehicle</span>
          </div>

          <div className="app-card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Transit</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginTop: '6px' }}>{inTransitCount}</div>
            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>Consignments en route</span>
          </div>

          <div className="app-card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out Delivery</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginTop: '6px' }}>{outDeliveryCount}</div>
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>Vehicles out for delivery</span>
          </div>

          <div className="app-card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivered</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginTop: '6px' }}>{deliveredCount}</div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Successfully fulfilled</span>
          </div>

          <div className="app-card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Returns</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', marginTop: '6px' }}>{returnsCount}</div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>RMA & replacement tickets</span>
          </div>
        </div>

        {/* 2 Column Performance & Status Distribution Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Today's Dispatch Performance */}
          <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} color="#0284c7" />
              Today's Dispatch Performance
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Planned Dispatches</span>
                <strong style={{ color: '#1e293b', fontWeight: '800' }}>{plannedDispatches}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Dispatched</span>
                <strong style={{ color: '#0284c7', fontWeight: '800' }}>{dispatchedCount}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Delivered</span>
                <strong style={{ color: '#059669', fontWeight: '800' }}>{deliveredToday}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Pending</span>
                <strong style={{ color: '#d97706', fontWeight: '800' }}>{pendingCount}</strong>
              </div>

              <div style={{ marginTop: '8px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Success Rate</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>{successRate}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${successRate}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Status Distribution */}
          <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={18} color="#6366f1" />
              Dispatch Status Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', fontWeight: '600' }}>
                  <span style={{ color: '#334155' }}>Ready ({readyCount})</span>
                  <span style={{ color: '#3b82f6', fontWeight: '700' }}>{pctReady}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctReady}%`, height: '100%', background: '#3b82f6', borderRadius: '5px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', fontWeight: '600' }}>
                  <span style={{ color: '#334155' }}>In Transit ({inTransitCount})</span>
                  <span style={{ color: '#0284c7', fontWeight: '700' }}>{pctInTransit}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctInTransit}%`, height: '100%', background: '#0284c7', borderRadius: '5px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', fontWeight: '600' }}>
                  <span style={{ color: '#334155' }}>Out for Delivery ({outDeliveryCount})</span>
                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>{pctOutDelivery}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctOutDelivery}%`, height: '100%', background: '#f59e0b', borderRadius: '5px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', fontWeight: '600' }}>
                  <span style={{ color: '#334155' }}>Delivered ({deliveredCount})</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>{pctDelivered}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctDelivered}%`, height: '100%', background: '#10b981', borderRadius: '5px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', fontWeight: '600' }}>
                  <span style={{ color: '#334155' }}>Returns ({returnsCount})</span>
                  <span style={{ color: '#ef4444', fontWeight: '700' }}>{pctReturns}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctReturns}%`, height: '100%', background: '#ef4444', borderRadius: '5px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ready For Dispatch Queue Table */}
        <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Ready For Dispatch Queue</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Orders inspected by QC and staged for consignment</p>
            </div>
            <button
              onClick={() => navigate.push('/dispatch/orders')}
              style={{ background: '#f1f5f9', color: '#0284c7', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Dispatch#</th>
                  <th style={{ padding: '10px 14px' }}>Customer</th>
                  <th style={{ padding: '10px 14px' }}>Sales Order</th>
                  <th style={{ padding: '10px 14px' }}>Qty</th>
                  <th style={{ padding: '10px 14px' }}>Warehouse</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {readyQueueData.length > 0 ? (
                  readyQueueData.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>{row.dispatchNo}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b' }}>{row.customer}</td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: '500' }}>{row.salesOrder}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1e293b' }}>{row.qty} Pcs</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>{row.warehouse}</span></td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate.push(row.id ? `/dispatch/create-dispatch?workOrderId=${row.id}` : '/dispatch/create-dispatch')}
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <PlusCircle size={13} /> Create Dispatch
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                      No orders currently staged for dispatch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Shipments Table */}
        <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Active Shipments</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Vehicles and carriers currently on the road</p>
            </div>
            <button
              onClick={() => navigate.push('/dispatch/in-transit')}
              style={{ background: '#f1f5f9', color: '#0284c7', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Dispatch#</th>
                  <th style={{ padding: '10px 14px' }}>Customer</th>
                  <th style={{ padding: '10px 14px' }}>Vehicle</th>
                  <th style={{ padding: '10px 14px' }}>Driver</th>
                  <th style={{ padding: '10px 14px' }}>ETA</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeShipmentsData.length > 0 ? (
                  activeShipmentsData.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>{row.dispatchNo}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b' }}>{row.customer}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#334155' }}>{row.vehicle}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{row.driver}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1e293b' }}>{row.eta}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: row.status === 'Out' ? '#fef3c7' : '#e0f2fe',
                          color: row.status === 'Out' ? '#b45309' : '#0369a1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '800'
                        }}>
                          {row.status === 'Out' ? 'Out for Delivery' : 'In Transit'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate.push(row.status === 'Out' ? '/dispatch/delivery' : '/dispatch/in-transit')}
                          style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {row.status === 'Out' ? 'Update' : 'Track'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                      No active shipments currently on the road.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2 Column Pending POD & Recent Activities Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Pending POD */}
          <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#d97706" />
              Pending POD (Proof of Delivery)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPodList.length > 0 ? (
                pendingPodList.map((podNo, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    <span style={{ fontWeight: '800', color: '#b45309', fontFamily: 'monospace', fontSize: '13px' }}>{podNo}</span>
                    <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: '700' }}>Awaiting Sign/Photo</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12.5px', fontWeight: '600' }}>
                  All delivered dispatches have verified PODs.
                </div>
              )}

              <button
                onClick={() => navigate.push('/dispatch/delivery')}
                style={{ marginTop: '8px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
              >
                📸 Upload POD / Confirm Delivery
              </button>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="#10b981" />
              Recent Activities & Audit Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', fontSize: '13px' }}>
                <span style={{ color: '#10b981', fontWeight: '900' }}>✓</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>DISP-1005 Delivered (Customer: ABC Ltd)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', fontSize: '13px' }}>
                <span style={{ color: '#0284c7', fontWeight: '900' }}>✓</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>DISP-1006 Out For Delivery (Driver: Amit Shah)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', fontSize: '13px' }}>
                <span style={{ color: '#3b82f6', fontWeight: '900' }}>✓</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>DISP-1007 Dispatch Created (Vehicle: GJ01AB1234)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', fontSize: '13px' }}>
                <span style={{ color: '#10b981', fontWeight: '900' }}>✓</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>POD Uploaded for DISP-1004</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', fontSize: '13px' }}>
                <span style={{ color: '#ef4444', fontWeight: '900' }}>✓</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>Return Request RET-2026-001 Submitted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns & Replacement Summary Widget */}
        <div className="app-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Returns & Replacement Summary</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>RMA tickets, quality evaluations, and credit note authorizations</p>
            </div>
            <button
              onClick={() => navigate.push('/dispatch/returns')}
              style={{ background: '#f1f5f9', color: '#0284c7', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#be123c', fontWeight: '700' }}>Return Pending</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#881337', marginTop: '4px' }}>{returnPendingCount}</div>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#a16207', fontWeight: '700' }}>QC Inspection</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#713f12', marginTop: '4px' }}>{qcInspectionCount}</div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>Replacement Ready</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#14532d', marginTop: '4px' }}>{replacementReadyCount}</div>
            </div>

            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '700' }}>Credit Note Pending</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#4c1d95', marginTop: '4px' }}>{creditNotePendingCount}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#1e293b', margin: '0 0 14px 0' }}>Quick Actions</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => navigate.push('/dispatch/create-dispatch')}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)' }}
            >
              <PlusCircle size={16} /> + Create Dispatch
            </button>

            <button
              onClick={() => navigate.push('/dispatch/in-transit')}
              style={{ background: '#0369a1', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Truck size={16} /> 🚚 Start Delivery
            </button>

            <button
              onClick={() => navigate.push('/dispatch/delivery')}
              style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FileCheck size={16} /> ✅ Confirm Delivery
            </button>

            <button
              onClick={() => navigate.push('/dispatch/history')}
              style={{ background: '#475569', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ClipboardList size={16} /> 📦 Dispatch History
            </button>

            <button
              onClick={() => navigate.push('/dispatch/returns')}
              style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              🔄 Returns
            </button>

            <button
              onClick={() => navigate.push('/dispatch/replacements')}
              style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              ♻ Replacement Dispatch
            </button>
          </div>
        </div>

      </div>
    );
  };

  // 2. Orders View
  const renderOrders = () => {
    // ΓöÇΓöÇΓöÇ Handle Create Dispatch for queue record ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const handleCreateDispatchFromQueue = async (queueRecord) => {
      const { value: formValues } = await Swal.fire({
        title: `Create Dispatch ΓÇö ${queueRecord.orderId}`,
        html: `
          <div style="text-align:left;display:flex;flex-direction:column;gap:12px;padding:8px 0">
            <label style="font-size:13px;font-weight:700;color:#475569">Vehicle Number</label>
            <input id="swal-vehicle" class="swal2-input" placeholder="e.g. UK-07-1234" style="margin:0;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Driver Name</label>
            <input id="swal-driver" class="swal2-input" placeholder="e.g. Ramesh Kumar" style="margin:0;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Driver Mobile</label>
            <input id="swal-mobile" class="swal2-input" placeholder="e.g. 9876543210" style="margin:0;font-size:14px" />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Create Dispatch',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const vehicleNumber = document.getElementById('swal-vehicle').value.trim();
          const driverName = document.getElementById('swal-driver').value.trim();
          const driverMobile = document.getElementById('swal-mobile').value.trim();
          if (!vehicleNumber || !driverName) {
            Swal.showValidationMessage('Vehicle number and driver name are required.');
            return false;
          }
          return { vehicleNumber, driverName, driverMobile };
        }
      });
      if (!formValues) return;
      try {
        useERPStore.getState().createDispatch(queueRecord.id, formValues);
        await Swal.fire({ icon: 'success', title: 'Dispatch Created', text: `Consignment created for Order ${queueRecord.orderId}.`, timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ΓöÇΓöÇ Canonical Dispatch Queue (from Finished Goods) ΓöÇΓöÇ */}
        <div className="app-card">
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading" style={{ margin: 0 }}>Dispatch Orders Queue</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Finished goods sent to dispatch ΓÇö ready for vehicle allocation.
              </p>
            </div>
          </div>
          <DataTable
            columns={[
              { header: 'Queue ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '12px' }}>{row.id}</strong> },
              { header: 'Order ID', accessor: 'orderId', render: (row) => <strong>{row.orderId}</strong> },
              { header: 'Batch ID', accessor: 'batchId', render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{row.batchId || 'ΓÇö'}</span> },
              { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || 'ΓÇö' },
              { header: 'Product', accessor: 'items', render: (row) => (row.items || []).map(i => i.productName).join(', ') || 'ΓÇö' },
              { header: 'QC Approved Qty', accessor: 'items', render: (row) => <strong>{(row.items || []).reduce((s, i) => s + Number(i.approvedQuantity || 0), 0)}</strong> },
              { header: 'Dispatchable Qty', accessor: 'items', render: (row) => <strong style={{ color: '#10b981' }}>{(row.items || []).reduce((s, i) => s + Number(i.dispatchableQuantity || 0), 0)}</strong> },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status === 'READY_FOR_DISPATCH' ? 'Ready for Dispatch' : row.status === 'DISPATCH_CREATED' ? 'Dispatch Created' : row.status} /> },
            ]}
            data={dispatchQueueOrders}
            searchQuery={globalSearch}
            searchField="orderId"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                {row.status === 'READY_FOR_DISPATCH' ? (
                  <button
                    className="action-btn"
                    style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleCreateDispatchFromQueue(row)}
                  >
                    <Truck size={14} /> Create Dispatch
                  </button>
                ) : (
                  <StatusBadge status="Dispatched" />
                )}
              </div>
            )}
            emptyMessage="No dispatch queue records yet. Send finished goods to dispatch from /production/finished-goods."
          />
        </div>

        {/* ΓöÇΓöÇ Legacy QC-Passed Orders (existing flow) ΓöÇΓöÇ */}
        {qcPassed.length > 0 && (
          <div className="app-card">
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="card-heading" style={{ margin: 0 }}>QC Passed Cargo Shipments</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {selectedOrderNos.length > 0 && (
                  <button
                    type="button"
                    className="action-btn"
                    style={{
                      background: 'var(--color-primary)',
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => navigate.push('/dispatch/create-dispatch')}
                  >
                    <Truck size={14} /> Create Dispatch ({selectedOrderNos.length} Selected)
                  </button>
                )}
              </div>
            </div>
            <DataTable
              columns={[
                {
                  header: (
                    <input
                      type="checkbox"
                      checked={qcPassed.length > 0 && qcPassed.every(o => selectedOrderNos.includes(o.orderNo))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrderNos(qcPassed.map(o => o.orderNo));
                        } else {
                          setSelectedOrderNos([]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  ),
                  accessor: 'checkbox',
                  render: (row) => (
                    <input
                      type="checkbox"
                      checked={selectedOrderNos.includes(row.orderNo)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrderNos(prev => [...prev, row.orderNo]);
                        } else {
                          setSelectedOrderNos(prev => prev.filter(no => no !== row.orderNo));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                },
                {
                  header: 'Order No', accessor: 'orderNo', render: (row) => {
                    const isTrading = row.status === 'READY_FOR_DISPATCH' || row.status === 'Ready for Dispatch' || (row.products && (row.products.includes('Pipe') || row.products.includes('Grating') || row.products.includes('Tray') || row.products.includes('Ladder')));
                    const isManufacturing = row.status !== 'READY_FOR_DISPATCH' && row.status !== 'Ready for Dispatch';
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                          onClick={() => navigate.push(`/orders/${row.orderNo}`)}
                        >
                          {row.orderNo}
                        </span>
                        {isTrading && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', background: '#dbeafe', color: '#1e40af' }}>
                            ≡ƒö╡ Trading
                          </span>
                        )}
                        {isManufacturing && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', background: '#d1fae5', color: '#065f46' }}>
                            ≡ƒƒó Manufacturing
                          </span>
                        )}
                      </div>
                    );
                  }
                },
                { header: 'Customer Name', accessor: 'customerName', render: (row) => row.customerName || row.customer_name || row.customer?.name || row.companyName || 'ΓÇö' },
                {
                  header: 'Product Item', accessor: 'products', render: (row) => {
                    const rawItems = Array.isArray(row.detailedItems) && row.detailedItems.length ? row.detailedItems : (Array.isArray(row.items) ? row.items : []);
                    const pNames = rawItems.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ');
                    return row.products || row.productItem || row.productName || pNames || 'ΓÇö';
                  }
                },
                {
                  header: 'Total Weight', accessor: 'quantity', render: (row) => {
                    const qty = row.quantity || row.estimatedQuantity || row.total_tonnage || 0;
                    const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                    return `${parsedQty || 0} Tons`;
                  }
                },
                {
                  header: 'Completed Dispatch', accessor: 'dispatch.completed', render: (row) => {
                    const qty = row.dispatch?.completed || 0;
                    const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                    return `${parsedQty || 0} Tons`;
                  }
                },
                {
                  header: 'Outstanding Dispatch', accessor: 'dispatch.remaining', render: (row) => {
                    const qty = row.dispatch?.remaining ?? (row.quantity || row.estimatedQuantity || row.total_tonnage || 0);
                    const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                    return `${parsedQty || 0} Tons`;
                  }
                }
              ]}
              data={qcPassed}
              searchQuery={globalSearch}
              searchField="customer.name"
              actions={(row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="action-btn"
                    style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setSelectedOrderForDispatch(row);
                      setSelectedOrderNos([row.orderNo]);
                      navigate.push('/dispatch/create-dispatch');
                    }}
                  >
                    <PlusCircle size={14} /> Allocate Vehicle
                  </button>
                  <button
                    className="action-btn"
                    style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #D6E2F0', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => navigate.push(`/dispatch/partial/${row.orderNo}`)}
                  >
                    <ClipboardList size={14} /> Track Partial
                  </button>
                </div>
              )}
              emptyMessage="No cargo waiting for vehicle allocation."
            />
          </div>
        )}
      </div>
    );
  };


  // 3. Create Dispatch View
  const renderCreateDispatch = () => {
    if (qcPassed.length === 0 && !selectedOrderForDispatch) {
      return (
        <div className="app-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No QC Passed orders ready for logistics.</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Logistics booking requires batches that have passed QC inspection first.</p>
          <button className="form-submit-btn" style={{ maxWidth: '200px', margin: '20px auto 0' }} onClick={() => navigate.push('/dispatch/dashboard')}>
            View Dashboard
          </button>
        </div>
      );
    }

    const activeOrders = selectedOrderNos
      .map(no => orders.find(o => o.orderNo === no))
      .filter(Boolean);

    const order = selectedOrderForDispatch || activeOrders[0];
    const rawItems = Array.isArray(order?.detailedItems) && order.detailedItems.length
      ? order.detailedItems
      : (Array.isArray(order?.items) ? order.items : []);
    const pNames = rawItems.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ');
    const productDisplay = order?.products || order?.productItem || order?.productName || pNames || '\u2014';
    const customerDisplay = order?.customerName || order?.customer_name || order?.customer?.name || order?.companyName || '\u2014';
    const qtyRaw = order?.quantity || order?.estimatedQuantity || order?.total_tonnage || 0;
    const qtyParsed = typeof qtyRaw === 'string' ? parseFloat(qtyRaw.replace(/[^0-9.]/g, '')) || 0 : qtyRaw;

    const readDocFile = (file) => {
      const reader = new FileReader();
      reader.onloadend = () => setCdDocPreview(reader.result);
      reader.readAsDataURL(file);
    };

    return (
      <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--color-accent-teal)" />
            Dispatch &mdash; {order?.orderNo || 'New Dispatch'}
          </h2>
          <button type="button" style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate.push('/dispatch/orders')}>Cancel</button>
        </div>

        {/* Order info card */}
        {order && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Customer</span><strong style={{ fontSize: '13.5px' }}>{customerDisplay}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Product</span><strong style={{ fontSize: '13.5px' }}>{productDisplay}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Quantity</span><strong style={{ fontSize: '13.5px' }}>{qtyParsed.toLocaleString()} Pcs</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Order Ref</span><strong style={{ fontSize: '13.5px', color: '#0369a1' }}>{order?.orderNo || '\u2014'}</strong></div>
          </div>
        )}

        {/* Dispatch form */}
        <form onSubmit={handleDispatchSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Vehicle No *</label>
            <input type="text" required placeholder="e.g. UK-07-CB-1234" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Driver Name *</label>
            <input type="text" required placeholder="e.g. Ramesh Singh" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Courier / Transport *</label>
            <input type="text" required placeholder="e.g. Himalaya Own Fleet / DTDC" value={cdCourier} onChange={(e) => setCdCourier(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">LR / AWB Number</label>
            <input type="text" placeholder="e.g. LR-2024-00123" value={lrNumber} onChange={(e) => setLrNumber(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dispatch Date *</label>
            <input type="date" required value={cdDispatchDate} onChange={(e) => setCdDispatchDate(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Transportation Cost (\u20b9)</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 500.00" value={transportCost === '0' ? '' : transportCost} onChange={(e) => setTransportCost(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} />
          </div>

          {/* Dispatch Document Upload */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dispatch Document (PDF/Image)</label>
            <label style={{ border: `2px dashed ${cdDocPreview ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: cdDocPreview ? '#f0fdf4' : '#F5FAFE', gap: '6px', minHeight: '80px', justifyContent: 'center' }}>
              {cdDocPreview ? (
                cdDocPreview.startsWith('data:image') ? (
                  <img src={cdDocPreview} alt="Doc" style={{ height: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: '700' }}><FileCheck size={16} /> Document uploaded</div>
                )
              ) : (
                <><FileText size={22} color="#8893A7" /><span style={{ fontSize: '11.5px', color: '#5E6B82' }}>Click to upload PDF or Image</span></>
              )}
              <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setCdDocFile(f.name); readDocFile(f); } }} />
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 0, gridColumn: isMobile ? '1' : 'span 2' }}>
            <label className="form-label">Dispatch Remarks</label>
            <textarea placeholder="Any special instructions or notes\u2026" value={cdRemarks} onChange={e => setCdRemarks(e.target.value)} className="form-input" rows={3} style={{ resize: 'vertical', color: '#000', background: '#fff' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 28px', fontSize: '14px', fontWeight: '800', width: isMobile ? '100%' : '260px' }}>
              \uD83D\uDE9A Confirm Dispatch
            </button>
          </div>
        </form>
      </div>
    );
  };

  // 4. Dispatch History
  const renderDispatchHistory = () => {
    const samples = state.sales?.samples || [];
    const parseExtra = sample => {
      try { return sample.testingParameters ? JSON.parse(sample.testingParameters) : {}; } catch { return {}; }
    };
    const productText = value => Array.isArray(value)
      ? value.map(item => typeof item === 'string' ? item : item.productName || item.product_name || item.name).filter(Boolean).join(', ')
      : value;

    const orderDispatchesMapped = dispatches.map(d => {
      const order = orders.find(o => o.orderNo === d.orderNo || String(o.id) === String(d.orderId || d.order_id || d.sales_order_id));
      return {
        id: d.id || d.dispatchId || d.dispatch_number,
        orderNo: d.orderNo || d.order_number || order?.orderNo || `ORD-${d.orderId || d.order_id || d.sales_order_id}`,
        type: 'Sales Order',
        customerName: d.customerName || d.customer_name || order?.customerName || order?.customer_name || order?.customer?.name || 'Not recorded',
        product: productText(d.product || d.productName || d.products || order?.product || order?.productName || order?.products) || 'Not recorded',
        vehicleNo: d.vehicleNo || d.vehicle_number || '-',
        quantity: Number(d.quantity || d.totalQuantity || d.total_quantity) || 0,
        unit: d.unit || 'Tons',
        status: d.status || d.dispatchStatus || d.dispatch_status || 'Dispatch Pending',
        date: d.date || d.dispatchDate || d.dispatch_date || d.created_at || '-',
        _raw: d
      };
    });

    const existingOrderRefs = new Set(orderDispatchesMapped.map(row => String(row.orderNo)));
    const deliveredOrdersMapped = orders.filter(order => {
      const statuses = [order.status, order.workflowStatus, order.orderStatus, order.dispatch?.status].map(value => String(value || '').toUpperCase().replaceAll(' ', '_'));
      const ref = String(order.orderNo || order.order_no || order.public_id || order.id);
      return statuses.some(status => ['DELIVERED', 'DELIVERY_COMPLETED', 'COMPLETED', 'INVOICED', 'PAYMENT_PENDING', 'CLOSED'].includes(status)) && !existingOrderRefs.has(ref);
    }).map(order => {
      const ref = order.orderNo || order.order_no || order.public_id || order.id;
      const items = order.detailedItems || order.items || [];
      return {
        id: order.dispatch?.id || order.dispatch?.dispatch_number || `DEL-${ref}`,
        orderNo: ref,
        type: 'Sales Order',
        customerName: order.customerName || order.customer_name || order.customer?.name || 'Not recorded',
        product: productText(order.product || order.productName || order.product_name || order.products) || items.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ') || 'Not recorded',
        vehicleNo: order.dispatch?.vehicleNo || order.dispatch?.vehicle_number || order.vehicleNo || '-',
        quantity: Number(order.dispatch?.quantity || order.dispatch?.dispatchQty || order.deliveredQuantity || order.quantity) || items.reduce((sum, item) => sum + (Number(item.quantity || item.qty || item.quantity_ordered) || 0), 0),
        unit: order.unit || 'Tons', status: 'Delivered',
        date: order.deliveredDate || order.deliveryDate || order.dispatch?.deliveryDate || order.dispatch?.deliveredAt || order.updatedAt || '-',
        _raw: order.dispatch || order
      };
    });

    const sampleDispatchesMapped = samples.filter(s => s.dispatchDate || s.dispatch_date || s.dispatchStatus || s.dispatch_status).map(s => ({
      id: `SMP-${String(s.id).padStart(3, '0')}`, orderNo: `Sample (Lead #${s.leadId})`, type: 'Sample Dispatch',
      customerName: s.leadName || s.customerName || 'Not recorded', product: s.product || s.productName || 'Not recorded',
      vehicleNo: s.vehicle_no || s.vehicleNo || s.courier || '-', quantity: Number(s.quantity) || 0, unit: 'Pcs',
      status: s.dispatch_status || s.dispatchStatus || (s.delivered ? 'Delivered' : 'In Transit'), date: s.dispatch_date || s.dispatchDate || '-', _raw: s
    }));

    const sampleReturnsMapped = samples.map(s => ({ s, extra: parseExtra(s) }))
      .filter(({ s, extra }) => s.returnedDate || s.retrievalStatus || extra.retrievalStatus)
      .map(({ s, extra }) => ({
        id: `RET-SMP-${String(s.id).padStart(3, '0')}`, orderNo: `Sample Return (Lead #${s.leadId})`, type: 'Sample Return',
        customerName: s.leadName || s.customerName || 'Not recorded', product: s.product || s.productName || 'Not recorded',
        vehicleNo: extra.retrievalDetails?.vehicleNo || s.returnVehicleNo || '-', quantity: Number(s.quantity) || 0, unit: 'Pcs',
        status: s.retrievalStatus || extra.retrievalStatus || s.status || 'Return Due',
        date: s.returnedDate || extra.retrievalDetails?.returnDate || extra.retrievalDetails?.pickupDate || '-', _raw: s
      }));

    const replacementsMapped = replacementDispatches.map(r => ({
      id: r.request_no || `REP-${r.id}`, orderNo: r.order_number || 'Not recorded', type: 'Replacement',
      customerName: r.customer_name || 'Not recorded', product: r.product_name || 'Not recorded', vehicleNo: r.vehicle_number || '-',
      quantity: Number(r.approved_qty || r.quantity) || 0, unit: r.unit || 'Units', status: r.dispatch_status || r.status || 'Pending Dispatch',
      date: r.delivery_date || r.dispatch_date || r.updated_at || r.created_at || '-', _raw: r
    }));

    const allHistory = [...orderDispatchesMapped, ...deliveredOrdersMapped, ...sampleDispatchesMapped, ...sampleReturnsMapped, ...replacementsMapped]
      .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
    const unifiedHistory = historyFilter === 'All' ? allHistory : allHistory.filter(row => row.type === historyFilter);
    const badgeStyles = {
      'Sales Order': { background: '#dbeafe', color: '#1d4ed8' }, 'Sample Dispatch': { background: '#ede9fe', color: '#6d28d9' },
      'Sample Return': { background: '#ffedd5', color: '#c2410c' }, Replacement: { background: '#dcfce7', color: '#15803d' }
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <div><h2 className="card-heading">All Dispatch History</h2><p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Sales orders, samples, returns and replacements in one ledger.</p></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '14px 0 18px' }}>
          {['All', 'Sales Order', 'Sample Dispatch', 'Sample Return', 'Replacement'].map(filter => <button key={filter} type="button" onClick={() => setHistoryFilter(filter)} style={{ border: '1px solid var(--color-border)', borderRadius: '999px', padding: '7px 13px', cursor: 'pointer', fontWeight: 800, background: historyFilter === filter ? '#1f2937' : '#fff', color: historyFilter === filter ? '#fff' : '#374151' }}>{filter} ({filter === 'All' ? allHistory.length : allHistory.filter(row => row.type === filter).length})</button>)}
        </div>
        <DataTable
          columns={[
            { header: 'Reference', accessor: 'id', render: row => <strong>{row.id}</strong> },
            { header: 'Type', accessor: 'type', render: row => <span style={{ ...badgeStyles[row.type], borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap' }}>{row.type}</span> },
            { header: 'Order / Lead Ref', accessor: 'orderNo' },
            { header: 'Customer', accessor: 'customerName' },
            { header: 'Product', accessor: 'product' },
            { header: 'Vehicle / Courier', accessor: 'vehicleNo' },
            { header: 'Quantity', accessor: 'quantity', render: row => `${row.quantity} ${row.unit}` },
            { header: 'Date', accessor: 'date' },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={unifiedHistory}
          searchQuery={globalSearch}
          searchField="customerName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {row.type === 'Sales Order' && (
                <button
                  className="action-btn"
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #D6E2F0', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setSelectedDispatchForBill(row._raw);
                    setShowBillModal(true);
                  }}
                >
                  <FileText size={12} /> View Bill
                </button>
              )}

              {row.status === 'In Transit' && ['Sales Order', 'Sample Dispatch'].includes(row.type) && (
                <button
                  className="action-btn"
                  style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    if (row.type === 'Sample Dispatch') {
                      handleSampleDeliveryClick(row._raw);
                    } else {
                      setSelectedDispatchForDelivery(row._raw);
                      setShowDeliveryModal(true);
                    }
                  }}
                >
                  <FileCheck size={12} /> Confirm Delivery
                </button>
              )}
            </div>
          )}
          emptyMessage="No dispatch history found."
        />
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="app-card">
        <h3 className="card-heading">Logistics Tariffs Ledgers</h3>
        <DataTable
          columns={[
            {
              header: 'Order Ref', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/orders/${row.orderNo}`)}
                >
                  {row.orderNo}
                </span>
              )
            },
            { header: 'Transporter Agency', accessor: 'transporter' },
            { header: 'Freight Tariffs', accessor: 'transportCost', render: (row) => `Γé╣${row.transportCost.toLocaleString('en-IN')}` },
            { header: 'Vehicle No', accessor: 'vehicleNo' },
            { header: 'Dispatch Date', accessor: 'date' }
          ]}
          data={dispatches}
          searchQuery={globalSearch}
          searchField="transporter"
          emptyMessage="No transporter tariff details logged."
        />
      </div>
    );
  };

  const renderSampleDispatch = () => {
    const samples = state.sales?.samples || [];

    // ΓöÇΓöÇ Helper to read file as base64 ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const readFileAsBase64 = (file, setter) => {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    };

    // ΓöÇΓöÇ Filter by dispatch_status using the new column ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const filteredSamples = samples.filter(sample => {
      if (sampleFilter === 'Retrievals') return sample.retrievalStatus && sample.retrievalStatus !== 'None';
      if (sampleFilter === 'All') return true;
      if (sampleFilter === 'Pending Dispatch') return sample.dispatchStatus === 'Pending Dispatch' || (!sample.dispatchStatus && !sample.dispatchDate);
      if (sampleFilter === 'In Transit') return sample.dispatchStatus === 'In Transit';
      if (sampleFilter === 'Delivered') return sample.dispatchStatus === 'Delivered' || sample.delivered;
      return true;
    });

    // ΓöÇΓöÇ Show inline Retrieval form ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (activeRetrievalSample) {
      return (
        <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Schedule Outgoing Return Pickup</h2>
            <button type="button" style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} onClick={() => setActiveRetrievalSample(null)}>Cancel</button>
          </div>
          <form onSubmit={handleRetrievalSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Retrieval Reference</label>
              <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><span style={{ fontSize: '11px', color: '#c2410c', display: 'block' }}>Sample ID</span><strong>SMP-{String(activeRetrievalSample.id).padStart(3, '0')}</strong></div>
                <div><span style={{ fontSize: '11px', color: '#c2410c', display: 'block' }}>Customer</span><strong>{activeRetrievalSample.leadName}</strong></div>
                <div><span style={{ fontSize: '11px', color: '#c2410c', display: 'block' }}>Product</span><strong>{activeRetrievalSample.product}</strong></div>
                <div><span style={{ fontSize: '11px', color: '#c2410c', display: 'block' }}>Quantity</span><strong>{activeRetrievalSample.quantity} Pcs</strong></div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Vehicle Registration No *</label><input type="text" required placeholder="e.g. MH-12-PQ-9988" value={retrievalVehicleNo} onChange={e => setRetrievalVehicleNo(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Driver Name *</label><input type="text" required placeholder="e.g. Satish Kumar" value={retrievalDriverName} onChange={e => setRetrievalDriverName(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Driver Mobile *</label><input type="text" required placeholder="e.g. 9876543210" value={retrievalDriverMobile} onChange={e => setRetrievalDriverMobile(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Scheduled Pickup Date *</label><input type="date" required value={retrievalDate} onChange={e => setRetrievalDate(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 24px', fontSize: '14px', fontWeight: '800', width: isMobile ? '100%' : '280px', background: '#ea580c', color: '#fff' }}>Γ£ô Assign Pickup Driver</button>
            </div>
          </form>
        </div>
      );
    }

    // ΓöÇΓöÇ Show inline Dispatch Form ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (activeSampleDispatch) {
      return (
        <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
              ≡ƒÜÜ Dispatch Sample ΓÇö SMP-{String(activeSampleDispatch.id).padStart(3, '0')}
            </h2>
            <button type="button" style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} onClick={() => setActiveSampleDispatch(null)}>Cancel</button>
          </div>

          {/* Reference card */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Customer</span><strong style={{ fontSize: '13.5px' }}>{activeSampleDispatch.leadName}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Product</span><strong style={{ fontSize: '13.5px' }}>{activeSampleDispatch.product}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Quantity</span><strong style={{ fontSize: '13.5px' }}>{activeSampleDispatch.quantity} Pcs</strong></div>
            <div><span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '700' }}>Lead Ref</span><strong style={{ fontSize: '13.5px' }}>LD-{String(activeSampleDispatch.leadId || activeSampleDispatch.id).padStart(3, '0')}</strong></div>
          </div>

          <form onSubmit={handleSampleDispatchFormSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Vehicle No *</label><input type="text" required placeholder="e.g. UK-07-CB-1234" value={sdVehicleNo} onChange={e => setSdVehicleNo(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Driver Name *</label><input type="text" required placeholder="e.g. Ramesh Singh" value={sdDriverName} onChange={e => setSdDriverName(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Courier / Transport *</label><input type="text" required placeholder="e.g. Himalaya Own Fleet / DTDC" value={sdCourier} onChange={e => setSdCourier(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">LR / AWB Number</label><input type="text" placeholder="e.g. LR-2024-00123" value={sdLrAwb} onChange={e => setSdLrAwb(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Dispatch Date *</label><input type="date" required value={sdDispatchDate} onChange={e => setSdDispatchDate(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Transportation Cost (Γé╣)</label><input type="number" min="0" step="0.01" placeholder="e.g. 500.00" value={sdTransportCost} onChange={e => setSdTransportCost(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>

            {/* Dispatch Document Upload */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Dispatch Document (PDF/Image)</label>
              <label style={{ border: `2px dashed ${sdDocPreview ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: sdDocPreview ? '#f0fdf4' : '#F5FAFE', gap: '6px' }}>
                {sdDocPreview ? (
                  sdDocPreview.startsWith('data:image') ? (
                    <img src={sdDocPreview} alt="Doc" style={{ height: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: '700' }}><FileCheck size={16} /> Document uploaded</div>
                  )
                ) : (
                  <><FileText size={22} color="#8893A7" /><span style={{ fontSize: '11.5px', color: '#5E6B82' }}>Click to upload PDF or Image</span></>
                )}
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setSdDocFile(f.name); readFileAsBase64(f, setSdDocPreview); } }} />
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: isMobile ? '1' : 'span 3' }}><label className="form-label">Dispatch Remarks</label><textarea placeholder="Any special instructions or notesΓÇª" value={sdRemarks} onChange={e => setSdRemarks(e.target.value)} className="form-input" rows={2} style={{ resize: 'vertical', color: '#000', background: '#fff' }} /></div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 28px', fontSize: '14px', fontWeight: '800', width: isMobile ? '100%' : '260px' }}>
                ≡ƒÜÜ Confirm Dispatch
              </button>
            </div>
          </form>
        </div>
      );
    }

    // ΓöÇΓöÇ Show inline Delivery Confirmation Form ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (activeSampleDelivery) {
      return (
        <div className="app-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 className="card-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
              ≡ƒôª Confirm Delivery ΓÇö SMP-{String(activeSampleDelivery.id).padStart(3, '0')}
            </h2>
            <button type="button" style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }} onClick={() => setActiveSampleDelivery(null)}>Cancel</button>
          </div>

          {/* Dispatch summary */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div><span style={{ fontSize: '11px', color: '#166534', display: 'block', fontWeight: '700' }}>Customer</span><strong>{activeSampleDelivery.leadName}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#166534', display: 'block', fontWeight: '700' }}>Product</span><strong>{activeSampleDelivery.product}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#166534', display: 'block', fontWeight: '700' }}>Vehicle</span><strong>{activeSampleDelivery.vehicleNo || 'N/A'}</strong></div>
            <div><span style={{ fontSize: '11px', color: '#166534', display: 'block', fontWeight: '700' }}>Dispatched On</span><strong>{activeSampleDelivery.dispatchDate || activeSampleDelivery.dispatch_date || 'N/A'}</strong></div>
          </div>

          <form onSubmit={handleSampleDeliveryFormSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Delivery Date *</label><input type="date" required value={dlDeliveryDate} onChange={e => setDlDeliveryDate(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Receiver Name *</label><input type="text" required placeholder="Person who received sample" value={dlReceiverName} onChange={e => setDlReceiverName(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Receiver Mobile *</label><input type="tel" required placeholder="10-digit mobile" value={dlReceiverMobile} onChange={e => setDlReceiverMobile(e.target.value)} className="form-input" style={{ height: '42px', color: '#000', background: '#fff' }} /></div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: isMobile ? '1' : 'span 3' }}><label className="form-label">Delivery Remarks</label><textarea placeholder="Any delivery notesΓÇª" value={dlRemarks} onChange={e => setDlRemarks(e.target.value)} className="form-input" rows={2} style={{ resize: 'vertical', color: '#000', background: '#fff' }} /></div>

            {/* POD Image ΓÇö MANDATORY */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">≡ƒô╖ Proof of Delivery Image <span style={{ color: '#ef4444' }}>*</span></label>
              <label style={{ border: `2px dashed ${dlPodImagePreview ? '#22c55e' : '#ef4444'}`, borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: dlPodImagePreview ? '#f0fdf4' : '#fff5f5', gap: '6px' }}>
                {dlPodImagePreview ? (
                  <img src={dlPodImagePreview} alt="POD" style={{ height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #bbf7d0' }} />
                ) : (
                  <><FileText size={22} color="#ef4444" /><span style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: '700' }}>MANDATORY ΓÇö Click to upload</span></>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDlPodImage(f.name); readFileAsBase64(f, setDlPodImagePreview); } }} />
              </label>
            </div>

            {/* POD Document ΓÇö Optional */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">≡ƒôä POD Document (PDF/Image) <span style={{ fontSize: '11px', color: '#8893A7' }}>Optional</span></label>
              <label style={{ border: `2px dashed ${dlPodDocPreview ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: dlPodDocPreview ? '#f0fdf4' : '#F5FAFE', gap: '6px' }}>
                {dlPodDocPreview ? (
                  dlPodDocPreview.startsWith('data:image') ? <img src={dlPodDocPreview} alt="POD Doc" style={{ height: '80px', objectFit: 'contain', borderRadius: '6px' }} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: '700' }}><FileCheck size={16} /> Document uploaded</div>
                ) : (
                  <><FileText size={22} color="#8893A7" /><span style={{ fontSize: '11.5px', color: '#5E6B82' }}>Click to upload</span></>
                )}
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDlPodDoc(f.name); readFileAsBase64(f, setDlPodDocPreview); } }} />
              </label>
            </div>

            {/* Signature ΓÇö Optional */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Γ£ì∩╕Å Signature <span style={{ fontSize: '11px', color: '#8893A7' }}>Optional</span></label>
              <label style={{ border: `2px dashed ${dlSignaturePreview ? '#22c55e' : 'var(--color-border)'}`, borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: dlSignaturePreview ? '#f0fdf4' : '#F5FAFE', gap: '6px' }}>
                {dlSignaturePreview ? (
                  <img src={dlSignaturePreview} alt="Signature" style={{ height: '70px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #bbf7d0' }} />
                ) : (
                  <><FileText size={22} color="#8893A7" /><span style={{ fontSize: '11.5px', color: '#5E6B82' }}>Click to upload signature</span></>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDlSignature(f.name); readFileAsBase64(f, setDlSignaturePreview); } }} />
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 28px', fontSize: '14px', fontWeight: '800', width: isMobile ? '100%' : '260px', background: '#16a34a', color: '#fff' }}>
                Γ£ô Confirm Delivery
              </button>
            </div>
          </form>
        </div>
      );
    }

    // ΓöÇΓöÇ Return Dispatch Form View (if active) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (activeReturnDispatchSample) {
      return (
        <div className="app-card" style={{ maxWidth: '850px', margin: '0 auto', padding: '24px', border: '2px solid var(--color-primary)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Return Dispatch Form</h3>
            </div>
            <button type="button" onClick={() => setActiveReturnDispatchSample(null)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Γ£ò Cancel</button>
          </div>

          <div style={{ background: '#F5FAFE', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #DCE5F0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155', fontWeight: '800' }}>Original Sample & Delivery Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div><span style={{ color: '#5E6B82' }}>Sample ID:</span> <strong style={{ color: '#1e293b' }}>SMP-{String(activeReturnDispatchSample.id).padStart(3, '0')}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Lead Ref:</span> <strong style={{ color: '#2563eb' }}>LD-{String(activeReturnDispatchSample.leadId || activeReturnDispatchSample.id).padStart(3, '0')}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Customer:</span> <strong style={{ color: '#1e293b' }}>{activeReturnDispatchSample.leadName || activeReturnDispatchSample.customer || 'ΓÇö'}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Product:</span> <strong style={{ color: '#1e293b' }}>{activeReturnDispatchSample.product}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Quantity:</span> <strong style={{ color: '#1e293b' }}>{activeReturnDispatchSample.quantity} Pcs</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Original Dispatch:</span> <strong style={{ color: '#1e293b' }}>{activeReturnDispatchSample.dispatchDate ? activeReturnDispatchSample.dispatchDate.split('T')[0] : 'ΓÇö'}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Delivery Date:</span> <strong style={{ color: '#16a34a' }}>{activeReturnDispatchSample.deliveredDate ? activeReturnDispatchSample.deliveredDate.split('T')[0] : 'ΓÇö'}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Evaluation End:</span> <strong style={{ color: '#dc2626' }}>{activeReturnDispatchSample.evaluationEndDate ? activeReturnDispatchSample.evaluationEndDate.split('T')[0] : 'ΓÇö'}</strong></div>
            </div>
          </div>

          <form onSubmit={handleReturnDispatchFormSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Return Vehicle Number *</label>
              <input required className="form-input" placeholder="e.g. MH-12-PQ-9988" value={rdVehicleNo} onChange={e => setRdVehicleNo(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Return Driver Name *</label>
              <input required className="form-input" placeholder="e.g. Satish Kumar" value={rdDriverName} onChange={e => setRdDriverName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Driver Phone *</label>
              <input required type="tel" className="form-input" placeholder="e.g. 9876543210" value={rdDriverPhone} onChange={e => setRdDriverPhone(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Courier / Transport *</label>
              <input required className="form-input" placeholder="e.g. Himalaya Own Fleet / DTDC" value={rdCourier} onChange={e => setRdCourier(e.target.value)} />
            </div>
            <div>
              <label className="form-label">LR / AWB Number</label>
              <input className="form-input" placeholder="e.g. LR-2026-8812" value={rdLrAwb} onChange={e => setRdLrAwb(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Return Dispatch Date *</label>
              <input required type="date" className="form-input" value={rdDispatchDate} onChange={e => setRdDispatchDate(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Return Transportation Cost (Γé╣)</label>
              <input type="number" step="0.01" className="form-input" placeholder="e.g. 500.00" value={rdTransportCost} onChange={e => setRdTransportCost(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Return Document (PDF / Image)</label>
              <input type="file" accept="image/*,application/pdf" className="form-input" onChange={e => { const f = e.target.files?.[0]; if (f) { setRdDocFile(f.name); readFileAsBase64(f, setRdDocPreview); } }} />
              {rdDocFile && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>Selected: {rdDocFile}</span>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Return Remarks / Notes</label>
              <textarea rows={2} className="form-input" placeholder="Any return packaging or condition remarks..." value={rdRemarks} onChange={e => setRdRemarks(e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 28px', fontSize: '14px', fontWeight: '800', background: '#ea580c', color: '#fff' }}>
                ≡ƒÜÇ Start Return Transport
              </button>
            </div>
          </form>
        </div>
      );
    }

    // ΓöÇΓöÇ Separate Section Tab Switcher ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const returnSamples = samples.filter(s =>
      ['Return Due', 'Return Requested', 'Return In Transit', 'Returned', 'Evaluation Active'].includes(s.status) ||
      (s.retrievalStatus && s.retrievalStatus !== 'None') ||
      sampleIdParam === s.id
    );

    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px' }}>
          <div>
            <h2 className="card-heading" style={{ margin: 0, fontSize: '20px' }}>Sample Logistics Management</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>Manage sample outgoing dispatches and customer evaluation returns.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => { setSampleSectionTab('dispatch'); setSampleFilter('All'); }}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                background: sampleSectionTab === 'dispatch' ? '#ffffff' : 'transparent',
                color: sampleSectionTab === 'dispatch' ? '#1e293b' : '#5E6B82',
                boxShadow: sampleSectionTab === 'dispatch' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Outgoing Sample Dispatch
            </button>
            <button
              type="button"
              onClick={() => { setSampleSectionTab('returns'); }}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                background: sampleSectionTab === 'returns' ? '#ea580c' : 'transparent',
                color: sampleSectionTab === 'returns' ? '#ffffff' : '#5E6B82',
                boxShadow: sampleSectionTab === 'returns' ? '0 2px 4px rgba(234,88,12,0.3)' : 'none'
              }}
            >
              Sample Returns <span style={{ background: sampleSectionTab === 'returns' ? 'rgba(255,255,255,0.2)' : '#D6E2F0', color: sampleSectionTab === 'returns' ? '#fff' : '#1e293b', padding: '1px 7px', borderRadius: '999px', fontSize: '11px' }}>{returnSamples.length}</span>
            </button>
          </div>
        </div>

        {sampleSectionTab === 'returns' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Return Consignments ({returnSamples.length})</h3>
            </div>
            {returnSamples.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: '#F5FAFE', borderRadius: '12px', color: '#5E6B82' }}>
                No sample returns pending or processed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {returnSamples.map(sample => {
                  const isHighlighted = sampleIdParam === sample.id || (modeParam === 'return' && sampleIdParam === sample.id);
                  const statusLabel = sample.status === 'Evaluation Active' && sample.retrievalStatus === 'Requested' ? 'Return Requested' : (sample.status || 'Return Due');
                  return (
                    <div
                      key={sample.id}
                      id={`return-${sample.id}`}
                      className={`return-card ${isHighlighted ? 'highlighted' : ''}`}
                      style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '16px', color: '#1e293b' }}>SMP-{String(sample.id).padStart(3, '0')}</strong>
                          <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '13px' }}>LD-{String(sample.leadId || sample.id).padStart(3, '0')}</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{sample.leadName || sample.customer || 'Customer'}</span>
                          <span className={`badge badge-${statusLabel.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontWeight: '800' }}>
                            {statusLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#5E6B82', flexWrap: 'wrap' }}>
                          <span>≡ƒôª <strong>{sample.product}</strong> ({sample.quantity} Pcs)</span>
                          <span>Delivered: <strong style={{ color: '#1e293b' }}>{sample.deliveredDate ? sample.deliveredDate.split('T')[0] : 'ΓÇö'}</strong></span>
                          <span>Eval End: <strong style={{ color: '#dc2626' }}>{sample.evaluationEndDate ? sample.evaluationEndDate.split('T')[0] : 'ΓÇö'}</strong></span>
                          {sample.returnVehicleNo && <span>Return Vehicle: <strong style={{ color: '#1e293b' }}>{sample.returnVehicleNo}</strong></span>}
                          {sample.returnedDate && <span>Returned On: <strong style={{ color: '#16a34a' }}>{sample.returnedDate.split('T')[0]}</strong></span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                        {sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved' ? (
                          <span className="badge badge-returned" style={{ padding: '8px 14px', fontSize: '13px' }}>
                            Γ£ô Sample Returned
                          </span>
                        ) : sample.status === 'Return In Transit' || sample.retrievalStatus === 'In Transit' ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmReturnClick(sample)}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', boxShadow: '0 2px 4px rgba(22,163,74,0.2)' }}
                          >
                            <FileCheck size={16} /> Confirm Sample Returned
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setActiveReturnDispatchSample(sample); setRdDispatchDate(new Date().toISOString().split('T')[0]); }}
                            style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', boxShadow: '0 2px 4px rgba(234,88,12,0.2)' }}
                          >
                            <Truck size={16} /> Start Return Transport
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <DataTable
              columns={[
                { header: 'Sample ID', accessor: 'id', render: row => <strong>SMP-{String(row.id).padStart(3, '0')}</strong> },
                { header: 'Lead Ref', accessor: 'leadId', render: row => <span style={{ color: '#2563eb', fontWeight: '700' }}>LD-{String(row.leadId || row.id).padStart(3, '0')}</span> },
                { header: 'Customer', accessor: 'leadName' },
                { header: 'Product', accessor: 'product' },
                { header: 'Qty', accessor: 'quantity', render: row => `${row.quantity} Pcs` },
                { header: 'Sales Person', accessor: 'salesPerson', render: row => row.salesPerson || row.createdBy || 'ΓÇö' },
                {
                  header: 'Status',
                  accessor: 'dispatchStatus',
                  render: row => {
                    const st = row.dispatchStatus || (row.dispatchDate ? 'In Transit' : 'Pending Dispatch');
                    const colors = {
                      'Pending Dispatch': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
                      'In Transit': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                      'Delivered': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
                    };
                    const c = colors[st] || { bg: '#f1f5f9', color: '#475569', border: '#DCE5F0' };
                    return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11.5px', whiteSpace: 'nowrap' }}>{st}</span>;
                  }
                },
                {
                  header: 'Transport Cost',
                  accessor: 'transportCost',
                  render: row => {
                    const cost = row.transportCost ?? row.transport_cost;
                    if (!cost || Number(cost) === 0) return <span style={{ color: '#8893A7', fontSize: '12px' }}>ΓÇö</span>;
                    return <span style={{ fontWeight: '700', color: '#059669' }}>Γé╣{Number(cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
                  }
                },
              ]}
              data={filteredSamples.filter(s => sampleFilter === 'All' || (s.dispatchStatus || (s.dispatchDate ? 'In Transit' : 'Pending Dispatch')) === sampleFilter)}
              searchQuery={globalSearch}
              searchField="leadName"
              actions={row => {
                const ds = row.dispatchStatus || (row.dispatchDate ? 'In Transit' : 'Pending Dispatch');
                if (ds === 'Pending Dispatch') {
                  return (
                    <button
                      className="action-btn"
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => { setActiveSampleDispatch(row); setSdDispatchDate(new Date().toISOString().split('T')[0]); }}
                    >
                      <Truck size={13} /> Dispatch
                    </button>
                  );
                }
                if (ds === 'In Transit') {
                  return (
                    <button
                      className="action-btn"
                      style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => { setActiveSampleDelivery(row); setDlDeliveryDate(new Date().toISOString().split('T')[0]); }}
                    >
                      <FileCheck size={13} /> Confirm Delivery
                    </button>
                  );
                }
                return <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12.5px' }}>Γ£ô Delivered</span>;
              }}
              emptyMessage="No sample dispatch requests found."
            />
          </div>
        )}
      </div>
    );
  };

  const renderDelivery = () => {
    // Cross-reference dispatches store to get vehicle/driver details
    const activeTransit = filteredOrders
      .filter(o => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'Out for Delivery', 'In Transit'].includes(o.status || o.workflowStatus))
      .map(o => {
        // Find the matching dispatch record by orderNo or orderId
        const dispatchRecord = (dispatches || []).find(d =>
          String(d.orderNo || '') === String(o.orderNo || '') ||
          String(d.orderId || '') === String(o.id || '') ||
          String(d.orderId || '') === String(o.orderNo || '')
        );
        // Resolve customer name from order
        const customerName = o.customerName || o.customer_name || o.customer?.name || o.companyName || 'ΓÇö';
        // Resolve product from order
        const rawItems = Array.isArray(o.detailedItems) && o.detailedItems.length ? o.detailedItems : (Array.isArray(o.items) ? o.items : []);
        const pNames = rawItems.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ');
        const productName = o.products || o.productItem || o.productName || pNames || 'ΓÇö';
        // Quantity
        const rawQty = o.availableQuantity || o.quantity || o.estimatedQuantity || 0;
        const quantity = typeof rawQty === 'string' ? parseFloat(rawQty.replace(/[^0-9.]/g, '')) || 0 : rawQty || 0;

        return {
          id: dispatchRecord?.id || dispatchRecord?.dispatchId || `ORDER-${String(o.orderNo || o.id).replace(/\D/g, '')}1`,
          orderNo: o.orderNo || o.id,
          customerName,
          productName,
          vehicleNo: dispatchRecord?.vehicleNo || dispatchRecord?.vehicle_number || o.vehicleNumber || 'ΓÇö',
          driverName: dispatchRecord?.driverName || dispatchRecord?.driver_name || o.driverName || 'ΓÇö',
          driverMobile: dispatchRecord?.driverMobile || o.driverMobile || 'ΓÇö',
          quantity,
          status: o.status || o.workflowStatus,
          deliveryAddress: o.deliveryAddress || o.delivery_address || 'ΓÇö',
          expectedDeliveryDate: o.expectedDeliveryDate || dispatchRecord?.expectedDeliveryDate || 'ΓÇö',
          _order: o,
          _dispatch: dispatchRecord
        };
      });
    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Active In-Transit Shipments</h2>
        </div>
        <DataTable
          columns={[
            { header: 'Consignment Ref', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{row.id}</strong> },
            {
              header: 'Order Ref', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/orders/${row.orderNo}`)}
                >
                  {row.orderNo}
                </span>
              )
            },
            {
              header: 'Customer', accessor: 'customerName', render: (row) => {
                const order = orders.find(o => o.orderNo === row.orderNo);
                return <span style={{ fontWeight: '600' }}>{order?.customerName || order?.customer?.name || row.customerName || 'ΓÇö'}</span>;
              }
            },
            {
              header: 'Product', accessor: 'productName', render: (row) => {
                const order = orders.find(o => o.orderNo === row.orderNo);
                const rawItems = Array.isArray(order?.detailedItems) && order.detailedItems.length ? order.detailedItems : (Array.isArray(order?.items) ? order.items : []);
                const pNames = rawItems.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ');
                return <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{order?.products || row.productName || pNames || 'ΓÇö'}</span>;
              }
            },
            {
              header: 'Vehicle No', accessor: 'vehicleNo', render: (row) => (
                <span style={{ fontFamily: 'monospace', fontWeight: '700', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                  {row.vehicleNo || 'ΓÇö'}
                </span>
              )
            },
            {
              header: 'Driver', accessor: 'driverName', render: (row) => (
                <div>
                  <div style={{ fontWeight: '600' }}>{row.driverName || 'ΓÇö'}</div>
                  {row.driverMobile && row.driverMobile !== 'ΓÇö' && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>≡ƒô₧ {row.driverMobile}</div>
                  )}
                </div>
              )
            },
            {
              header: 'Cargo Weight', accessor: 'quantity', render: (row) => {
                const parsedQty = typeof row.quantity === 'string' ? parseFloat(row.quantity.replace(/[^0-9.]/g, '')) || 0 : row.quantity || 0;
                return <strong>{parsedQty.toLocaleString()} Tons</strong>;
              }
            },
            {
              header: 'Delivery Address', accessor: 'deliveryAddress', render: (row) => {
                const order = orders.find(o => o.orderNo === row.orderNo);
                const addr = order?.deliveryAddress || row.deliveryAddress;
                return <span style={{ fontSize: '12px', maxWidth: '160px', display: 'block' }}>{addr || 'ΓÇö'}</span>;
              }
            },
            {
              header: 'Exp. Delivery', accessor: 'expectedDeliveryDate', render: (row) => {
                const order = orders.find(o => o.orderNo === row.orderNo);
                const date = order?.expectedDeliveryDate || row.expectedDeliveryDate;
                return <span style={{ whiteSpace: 'nowrap', fontSize: '12.5px' }}>{date || 'ΓÇö'}</span>;
              }
            },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={activeTransit}
          searchQuery={globalSearch}
          searchField="orderNo"
          actions={(row) => (
            <button
              className="action-btn"
              style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => {
                setSelectedDispatchForDelivery(row);
                setShowDeliveryModal(true);
              }}
            >
              <FileCheck size={12} /> Complete Delivery
            </button>
          )}
          emptyMessage="No active shipments currently en route."
        />
      </div>
    );
  };

  const renderInTransit = () => {
    const departureStatuses = ['DISPATCH_PENDING', 'DISPATCH_CREATED', 'CREATED', 'PLANNED', 'IN_TRANSIT'];
    const normalizeDispatchStatus = value => String(value || '').trim().toUpperCase().replaceAll(' ', '_');
    const isDepartureStatus = (...values) => values.some(value => departureStatuses.includes(normalizeDispatchStatus(value)));
    const orderDispatches = filteredOrders
      .filter(o => isDepartureStatus(o.status, o.workflowStatus, o.dispatchStatus, o.dispatch?.status))
      .map(o => ({
        ...o.dispatch,
        id: o.dispatch?.id || o.dispatch?.dispatchId || o.dispatch?.dispatch_number || o.id,
        orderNo: o.orderNo || o.order_no || o.public_id || o.id,
        customerName: o.customerName || o.customer_name || o.customer?.name || 'Not recorded',
        vehicleNo: o.dispatch?.vehicleNo || o.dispatch?.vehicle_number || '-',
        driverName: o.dispatch?.driverName || o.dispatch?.driver_name || '-',
        quantity: o.dispatch?.dispatchQty || o.dispatch?.quantity || o.quantity || 0,
        status: o.status || o.workflowStatus || o.dispatch?.status || 'Dispatch Pending'
      }));
    const existingDispatchIds = new Set(orderDispatches.map(row => String(row.id)));
    const standaloneDispatches = dispatches
      .filter(d => isDepartureStatus(d.status, d.dispatchStatus, d.dispatch_status) && !existingDispatchIds.has(String(d.id || d.dispatchId || d.dispatch_number)))
      .map(d => {
        const linkedOrder = filteredOrders.find(o => String(o.id) === String(d.orderId || d.order_id) || String(o.orderNo || o.order_no) === String(d.orderNo || d.order_number));
        const items = d.dispatchItems || d.items || [];
        return {
          ...d,
          id: d.id || d.dispatchId || d.dispatch_number,
          orderNo: d.orderNo || d.order_number || linkedOrder?.orderNo || linkedOrder?.order_no || `ORD-${d.orderId || d.order_id}`,
          customerName: d.customerName || d.customer_name || linkedOrder?.customerName || linkedOrder?.customer_name || linkedOrder?.customer?.name || 'Not recorded',
          vehicleNo: d.vehicleNo || d.vehicle_number || '-',
          driverName: d.driverName || d.driver_name || '-',
          quantity: Number(d.quantity || d.totalQuantity || d.total_quantity) || items.reduce((sum, item) => sum + (Number(item.qty || item.quantity) || 0), 0),
          status: d.status || d.dispatchStatus || d.dispatch_status || 'Dispatch Pending'
        };
      });
    const activeDispatches = [...orderDispatches, ...standaloneDispatches];
    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Outbound Vehicle Departure Control</h2>
        </div>
        <DataTable
          columns={[
            { header: 'Consignment Ref', accessor: 'id', render: (row) => <strong style={{ color: '#000000' }}>{row.id}</strong> },
            {
              header: 'Order Ref', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/orders/${row.orderNo}`)}
                >
                  {row.orderNo}
                </span>
              )
            },
            {
              header: 'Customer', accessor: 'customerName', render: (row) => {
                const order = orders.find(o => o.orderNo === row.orderNo);
                return order?.customer?.name || row.customerName || 'N/A';
              }
            },
            { header: 'Vehicle No', accessor: 'vehicleNo' },
            { header: 'Driver Name', accessor: 'driverName' },
            {
              header: 'Cargo Volume', accessor: 'quantity', render: (row) => {
                const qty = row.quantity > 0 ? row.quantity : (orders.find(o => o.orderNo === row.orderNo)?.quantity || 0);
                return `${qty} Tons`;
              }
            },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={activeDispatches}
          searchQuery={globalSearch}
          searchField="orderNo"
          actions={(row) => (
            <button
              className="action-btn"
              style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleDepartVehicle(row.id)}
            >
              <Truck size={12} /> Start Delivery
            </button>
          )}
          emptyMessage="No dispatches currently ready for departure."
        />
      </div>
    );
  };

  const renderRemainingDispatch = () => {
    const remainingOrders = qcPassed;

    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="card-heading" style={{ margin: 0 }}>Remaining Dispatch Outstanding Ledger</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              All QC Passed or Partially Delivered cargo orders currently awaiting logistics fulfillment
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {selectedOrderNos.length > 0 && (
              <button
                type="button"
                className="action-btn"
                style={{
                  background: 'var(--color-primary)',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => navigate.push('/dispatch/create-dispatch')}
              >
                <Truck size={14} /> Dispatch Selected ({selectedOrderNos.length})
              </button>
            )}
            <button
              type="button"
              className="action-btn"
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #D6E2F0', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => navigate.push('/dispatch/history')}
            >
              Go to Dispatch History
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            {
              header: (
                <input
                  type="checkbox"
                  checked={remainingOrders.length > 0 && remainingOrders.every(o => selectedOrderNos.includes(o.orderNo))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrderNos(remainingOrders.map(o => o.orderNo));
                    } else {
                      setSelectedOrderNos([]);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              ),
              accessor: 'checkbox',
              render: (row) => (
                <input
                  type="checkbox"
                  checked={selectedOrderNos.includes(row.orderNo)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrderNos(prev => [...prev, row.orderNo]);
                    } else {
                      setSelectedOrderNos(prev => prev.filter(no => no !== row.orderNo));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              )
            },
            {
              header: 'Order No', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/dispatch/partial/${row.orderNo}`)}
                >
                  {row.orderNo}
                </span>
              )
            },
            { header: 'Customer Name', accessor: 'customerName', render: (row) => row.customerName || row.customer_name || row.customer?.name || row.companyName || 'ΓÇö' },
            {
              header: 'Product Item', accessor: 'products', render: (row) => {
                const rawItems = Array.isArray(row.detailedItems) && row.detailedItems.length ? row.detailedItems : (Array.isArray(row.items) ? row.items : []);
                const pNames = rawItems.map(item => item.productName || item.product_name || item.name).filter(Boolean).join(', ');
                return row.products || row.productItem || row.productName || pNames || 'ΓÇö';
              }
            },
            {
              header: 'Ordered', accessor: 'quantity', render: (row) => {
                const qty = row.quantity || row.estimatedQuantity || row.total_tonnage || 0;
                const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                return `${(parsedQty || 0).toLocaleString()} Tons`;
              }
            },
            {
              header: 'Dispatched', accessor: 'dispatch.completed', render: (row) => {
                const qty = row.dispatch?.completed || 0;
                const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                return `${(parsedQty || 0).toLocaleString()} Tons`;
              }
            },
            {
              header: 'Remaining Outstanding', accessor: 'dispatch.remaining', render: (row) => {
                const qty = row.dispatch?.remaining ?? (row.quantity || row.estimatedQuantity || row.total_tonnage || 0);
                const parsedQty = typeof qty === 'string' ? parseFloat(qty.replace(/[^0-9.]/g, '')) : qty;
                return (
                  <strong style={{ color: '#0369a1' }}>
                    {(parsedQty || 0).toLocaleString()} Tons
                  </strong>
                );
              }
            }
          ]}
          data={remainingOrders}
          searchQuery={globalSearch}
          searchField="customer.name"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setSelectedOrderNos([row.orderNo]);
                  navigate.push('/dispatch/create-dispatch');
                }}
              >
                <Truck size={14} /> Dispatch Now
              </button>
              <button
                className="action-btn"
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #D6E2F0', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => navigate.push(`/dispatch/partial/${row.orderNo}`)}
              >
                <ClipboardList size={14} /> Track Partial
              </button>
            </div>
          )}
          emptyMessage="No pending orders awaiting dispatch. Everything has been dispatched."
        />
      </div>
    );
  };

  const handleSingleDispatchSubmit = async (e) => {
    e.preventDefault();

    const order = orders.find(o => o.orderNo === orderId);
    if (!order) return;

    const remaining = order.dispatch?.remaining ?? order.quantity;
    const qtyVal = Number(singleDispatchQty);

    if (isNaN(qtyVal) || qtyVal <= 0) {
      showToast('Please enter a valid positive quantity.');
      return;
    }

    if (qtyVal > remaining) {
      Swal.fire({
        icon: 'error',
        title: 'Dispatch Limit Exceeded',
        text: `Cannot dispatch ${qtyVal} Tons. Remaining capacity is ${remaining} Tons.`
      });
      return;
    }

    Swal.fire({
      title: 'Confirm Partial Dispatch?',
      text: `Are you sure you want to book a dispatch of ${qtyVal} Tons for Order ${order.orderNo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Book Dispatch',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        showToast("Booking partial dispatch shipment...");

        const dispatchRecordData = {
          vehicleNo: singleVehicleNo,
          driverName: singleDriverName,
          driverMobile: singleDriverMobile || '9988776655',
          transporter: 'Himalaya Own Fleet',
          transportCost: Number(singleTransportCost || 0),
          lrNumber: `LR-${Math.floor(100000 + Math.random() * 900000)}`,
          ewayBill: `EWB-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          dispatchItems: [
            {
              orderId: order.orderNo,
              orderNo: order.orderNo,
              qty: qtyVal
            }
          ]
        };

        try {
          const res = await dispatchService.createDispatch(
            state,
            dispatchRecordData,
            dispatch,
            user
          );

          if (res.success) {
            syncData();
            setSingleDispatchQty('');
            setSingleVehicleNo('');
            setSingleDriverName('');
            setSingleDriverMobile('');
            setSingleTransportCost('0');

            showToast("Successfully processed partial dispatch consignment!");
            navigate.push('/dispatch/in-transit');
          } else {
            Swal.fire({ icon: 'error', title: 'Dispatch Booking Failed', text: res.error?.message || res.error });
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Dispatch Booking Exception', text: err.message || String(err) });
        }
      }
    });
  };

  const renderPartialDispatch = () => {
    const order = orders.find(o => o.orderNo === orderId);
    if (!order) {
      return (
        <div className="app-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Order Reference Not Found</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>No active order matching "{orderId}" was found.</p>
          <button className="form-submit-btn" style={{ maxWidth: '200px', margin: '20px auto 0' }} onClick={() => navigate.push('/dispatch/orders')}>
            Back to Orders
          </button>
        </div>
      );
    }

    const orderedQty = order.quantity;
    const dispatchedQty = order.dispatch?.completed || 0;
    const remainingQty = order.dispatch?.remaining ?? order.quantity;

    // Filter history of dispatches for this order
    const linkedDispatches = filteredOrders.filter(o => o.orderNo === order.orderNo && o.dispatch).map(o => ({
      ...o.dispatch,
      id: o.dispatch?.id || o.id,
      date: o.dispatch?.dispatchDate || o.updatedAt,
      dispatchItems: [{ orderNo: o.orderNo, qty: o.dispatch?.dispatchQty || o.dispatch?.quantity || o.quantity }]
    }));

    const historyList = linkedDispatches.map(d => {
      const item = d.dispatchItems.find(di => di.orderNo === order.orderNo);
      return {
        id: d.id,
        date: d.date || new Date(d.createdAt).toISOString().split('T')[0],
        qty: Number(item?.qty || 0),
        vehicleNo: d.vehicleNo,
        driverName: d.driverName,
        status: d.status
      };
    }).sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Header Section */}
        <div className="app-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-accent-teal)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Single Order Dispatch Tracking Dashboard
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--color-text-primary)' }}>
                Order ID: {order.orderNo}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0', fontWeight: '600' }}>
                Item: {order.products || 'Aggregates & Supplies'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate.push('/dispatch/orders')}
              style={{
                background: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5FAFE'; e.currentTarget.style.borderColor = '#8893A7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              ΓåÉ Back to Active Orders
            </button>
          </div>
        </div>

        {/* Main Tonnage Statistics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="app-card" style={{ borderLeft: '4px solid var(--color-text-secondary)' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Ordered Quantity</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 0 0' }}>{orderedQty.toLocaleString()} Tons</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Total contracted volume</p>
          </div>
          <div className="app-card" style={{ borderLeft: '4px solid var(--color-orange-dot)' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Total Dispatched</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', margin: '8px 0 0 0' }}>{dispatchedQty.toLocaleString()} Tons</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Cumulative dispatched so far</p>
          </div>
          <div className="app-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Remaining Quantity</span>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0369a1', margin: '8px 0 0 0' }}>{remainingQty.toLocaleString()} Tons</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Balance volume remaining</p>
          </div>
        </div>

        {/* Existing Dispatch Summary Table (Match requested style) */}
        <div className="app-card">
          <h3 className="card-heading" style={{ marginBottom: '16px' }}>Order Dispatch Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Order ID</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Ordered</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Dispatched</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 12px', fontSize: '13.5px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{order.orderNo}</td>
                  <td style={{ padding: '14px 12px', fontSize: '13.5px', color: 'var(--color-text-primary)', textAlign: 'right', fontWeight: '600' }}>{orderedQty.toLocaleString()} T</td>
                  <td style={{ padding: '14px 12px', fontSize: '13.5px', color: '#b45309', textAlign: 'right', fontWeight: '700' }}>{dispatchedQty.toLocaleString()} T</td>
                  <td style={{ padding: '14px 12px', fontSize: '13.5px', color: '#0369a1', textAlign: 'right', fontWeight: '800' }}>{remainingQty.toLocaleString()} T</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Action and History Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '20px' }}>

          {/* Dispatch More Form Section */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '16px', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '8px' }}>
              Dispatch More Quantity
            </h3>

            {remainingQty <= 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', textAlign: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>≡ƒÄë</span>
                <h4 style={{ fontWeight: '800', margin: 0 }}>Fulfillment Complete</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', maxWidth: '280px', margin: 0 }}>
                  This order has been fully dispatched. No outstanding quantities remain.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSingleDispatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Enter Quantity to Dispatch (Tons)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={remainingQty}
                    step="any"
                    placeholder="e.g. 1000"
                    value={singleDispatchQty}
                    onChange={(e) => setSingleDispatchQty(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', color: '#000', background: '#fff' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                    Max Allowed: {remainingQty.toLocaleString()} Tons
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Vehicle Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-PQ-9988"
                    value={singleVehicleNo}
                    onChange={(e) => setSingleVehicleNo(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', color: '#000', background: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Satish Kumar"
                    value={singleDriverName}
                    onChange={(e) => setSingleDriverName(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', color: '#000', background: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Driver Contact Mobile</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={singleDriverMobile}
                    onChange={(e) => setSingleDriverMobile(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', color: '#000', background: '#fff' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Estimated Freight Charge (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={singleTransportCost === '0' ? '' : singleTransportCost}
                    onChange={(e) => setSingleTransportCost(e.target.value)}
                    className="form-input"
                    style={{ height: '42px', color: '#000', background: '#fff' }}
                  />
                </div>

                <button
                  type="submit"
                  className="form-submit-btn"
                  style={{ margin: '8px 0 0 0', height: '44px', fontWeight: '800', width: '100%' }}
                >
                  Γ£ô Dispatch Now
                </button>
              </form>
            )}
          </div>

          {/* Dispatch History List Section */}
          <div className="app-card">
            <h3 className="card-heading" style={{ marginBottom: '16px', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '8px' }}>
              Dispatch History
            </h3>

            {historyList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                No prior dispatches recorded for this order.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                {historyList.map(h => (
                  <div key={h.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#F5FAFE',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        {h.qty.toLocaleString()} Tons
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        ID: <strong style={{ color: '#000' }}>{h.id}</strong> | Vehicle: {h.vehicleNo}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', display: 'block' }}>
                        {h.date}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: '800',
                        background: h.status === 'Delivered' ? '#d1fae5' : h.status === 'In Transit' ? '#dbeafe' : '#fef3c7',
                        color: h.status === 'Delivered' ? '#065f46' : h.status === 'In Transit' ? '#1e40af' : '#92400e',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginTop: '4px'
                      }}>
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  const handleShipReplacement = async (row) => {
    const today = new Date().toISOString().slice(0, 10);
    const { value } = await Swal.fire({
      title: `Ship ${row.request_no}`,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; font-size:13px;">
          <label style="font-weight:800;">Vehicle</label>
          <input id="rep-vehicle" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">LR Number</label>
          <input id="rep-lr" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">Driver</label>
          <input id="rep-driver" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">Transport</label>
          <input id="rep-transport" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">Dispatch Date</label>
          <input id="rep-dispatch-date" type="date" value="${today}" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">Expected Delivery</label>
          <input id="rep-expected-date" type="date" class="swal2-input" style="margin:0; width:100%;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ship',
      preConfirm: () => ({
        dispatchStatus: 'DISPATCHED',
        vehicleNumber: document.getElementById('rep-vehicle').value.trim(),
        lrNumber: document.getElementById('rep-lr').value.trim(),
        driverName: document.getElementById('rep-driver').value.trim(),
        transportCompany: document.getElementById('rep-transport').value.trim(),
        dispatchDate: document.getElementById('rep-dispatch-date').value,
        expectedDeliveryDate: document.getElementById('rep-expected-date').value || null
      })
    });
    if (!value) return;
    await backendFetch(`/api/backend/replacements/${row.id}/dispatch`, { method: 'PATCH', body: value });
    showToast?.('Replacement dispatched.');
    fetchReplacementDispatches();
  };

  const handleDeliverReplacement = async (row) => {
    const { value } = await Swal.fire({
      title: `Deliver ${row.request_no}`,
      html: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div id="upload-area" style="border: 2px dashed var(--color-border); border-radius: 8px; padding: 32px; text-align: center; cursor: pointer; position: relative; transition: all 0.2s ease; background: var(--color-background-subtle);">
            <input id="rep-pod" type="file" accept="image/jpeg,image/png,image/webp" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" />
            
            <div id="upload-placeholder" style="display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-secondary);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <div style="font-size: 14px; font-weight: 600; color: var(--color-text-primary);">Click to upload delivery proof</div>
              <div style="font-size: 12px; color: var(--color-text-secondary);">JPG, PNG or WebP (max. 5MB)</div>
            </div>
            
            <img id="upload-preview" src="" style="display: none; max-width: 100%; max-height: 200px; border-radius: 4px; margin: 0 auto; object-fit: contain; pointer-events: none;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Delivery',
      didOpen: () => {
        const input = document.getElementById('rep-pod');
        const preview = document.getElementById('upload-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const area = document.getElementById('upload-area');
        
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const url = URL.createObjectURL(file);
            preview.src = url;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            area.style.padding = '8px';
            area.style.borderStyle = 'solid';
            area.style.borderColor = 'var(--color-primary)';
          } else {
            preview.src = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            area.style.padding = '32px';
            area.style.borderStyle = 'dashed';
            area.style.borderColor = 'var(--color-border)';
          }
        });
      },
      preConfirm: () => {
        const proofFile = document.getElementById('rep-pod').files?.[0];
        if (!proofFile) {
          Swal.showValidationMessage('Delivery proof image is required.');
          return false;
        }
        return { proofFile };
      }
    });
    if (!value) return;
    try {
      const upload = new FormData();
      upload.append('file', value.proofFile);
      upload.append('category', 'pod');
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: upload });
      if (!uploadResponse.ok) throw new Error((await uploadResponse.json()).message || 'Delivery proof upload failed');
      const uploaded = await uploadResponse.json();
      await backendFetch(`/api/backend/replacements/${row.id}/deliver`, {
        method: 'PATCH',
        body: { ...value, proofFile: undefined, proofUrl: uploaded.url },
      });
      showToast?.('Replacement delivered.');
      fetchReplacementDispatches();
    } catch (err) {
      console.error('Delivery confirmation failed:', err);
      showToast?.(err?.message || 'Failed to confirm delivery.');
    }
  };

  const handleStartReplacementDelivery = async (row) => {
    try {
      await backendFetch(`/api/backend/replacements/${row.id}/in-transit`, {
        method: 'PATCH',
      });
      showToast?.('Replacement delivery started.');
      fetchReplacementDispatches();
      navigate.push('/dispatch/replacements?status=delivered');
    } catch (err) {
      console.error('Failed to start replacement delivery', err);
      showToast?.(err?.message || 'Failed to start replacement delivery.');
    }
  };

  const renderReplacementDispatch = () => {
    const replacementFilter = dispatchStatusParam || 'pending';
    const filteredReplacementDispatches = replacementDispatches.filter(row => {
      if (replacementFilter === 'all') return true;
      const status = String(row.dispatch_status || row.status || '').toUpperCase().replace(/[_-]/g, ' ');
      if (replacementFilter === 'delivered') return status === 'IN TRANSIT' || status === 'DELIVERED';
      if (replacementFilter === 'in-transit') return status === 'DISPATCHED' || status === 'IN TRANSIT' || status === 'APPROVED' || status === 'READY FOR DISPATCH';
      return status !== 'DISPATCHED' && status !== 'IN TRANSIT' && status !== 'DELIVERED';
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Replacement Dispatch</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Ship approved replacements and confirm delivery.</p>
        </div>
        <div className="app-card" style={{ padding: '18px' }}>
          {replacementLoading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading replacement dispatch queue...</p>
          ) : (
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Replacement No</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReplacementDispatches.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: 'var(--color-text-muted)' }}>No approved replacement dispatches found.</td></tr>
                  ) : filteredReplacementDispatches.map(row => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{row.request_no}</td>
                      <td>{row.order_number}</td>
                      <td>{row.customer_name}</td>
                      <td>{row.product_name}</td>
                      <td>{row.approved_qty}</td>
                      <td>{row.vehicle_number || '-'}</td>
                      <td><StatusBadge status={row.dispatch_status || row.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {replacementFilter === 'pending' && !['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(row.dispatch_status) && (
                            <button className="btn-small btn-outline-small" onClick={() => handleShipReplacement(row)}>Create Dispatch</button>
                          )}
                          {replacementFilter === 'in-transit' && ['DISPATCHED', 'APPROVED', 'READY_FOR_DISPATCH'].includes(row.dispatch_status) && (
                            <button className="btn-small btn-outline-small" onClick={() => handleStartReplacementDelivery(row)}>Start Delivery</button>
                          )}
                          {replacementFilter === 'delivered' && row.dispatch_status === 'IN_TRANSIT' && (
                            <button className="btn-small btn-outline-small" onClick={() => handleDeliverReplacement(row)}>Confirm Delivery</button>
                          )}
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

  const renderFinishedGoods = () => {
    const handleCreateDispatchFromFG = async (fg) => {
      const { value: formValues } = await Swal.fire({
        title: `Create Consignment — ${fg.jobNo || fg.workOrderId || fg.id}`,
        html: `
          <div style="text-align:left;display:flex;flex-direction:column;gap:12px;padding:8px 0">
            <label style="font-size:13px;font-weight:700;color:#475569">Product</label>
            <input class="swal2-input" value="${fg.productName || 'Finished Product'}" readonly style="margin:0;background:#f8fafc;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Available Quantity</label>
            <input class="swal2-input" value="${fg.availableQuantity ?? fg.quantity ?? 1} ${fg.unit || 'Pcs'}" readonly style="margin:0;background:#f8fafc;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Vehicle Number</label>
            <input id="swal-vehicle" class="swal2-input" placeholder="e.g. UK-07-1234" style="margin:0;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Driver Name</label>
            <input id="swal-driver" class="swal2-input" placeholder="e.g. Ramesh Kumar" style="margin:0;font-size:14px" />
            <label style="font-size:13px;font-weight:700;color:#475569">Driver Mobile</label>
            <input id="swal-mobile" class="swal2-input" placeholder="e.g. 9876543210" style="margin:0;font-size:14px" />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Create Dispatch',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const vehicleNumber = document.getElementById('swal-vehicle').value.trim();
          const driverName = document.getElementById('swal-driver').value.trim();
          const driverMobile = document.getElementById('swal-mobile').value.trim();
          if (!vehicleNumber || !driverName) {
            Swal.showValidationMessage('Vehicle number and driver name are required.');
            return false;
          }
          return { vehicleNumber, driverName, driverMobile };
        }
      });
      if (!formValues) return;
      try {
        const payload = {
          workOrderId: fg.workOrderId || fg.id,
          vehicleNumber: formValues.vehicleNumber,
          driverName: formValues.driverName,
          driverMobile: formValues.driverMobile,
          quantity: fg.availableQuantity ?? fg.quantity ?? 1,
        };
        await backendFetch('/api/backend/logistics/dispatches', {
          method: 'POST',
          body: payload,
        });
        await Swal.fire({ icon: 'success', title: 'Dispatch Created', text: `Consignment created successfully for ${fg.jobNo || fg.productName}.`, timer: 1500, showConfirmButton: false });
        fetchDashboardData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to create dispatch' });
      }
    };

    const totalQty = backendFinishedGoods.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const availableQty = backendFinishedGoods.reduce((sum, item) => sum + Number(item.availableQuantity ?? item.quantity ?? 0), 0);
    const totalBatches = backendFinishedGoods.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
              <Box size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{totalQty.toLocaleString()}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Total Finished Stock Qty</div>
            </div>
          </div>

          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{availableQty.toLocaleString()}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Ready for Dispatch Qty</div>
            </div>
          </div>

          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8ff', color: '#7e22ce', display: 'grid', placeItems: 'center' }}>
              <FileCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{totalBatches}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>QC Approved Product Batches</div>
            </div>
          </div>
        </div>

        {/* Finished Goods Inventory Table */}
        <div className="app-card">
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading" style={{ margin: 0 }}>Finished Goods Staging Inventory</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                All completed manufacturing products ready in warehouse staging for transport allocation.
              </p>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'WO Number', accessor: 'jobNo', render: (row) => <strong>{row.jobNo || row.workOrderId || 'WO-STOCK'}</strong> },
              { header: 'Product Name', accessor: 'productName', render: (row) => <div><strong>{row.productName || 'Finished Product'}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{row.productCode || 'FG-STOCK'}</span></div> },
              { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || 'Factory Staging' },
              { header: 'Total Quantity', accessor: 'quantity', render: (row) => <span>{row.quantity} {row.unit || 'Pcs'}</span> },
              { header: 'Dispatchable Quantity', accessor: 'availableQuantity', render: (row) => <strong style={{ color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>{row.availableQuantity ?? row.quantity} {row.unit || 'Pcs'}</strong> },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'AVAILABLE'} /> },
            ]}
            data={backendFinishedGoods}
            searchQuery={globalSearch}
            searchField="productName"
            actions={(row) => (
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary, #0f172a)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleCreateDispatchFromFG(row)}
              >
                <Truck size={14} /> Allocate &amp; Dispatch
              </button>
            )}
            emptyMessage="No finished goods currently in staging inventory."
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'finished-goods' && renderFinishedGoods()}
      {currentView === 'orders' && renderOrders()}
      {currentView === 'create-dispatch' && renderCreateDispatch()}
      {currentView === 'in-transit' && renderInTransit()}
      {currentView === 'delivery' && renderDelivery()}
      {currentView === 'history' && renderDispatchHistory()}
      {currentView === 'sample-dispatch' && renderSampleDispatch()}
      {currentView === 'replacements' && renderReplacementDispatch()}
      {currentView === 'returns' && <ReturnsPortal />}
      {currentView === 'reports' && renderReports()}
      {currentView === 'partial' && renderPartialDispatch()}
      {currentView === 'remaining' && renderRemainingDispatch()}

      {/* Delivery Proof modal */}
      {showDeliveryModal && selectedDispatchForDelivery && (
        <div className="modal-overlay active" onClick={closeDeliveryModal} style={{ zIndex: 10000 }}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              background: '#ffffff',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--color-accent-teal)" />
                Reach Destination & Upload Bill Photo
              </h3>
              <button
                onClick={closeDeliveryModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5E6B82',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#DCE5F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Delivering Consignment
              </span>
              <span style={{ fontSize: '13.5px', color: '#14532d', fontWeight: '800' }}>
                {selectedDispatchForDelivery.id}
              </span>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                Order Ref: {selectedDispatchForDelivery.orderNo}
              </span>
            </div>

            <form onSubmit={handleDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--color-text-primary)', fontWeight: '800', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                  ≡ƒô╖ Upload Bill Photo (MANDATORY)
                </label>

                <label style={{
                  border: `2px dashed ${podFile ? '#22c55e' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  padding: podPreviewUrl ? '16px' : '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: podFile ? '#f0fdf4' : '#F5FAFE',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                  onMouseEnter={(e) => {
                    if (!podFile) {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = 'var(--color-accent-teal)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!podFile) {
                      e.currentTarget.style.background = '#F5FAFE';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                  }}
                >
                  {podPreviewUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <img
                        src={podPreviewUrl}
                        alt="Bill Photo Preview"
                        style={{
                          height: '140px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          boxShadow: 'var(--shadow-soft)'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#166534', fontWeight: '700' }}>
                        <FileCheck size={14} />
                        {podFile}
                      </div>
                      <span style={{ fontSize: '11px', color: '#5E6B82', textDecoration: 'underline' }}>Click to replace file</span>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: podFile ? '#dcfce7' : '#DCE5F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: podFile ? '#166534' : '#5E6B82'
                      }}>
                        {podFile ? <FileCheck size={20} /> : <FileText size={20} />}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: podFile ? '#166534' : 'var(--color-text-primary)' }}>
                          {podFile ? 'Bill Photo Loaded' : 'Click to Upload Bill Photo'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#5E6B82', fontWeight: '500' }}>
                          {podFile ? podFile : 'Supported formats: JPG, PNG, WebP (Max 5MB)'}
                        </span>
                      </div>

                      {!podFile && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          marginTop: '4px'
                        }}>
                          Select File
                        </span>
                      )}
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPodFile(file.name);
                        setPodPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={closeDeliveryModal}
                  className="action-btn"
                  style={{
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #D6E2F0',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    margin: 0
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="action-btn"
                  style={{
                    background: 'var(--color-accent-teal)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    margin: 0
                  }}
                >
                  Γ£ô Complete Delivery & Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sample Retrieval Proof modal */}
      {showRetrievalModal && selectedSampleForRetrievalConfirm && (
        <div className="modal-overlay active" onClick={() => { setShowRetrievalModal(false); setSelectedSampleForRetrievalConfirm(null); }} style={{ zIndex: 10000 }}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              background: '#ffffff',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--color-primary)" />
                Confirm Return Receipt
              </h3>
              <button
                onClick={() => { setShowRetrievalModal(false); setSelectedSampleForRetrievalConfirm(null); }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5E6B82'
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: '#c2410c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Retrieving Sample Cargo
              </span>
              <span style={{ fontSize: '13.5px', color: '#9a3412', fontWeight: '800' }}>
                SMP-{String(selectedSampleForRetrievalConfirm.id).padStart(3, '0')}
              </span>
              <span style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600' }}>
                Customer: {selectedSampleForRetrievalConfirm.leadName}
              </span>
            </div>

            <form onSubmit={handleReturnConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--color-text-primary)', fontWeight: '800', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                  ≡ƒô╖ Upload Proof of Return (MANDATORY)
                </label>

                <label style={{
                  border: `2px dashed ${retrievalPodFile ? '#22c55e' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  padding: retrievalPodPreviewUrl ? '16px' : '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: retrievalPodFile ? '#f0fdf4' : '#F5FAFE',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                >
                  {retrievalPodPreviewUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <img
                        src={retrievalPodPreviewUrl}
                        alt="POR Preview"
                        style={{
                          height: '140px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          boxShadow: 'var(--shadow-soft)'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#166534', fontWeight: '700' }}>
                        <FileCheck size={14} />
                        {retrievalPodFile}
                      </div>
                      <span style={{ fontSize: '11px', color: '#5E6B82', textDecoration: 'underline' }}>Click to replace file</span>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#DCE5F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5E6B82'
                      }}>
                        <FileText size={20} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          Click to Upload Return Proof
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#5E6B82', fontWeight: '500' }}>
                          Supported formats: JPG, PNG, WebP (Max 5MB)
                        </span>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        marginTop: '4px'
                      }}>
                        Select File
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRetrievalPodFile(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setRetrievalPodPreviewUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => { setShowRetrievalModal(false); setSelectedSampleForRetrievalConfirm(null); }}
                  className="action-btn"
                  style={{
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #D6E2F0',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    margin: 0
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="action-btn"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#000000',
                    border: 'none',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    margin: 0
                  }}
                >
                  Γ£ô Confirm Return Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Bill Modal */}
      {showBillModal && selectedDispatchForBill && (
        <DispatchBillModal
          dispatchRecord={selectedDispatchForBill}
          orders={orders}
          onClose={() => {
            setShowBillModal(false);
            setSelectedDispatchForBill(null);
          }}
        />
      )}
    </>
  );
}
