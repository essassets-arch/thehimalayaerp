'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  Calendar, 
  MapPin, 
  Scale, 
  FileText, 
  ShieldCheck, 
  Map, 
  CheckSquare, 
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Upload,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

import { backendFetch } from '@/lib/backendFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Customer {
  companyName: string;
  address?: string;
}

interface SalesOrder {
  orderNumber: string;
  customer?: Customer;
}

interface SalesOrderItem {
  productId: string;
  productNameSnapshot: string;
  unit?: string;
}

interface DispatchItem {
  id: string;
  quantity: number | string;
  salesOrderItem: SalesOrderItem;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  isSubmitted: boolean;
  deliveryAddress: string | null;
  specialInstructions: string | null;
  
  // Package
  packageCount: number | null;
  packageType: string | null;
  totalWeight: number | string | null;
  
  // Transport
  transporterName: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  driverName: string | null;
  driverPhone: string | null;
  driverLicence: string | null;
  lrNumber: string | null;
  freightType: string | null;
  freightAmount: number | string | null;
  trackingRef: string | null;
  
  // Approval
  approvedAt: string | null;
  approvedById: string | null;
  rejectionRemarks: string | null;
  
  // Ready
  readyAt: string | null;
  readyById: string | null;
  dispatchLocation: string | null;
  documentChecklist: any | null;
  
  // Loading
  loadingStartedAt: string | null;
  loadingCompletedAt: string | null;
  loadedQuantity: number | string | null;
  vehicleClean: boolean | null;
  sealNumber: string | null;
  loadingSupervisor: string | null;
  loadingRemarks: string | null;
  
  // Dispatched / Gate
  dispatchedAt: string | null;
  dispatchedById: string | null;
  gateOutAt: string | null;
  gatePassNumber: string | null;
  gateSecurityConfirmed: boolean | null;
  invoiceNumber: string | null;
  ewayBillNumber: string | null;
  
  // In Transit
  currentLocation: string | null;
  lastLocationUpdateAt: string | null;
  eta: string | null;
  transitCondition: string | null;
  transitRemarks: string | null;
  transitLogs: any | null;
  
  // Out for Delivery
  outForDeliveryAt: string | null;
  deliveryContactPerson: string | null;
  deliveryContactPhone: string | null;
  expectedDeliveryTime: string | null;
  deliveryAttemptNo: number | null;
  
  // Delivered
  deliveredAt: string | null;
  deliveredQuantity: number | string | null;
  shortQuantity: number | string | null;
  damagedQuantity: number | string | null;
  receivedBy: string | null;
  receiverDesignation: string | null;
  receiverPhone: string | null;
  deliveryRemarks: string | null;
  podUrl: string | null;
  podReceivedAt: string | null;
  podApprovedAt: string | null;
  podApprovedById: string | null;
  podStatus: string | null;
  
  // Closure
  closedAt: string | null;
  closedById: string | null;
  transitDuration: number | null;
  
  salesOrderId?: string;
  salesOrder?: SalesOrder;
  createdAt?: string;
  items?: DispatchItem[];
}

export default function DispatchTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: dispatch, isLoading, refetch } = useQuery<Dispatch>({
    queryKey: ['dispatch-detail', id],
    queryFn: () => backendFetch<Dispatch>(`/api/backend/logistics/dispatches/${id}`)
  });

  // Local form inputs
  const [draftWeight, setDraftWeight] = useState(0);
  const [draftPackages, setDraftPackages] = useState(0);
  const [draftTransporter, setDraftTransporter] = useState('');
  const [draftVehicleNo, setDraftVehicleNo] = useState('');
  const [draftDriver, setDraftDriver] = useState('');
  const [draftDriverPhone, setDraftDriverPhone] = useState('');

  // Ready Checklist inputs
  const [packed, setPacked] = useState(false);
  const [labeled, setLabeled] = useState(false);
  const [docsReady, setDocsReady] = useState(false);
  const [invoiceGen, setInvoiceGen] = useState(false);
  const [readyLocation, setReadyLocation] = useState('Bay 1 - Finished Goods');

  // Vehicle assignment inputs
  const [assignTransporter, setAssignTransporter] = useState('');
  const [assignVehicleNo, setAssignVehicleNo] = useState('');
  const [assignVehicleType, setAssignVehicleType] = useState('10 Ton Lorry');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignDriverPhone, setAssignDriverPhone] = useState('');
  const [assignDriverLicence, setAssignDriverLicence] = useState('');
  const [assignLRNo, setAssignLRNo] = useState('');
  const [assignFreightAmt, setAssignFreightAmt] = useState(0);

  // Loading inputs
  const [loadingSupervisor, setLoadingSupervisor] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [loadedQty, setLoadedQty] = useState(0);
  const [loadingRemarks, setLoadingRemarks] = useState('');

  // Gate out inputs
  const [gatePassNo, setGatePassNo] = useState('');
  const [securityConfirmed, setSecurityConfirmed] = useState(false);

  // Transit inputs
  const [currentLoc, setCurrentLoc] = useState('');
  const [condition, setCondition] = useState('ON_SCHEDULE');
  const [transitRemarks, setTransitRemarks] = useState('');

  // Out for Delivery inputs
  const [delivPerson, setDelivPerson] = useState('');
  const [delivPhone, setDelivPhone] = useState('');

  // Delivery inputs
  const [deliveredQty, setDeliveredQty] = useState(0);
  const [shortQty, setShortQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [receivedByName, setReceivedByName] = useState('');
  const [receiverDesig, setReceiverDesig] = useState('Warehouse Manager');
  const [receivedPhone, setReceivedPhone] = useState('');
  const [deliveryRemarks, setDeliveryRemarks] = useState('');

  // POD inputs
  const [podUrlLink, setPodUrlLink] = useState('');

  // Populate edits from dispatch object
  React.useEffect(() => {
    if (dispatch) {
      setDraftWeight(Number(dispatch.totalWeight || 0));
      setDraftPackages(dispatch.packageCount || 0);
      setDraftTransporter(dispatch.transporterName || '');
      setDraftVehicleNo(dispatch.vehicleNumber || '');
      setDraftDriver(dispatch.driverName || '');
      setDraftDriverPhone(dispatch.driverPhone || '');
      
      setAssignTransporter(dispatch.transporterName || '');
      setAssignVehicleNo(dispatch.vehicleNumber || '');
      setAssignVehicleType(dispatch.vehicleType || '10 Ton Lorry');
      setAssignDriver(dispatch.driverName || '');
      setAssignDriverPhone(dispatch.driverPhone || '');
      setAssignDriverLicence(dispatch.driverLicence || '');
      setAssignLRNo(dispatch.lrNumber || '');
      setAssignFreightAmt(Number(dispatch.freightAmount || 0));

      const totalQty = dispatch.items?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
      setLoadedQty(totalQty);
      setDeliveredQty(totalQty);
    }
  }, [dispatch]);

  const handleAction = async (endpoint: string, body?: any) => {
    try {
      await backendFetch(`/api/backend/logistics/dispatches/${id}/${endpoint}`, {
        method: 'POST',
        body
      });
      toast.success('Workflow status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['dispatch-detail', id] });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Action execution failed');
    }
  };

  const saveDraftChanges = async () => {
    try {
      await backendFetch(`/api/backend/logistics/dispatches/${id}`, {
        method: 'POST',
        body: {
          totalWeight: Number(draftWeight),
          packageCount: Number(draftPackages),
          transporterName: draftTransporter,
          vehicleNumber: draftVehicleNo,
          driverName: draftDriver,
          driverPhone: draftDriverPhone
        }
      });
      toast.success('Draft changes saved');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save draft changes');
    }
  };

  if (isLoading || !dispatch) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">
        <Truck className="animate-spin h-6 w-6 mr-2 text-blue-500" />
        Loading shipment tracking portal...
      </div>
    );
  }

  const stages = [
    { label: 'Draft', code: 'DISPATCH_DRAFT' },
    { label: 'Approved', code: 'DISPATCH_APPROVED' },
    { label: 'Ready', code: 'READY_FOR_PICKUP' },
    { label: 'Assigned', code: 'VEHICLE_ASSIGNED' },
    { label: 'Loading', code: 'LOADING_IN_PROGRESS' },
    { label: 'Dispatched', code: 'DISPATCHED' },
    { label: 'Transit', code: 'IN_TRANSIT' },
    { label: 'Delivery Run', code: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', code: 'DELIVERED' },
    { label: 'POD Received', code: 'POD_RECEIVED' },
    { label: 'Closed', code: 'DISPATCH_CLOSED' }
  ];

  const currentStageIndex = stages.findIndex(s => s.code === dispatch.status);

  return (
    <div className="w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8 bg-gray-50/20 min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dispatch/orders')} className="hover:bg-gray-100">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Queue
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium font-mono">ID: {dispatch.id}</span>
          <StatusBadge status={dispatch.status} />
        </div>
      </div>

      {/* Shipment Header Details */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Dispatch note</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{dispatch.dispatchNo}</span>
          <span className="text-xs text-gray-500 font-medium">
            SO #{dispatch.salesOrder?.orderNumber || dispatch.salesOrderId || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Customer</span>
          <span className="text-sm font-semibold text-gray-900 mt-1 block">
            {dispatch.salesOrder?.customer?.companyName || 'Customer not available'}
          </span>
          <span className="text-xs text-gray-500 truncate block max-w-[200px]" title={dispatch.deliveryAddress || ''}>
            To: {dispatch.deliveryAddress || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Delivery details</span>
          <span className="text-sm font-semibold text-gray-900 mt-1 block">
            {dispatch.transporterName || 'No vehicle assigned'}
          </span>
          <span className="text-xs text-gray-500 block font-mono">{dispatch.vehicleNumber || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Timeline metrics</span>
          <span className="text-sm font-semibold text-gray-900 mt-1 block">
            ETA: {dispatch.eta ? new Date(dispatch.eta).toLocaleDateString() : 'N/A'}
          </span>
          <span className="text-xs text-gray-500 block">
            Created: {dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Logistics Stepper Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Logistics progress journey</h2>
        <div className="flex items-center justify-between min-w-[1000px] relative">
          {/* Progress Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-100 -z-0">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
            />
          </div>

          {stages.map((stg, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            return (
              <div key={stg.code} className="flex flex-col items-center z-10 w-24">
                <div 
                  className={`h-9 w-9 rounded-full flex items-center justify-center border-2 font-semibold text-xs transition-all ${
                    isCompleted 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isActive 
                        ? 'bg-white border-blue-600 text-blue-700 shadow-md ring-4 ring-blue-50' 
                        : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider text-center ${
                  isActive ? 'text-blue-700 font-extrabold' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Forms and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Action card + Items table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stage Control Center Card */}
          <Card className="border-blue-100 shadow-md rounded-2xl overflow-hidden ring-4 ring-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/10 border-b border-blue-50 p-6">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wide">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Workflow control center
              </div>
              <CardTitle className="text-xl font-bold mt-2">
                Active Stage: {stages[currentStageIndex]?.label}
              </CardTitle>
              <CardDescription>
                Provide the required verification details below to advance this shipment record.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* STAGE 1: DISPATCH_DRAFT */}
              {dispatch.status === 'DISPATCH_DRAFT' && (
                <div className="space-y-6">
                  {dispatch.rejectionRemarks && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-900 text-sm">
                      <AlertTriangle className="text-red-500 h-5 w-5 shrink-0" />
                      <div>
                        <span className="font-bold">Correction Required:</span> {dispatch.rejectionRemarks}
                      </div>
                    </div>
                  )}

                  {!dispatch.isSubmitted ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Transporter Name</label>
                          <input type="text" value={draftTransporter} onChange={(e)=>setDraftTransporter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Number</label>
                          <input type="text" value={draftVehicleNo} onChange={(e)=>setDraftVehicleNo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
                          <input type="text" value={draftDriver} onChange={(e)=>setDraftDriver(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Phone</label>
                          <input type="text" value={draftDriverPhone} onChange={(e)=>setDraftDriverPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (kg)</label>
                          <input type="number" value={draftWeight} onChange={(e)=>setDraftWeight(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Packages Count</label>
                          <input type="number" value={draftPackages} onChange={(e)=>setDraftPackages(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={saveDraftChanges} className="flex items-center gap-1.5">
                          Save Changes
                        </Button>
                        <Button onClick={() => handleAction('submit')} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5">
                          Submit for Approval
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4 text-center">
                      <Clock className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
                      <div className="font-semibold text-gray-800">Submitted and Awaiting Review</div>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        This dispatch note draft is currently locked. A logistics manager or super administrator needs to review the transporter, driver, and packaging details before it can be processed.
                      </p>
                      <div className="flex justify-center gap-3 pt-4 border-t max-w-sm mx-auto">
                        <Button variant="outline" onClick={() => handleAction('reject', { remarks: 'Returned by correction coordinator' })} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Return / Reject
                        </Button>
                        <Button onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Approve Dispatch
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 2: DISPATCH_APPROVED */}
              {dispatch.status === 'DISPATCH_APPROVED' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-emerald-900 text-sm mb-4">
                    <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-bold">Shipment Approved:</span> Locked dispatch details confirmed. Please complete the packing and labeling checklists.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Checklist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={packed} onChange={(e)=>setPacked(e.target.checked)} className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Goods are packed correctly</span>
                      </label>
                      <label className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={labeled} onChange={(e)=>setLabeled(e.target.checked)} className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Labels are attached</span>
                      </label>
                      <label className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={docsReady} onChange={(e)=>setDocsReady(e.target.checked)} className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Transport documents ready</span>
                      </label>
                      <label className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={invoiceGen} onChange={(e)=>setInvoiceGen(e.target.checked)} className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Invoice & E-way Bill generated</span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Dispatch Location / Warehouse Bay</label>
                      <input type="text" value={readyLocation} onChange={(e)=>setReadyLocation(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button 
                        disabled={!packed || !labeled || !docsReady || !invoiceGen}
                        onClick={() => handleAction('mark-ready', { 
                          dispatchLocation: readyLocation, 
                          packageCount: dispatch.packageCount || 1, 
                          totalWeight: Number(dispatch.totalWeight || 0), 
                          checklist: { packed, labeled, docsReady, invoiceGen } 
                        })} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Confirm Ready for Pickup
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: READY_FOR_PICKUP */}
              {dispatch.status === 'READY_FOR_PICKUP' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Transporter Name *</label>
                      <input type="text" value={assignTransporter} onChange={(e)=>setAssignTransporter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Number *</label>
                      <input type="text" value={assignVehicleNo} onChange={(e)=>setAssignVehicleNo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="MH-12-XY-5678" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Type *</label>
                      <input type="text" value={assignVehicleType} onChange={(e)=>setAssignVehicleType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name *</label>
                      <input type="text" value={assignDriver} onChange={(e)=>setAssignDriver(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Phone *</label>
                      <input type="text" value={assignDriverPhone} onChange={(e)=>setAssignDriverPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Licence Number *</label>
                      <input type="text" value={assignDriverLicence} onChange={(e)=>setAssignDriverLicence(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">LR / Consignment Number</label>
                      <input type="text" value={assignLRNo} onChange={(e)=>setAssignLRNo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Freight Amount (INR)</label>
                      <input type="number" value={assignFreightAmt} onChange={(e)=>setAssignFreightAmt(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      disabled={!assignTransporter || !assignVehicleNo || !assignDriver || !assignDriverPhone || !assignDriverLicence}
                      onClick={() => handleAction('assign-vehicle', {
                        transporterName: assignTransporter,
                        vehicleNumber: assignVehicleNo,
                        vehicleType: assignVehicleType,
                        driverName: assignDriver,
                        driverPhone: assignDriverPhone,
                        driverLicence: assignDriverLicence,
                        lrNumber: assignLRNo,
                        freightAmount: assignFreightAmt
                      })} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Assign Vehicle & Driver
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 4: VEHICLE_ASSIGNED */}
              {dispatch.status === 'VEHICLE_ASSIGNED' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>Transporter: <span className="font-bold">{dispatch.transporterName}</span></div>
                    <div>Vehicle: <span className="font-bold">{dispatch.vehicleNumber} ({dispatch.vehicleType})</span></div>
                    <div>Driver: <span className="font-bold">{dispatch.driverName} ({dispatch.driverPhone})</span></div>
                    <div>Licence: <span className="font-bold">{dispatch.driverLicence}</span></div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Loading Supervisor / Staff *</label>
                    <input type="text" value={loadingSupervisor} onChange={(e)=>setLoadingSupervisor(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Warehouse loader name" />
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => handleAction('assign-vehicle', { ...dispatch, transporterName: '' })} className="text-gray-600">
                      Change Vehicle
                    </Button>
                    <Button 
                      disabled={!loadingSupervisor}
                      onClick={() => handleAction('start-loading', { loadingSupervisor })} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Start Loading
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 5: LOADING_IN_PROGRESS */}
              {dispatch.status === 'LOADING_IN_PROGRESS' && (
                <div className="space-y-5">
                  {!dispatch.loadingCompletedAt ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Seal Number *</label>
                          <input type="text" value={sealNumber} onChange={(e)=>setSealNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. SEAL-000123" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Loaded Quantity *</label>
                          <input type="number" value={loadedQty} onChange={(e)=>setLoadedQty(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Shortage / Damage remarks</label>
                        <textarea rows={2} value={loadingRemarks} onChange={(e)=>setLoadingRemarks(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Describe any loading differences" />
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Button 
                          disabled={!sealNumber || loadedQty <= 0}
                          onClick={() => handleAction('complete-loading', { sealNumber, loadedQuantity: loadedQty, remarks: loadingRemarks })} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Complete Loading
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-900 text-sm">
                        <span className="font-bold">Loading Completed.</span> Loaded qty: {dispatch.loadedQuantity}. Seal: {dispatch.sealNumber}. Proceed to Gate Out.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Gate Pass Number *</label>
                          <input type="text" value={gatePassNo} onChange={(e)=>setGatePassNo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. GP-2026-0012" />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={securityConfirmed} onChange={(e)=>setSecurityConfirmed(e.target.checked)} className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-700">Security Gate Cleared</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t">
                        <Button 
                          disabled={!gatePassNo || !securityConfirmed}
                          onClick={() => handleAction('gate-out', { gatePassNumber: gatePassNo, gateSecurityConfirmed: securityConfirmed })} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Confirm Gate Out (Dispatch)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGES 6 & 7: DISPATCHED or IN_TRANSIT */}
              {(dispatch.status === 'DISPATCHED' || dispatch.status === 'IN_TRANSIT') && (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-900 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>Current Location: <span className="font-semibold">{dispatch.currentLocation || 'Factory Gate'}</span></div>
                    <div>Condition: <span className="font-semibold text-blue-700">{dispatch.transitCondition || 'ON_SCHEDULE'}</span></div>
                  </div>

                  <div className="border p-4 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Transit Coordinates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Current Coordinates / Location *</label>
                        <input type="text" value={currentLoc} onChange={(e)=>setCurrentLoc(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Reached NH-4 toll booth" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Shipment Condition</label>
                        <select value={condition} onChange={(e)=>setCondition(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                          <option value="ON_SCHEDULE">On Schedule</option>
                          <option value="DELAYED">Delayed</option>
                          <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                          <option value="ROUTE_CHANGED">Route Changed</option>
                          <option value="DELIVERY_ATTEMPT_FAILED">Delivery Attempt Failed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Driver/Transporter Remarks</label>
                      <input type="text" value={transitRemarks} onChange={(e)=>setTransitRemarks(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        disabled={!currentLoc}
                        onClick={() => {
                          handleAction('transit-update', { currentLocation: currentLoc, transitCondition: condition, remarks: transitRemarks });
                          setCurrentLoc('');
                          setTransitRemarks('');
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Update Transit Location
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      Verify contact person details before dispatching local delivery team.
                    </div>
                    <Button onClick={() => handleAction('out-for-delivery', { deliveryContactPerson: dispatch.salesOrder?.customer?.companyName || 'Customer', deliveryContactPhone: '9999999999' })} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Mark Out for Delivery
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 8: OUT_FOR_DELIVERY */}
              {dispatch.status === 'OUT_FOR_DELIVERY' && (
                <div className="space-y-5">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-900 text-sm">
                    Shipment is out for local delivery route. Awaiting customer receipt details.
                  </div>

                  <div className="border p-4 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Handover / Delivery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Delivered Quantity *</label>
                        <input type="number" value={deliveredQty} onChange={(e)=>setDeliveredQty(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Received By Name *</label>
                        <input type="text" value={receivedByName} onChange={(e)=>setReceivedByName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Designation</label>
                        <input type="text" value={receiverDesig} onChange={(e)=>setReceiverDesig(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                        <input type="text" value={receivedPhone} onChange={(e)=>setReceivedPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Shortage / Damage (if any)</label>
                        <input type="number" value={shortQty} onChange={(e)=>setShortQty(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm text-red-600 font-mono" placeholder="Short Qty" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Remarks</label>
                      <textarea rows={2} value={deliveryRemarks} onChange={(e)=>setDeliveryRemarks(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        disabled={deliveredQty <= 0 || !receivedByName}
                        onClick={() => handleAction('deliver', { 
                          deliveredQuantity: deliveredQty, 
                          shortQuantity: shortQty, 
                          damagedQuantity: damagedQty, 
                          receivedBy: receivedByName, 
                          receiverDesignation: receiverDesig, 
                          receiverPhone: receivedPhone, 
                          remarks: deliveryRemarks 
                        })} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Confirm Delivery Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 9: DELIVERED */}
              {dispatch.status === 'DELIVERED' && (
                <div className="space-y-4 text-center py-6">
                  <FileCheck className="h-12 w-12 text-emerald-600 mx-auto" />
                  <div className="font-bold text-gray-900">Shipment Received by Customer</div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    The delivery has been completed. To officially close this dispatch note, please upload a signed Proof of Delivery (POD) document.
                  </p>

                  <div className="border p-4 rounded-xl max-w-md mx-auto space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Proof of Delivery Challan / Link URL *</label>
                      <input type="text" value={podUrlLink} onChange={(e)=>setPodUrlLink(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-blue-700" placeholder="e.g. https://storage.corp/pod/challan-123.pdf" />
                    </div>
                    <Button 
                      disabled={!podUrlLink}
                      onClick={() => handleAction('upload-pod', { podUrl: podUrlLink })}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Submit POD
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 10: POD_RECEIVED */}
              {dispatch.status === 'POD_RECEIVED' && (
                <div className="space-y-6">
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="font-bold text-teal-900 text-sm block">Proof of Delivery document submitted.</span>
                      <a href={dispatch.podUrl || '#'} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-mono hover:underline truncate block max-w-xs sm:max-w-md mt-1">
                        View uploaded file ↗
                      </a>
                    </div>
                    <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded border border-teal-200">Pending Review</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acknowledge Claim Verification</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Delivered Quantity: <span className="font-semibold text-gray-900">{dispatch.deliveredQuantity}</span></div>
                      <div>Shortage Quantity Claimed: <span className="font-semibold text-red-600">{dispatch.shortQuantity || 0}</span></div>
                      <div>Damaged Quantity Claimed: <span className="font-semibold text-red-600">{dispatch.damagedQuantity || 0}</span></div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => handleAction('pod-action', { action: 'REJECT', remarks: 'Incorrect stamp' })} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Reject / Request corrected POD
                      </Button>
                      <Button onClick={() => handleAction('pod-action', { action: 'ACCEPT' })} className="bg-teal-600 hover:bg-teal-700 text-white">
                        Approve & Confirm POD
                      </Button>
                    </div>
                  </div>

                  {dispatch.podStatus === 'APPROVED' && (
                    <div className="pt-4 border-t flex justify-end">
                      <Button onClick={() => handleAction('close')} className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        Close Dispatch Note
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 11: DISPATCH_CLOSED */}
              {dispatch.status === 'DISPATCH_CLOSED' && (
                <div className="space-y-4 text-center py-6">
                  <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                  <div className="font-bold text-gray-900">Logistics Workflow Closed</div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    This dispatch note has been completed, verified, and locked in read-only mode.
                  </p>
                  <div className="bg-gray-50 border rounded-xl p-4 grid grid-cols-2 gap-4 max-w-md mx-auto text-xs font-mono text-left">
                    <div>Dispatched By: <span className="font-bold">{dispatch.dispatchedById || 'SYSTEM'}</span></div>
                    <div>Delivered Date: <span className="font-bold">{dispatch.deliveredAt ? new Date(dispatch.deliveredAt).toLocaleDateString() : '-'}</span></div>
                    <div>Transit Duration: <span className="font-bold">{dispatch.transitDuration} hrs</span></div>
                    <div>Closed Date: <span className="font-bold">{dispatch.closedAt ? new Date(dispatch.closedAt).toLocaleDateString() : '-'}</span></div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Shipment Items Table */}
          <Card className="rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-base font-bold text-gray-800">Shipped Products & Quantities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Product Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Dispatch Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatch.items?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-semibold text-gray-900">{item.salesOrderItem?.productNameSnapshot || 'Unknown Product'}</TableCell>
                      <TableCell className="text-gray-500">{item.salesOrderItem?.unit || 'Nos'}</TableCell>
                      <TableCell className="font-mono font-bold text-gray-900 text-right">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

        {/* Right 1 Column: Logistics details timeline / coordinates update */}
        <div className="space-y-8">
          
          {/* Packaging & Shipping Metadata Panel */}
          <Card className="rounded-2xl border border-gray-200/60 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-blue-500" />
                Shipping details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Transporter</span>
                <span className="font-bold text-gray-900">{dispatch.transporterName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Vehicle No</span>
                <span className="font-bold text-gray-900">{dispatch.vehicleNumber || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Vehicle Type</span>
                <span className="font-bold text-gray-900">{dispatch.vehicleType || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Driver</span>
                <span className="font-bold text-gray-900">{dispatch.driverName || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Driver Phone</span>
                <span className="font-bold text-gray-900">{dispatch.driverPhone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Package Type</span>
                <span className="font-bold text-gray-900">{dispatch.packageType || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">No of Packages</span>
                <span className="font-bold text-gray-900">{dispatch.packageCount || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Total Weight</span>
                <span className="font-bold text-gray-900">{dispatch.totalWeight ? `${dispatch.totalWeight} kg` : '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">E-way Bill</span>
                <span className="font-bold text-gray-900 font-mono">{dispatch.ewayBillNumber || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Invoice No</span>
                <span className="font-bold text-gray-900 font-mono">{dispatch.invoiceNumber || '-'}</span>
              </div>
              {dispatch.specialInstructions && (
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">Special Instructions:</span>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-100">{dispatch.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transit GPS coordinate checkpoints logs */}
          <Card className="rounded-2xl border border-gray-200/60 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Map className="h-4 w-4 text-indigo-500" />
                Transit checkpoint log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {Array.isArray(dispatch.transitLogs) && dispatch.transitLogs.length > 0 ? (
                <div className="relative border-l pl-4 space-y-5 text-xs font-mono">
                  {dispatch.transitLogs.map((log: any, index: number) => (
                    <div key={index} className="relative">
                      {/* Stepper node circle */}
                      <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 block">{log.location}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-indigo-600 font-bold text-[10px] block mt-0.5">{log.condition}</span>
                      {log.remarks && <span className="text-gray-500 text-[10px] block mt-1 leading-relaxed">"{log.remarks}"</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-6">
                  No transit logs updated yet. Coordinates log automatically registers checkpoints once gate-out completes.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
