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
  UserCheck,
  Clock,
  Package,
  Phone,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';

import { backendFetch } from '@/lib/backendFetch';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import styles from './dispatch-detail.module.css';

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

  packageCount: number | null;
  packageType: string | null;
  totalWeight: number | string | null;

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

  approvedAt: string | null;
  approvedById: string | null;
  rejectionRemarks: string | null;

  readyAt: string | null;
  readyById: string | null;
  dispatchLocation: string | null;
  documentChecklist: any | null;

  loadingStartedAt: string | null;
  loadingCompletedAt: string | null;
  loadedQuantity: number | string | null;
  vehicleClean: boolean | null;
  sealNumber: string | null;
  loadingSupervisor: string | null;
  loadingRemarks: string | null;

  dispatchedAt: string | null;
  dispatchedById: string | null;
  gateOutAt: string | null;
  gatePassNumber: string | null;
  gateSecurityConfirmed: boolean | null;
  invoiceNumber: string | null;
  ewayBillNumber: string | null;

  currentLocation: string | null;
  lastLocationUpdateAt: string | null;
  eta: string | null;
  transitCondition: string | null;
  transitRemarks: string | null;
  transitLogs: any | null;

  outForDeliveryAt: string | null;
  deliveryContactPerson: string | null;
  deliveryContactPhone: string | null;
  expectedDeliveryTime: string | null;
  deliveryAttemptNo: number | null;

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

  const [draftWeight, setDraftWeight] = useState(0);
  const [draftPackages, setDraftPackages] = useState(0);
  const [draftTransporter, setDraftTransporter] = useState('');
  const [draftVehicleNo, setDraftVehicleNo] = useState('');
  const [draftDriver, setDraftDriver] = useState('');
  const [draftDriverPhone, setDraftDriverPhone] = useState('');

  const [packed, setPacked] = useState(false);
  const [labeled, setLabeled] = useState(false);
  const [docsReady, setDocsReady] = useState(false);
  const [invoiceGen, setInvoiceGen] = useState(false);
  const [readyLocation, setReadyLocation] = useState('Bay 1 - Finished Goods');

  const [assignTransporter, setAssignTransporter] = useState('');
  const [assignVehicleNo, setAssignVehicleNo] = useState('');
  const [assignVehicleType, setAssignVehicleType] = useState('10 Ton Lorry');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignDriverPhone, setAssignDriverPhone] = useState('');
  const [assignDriverLicence, setAssignDriverLicence] = useState('');
  const [assignLRNo, setAssignLRNo] = useState('');
  const [assignFreightAmt, setAssignFreightAmt] = useState(0);

  const [loadingSupervisor, setLoadingSupervisor] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [loadedQty, setLoadedQty] = useState(0);
  const [loadingRemarks, setLoadingRemarks] = useState('');

  const [gatePassNo, setGatePassNo] = useState('');
  const [securityConfirmed, setSecurityConfirmed] = useState(false);

  const [currentLoc, setCurrentLoc] = useState('');
  const [condition, setCondition] = useState('ON_SCHEDULE');
  const [transitRemarks, setTransitRemarks] = useState('');

  const [delivPerson, setDelivPerson] = useState('');
  const [delivPhone, setDelivPhone] = useState('');

  const [deliveredQty, setDeliveredQty] = useState(0);
  const [shortQty, setShortQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [receivedByName, setReceivedByName] = useState('');
  const [receiverDesig, setReceiverDesig] = useState('Warehouse Manager');
  const [receivedPhone, setReceivedPhone] = useState('');
  const [deliveryRemarks, setDeliveryRemarks] = useState('');
  const [podUrlLink, setPodUrlLink] = useState('');

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
      <div className={styles.loading}>
        <Truck className="animate-bounce" style={{ width: 24, height: 24, color: '#3b82f6' }} />
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
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Top Navigation ── */}
        <div className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => router.push('/dispatch/orders')}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back to Queue
          </button>
          <div className={styles.navRight}>
            <span className={styles.dispatchId}>ID: {dispatch.id}</span>
            <StatusBadge status={dispatch.status} />
          </div>
        </div>

        {/* ── Hero Header ── */}
        <div className={styles.heroCard}>
          <div className={styles.heroGrid}>
            <div className={styles.heroSection}>
              <span className={styles.heroLabel}>Dispatch Note</span>
              <span className={styles.heroValue}>{dispatch.dispatchNo}</span>
              <span className={styles.heroSub}>
                SO #{dispatch.salesOrder?.orderNumber || dispatch.salesOrderId || 'N/A'}
              </span>
            </div>
            <div className={styles.heroSection}>
              <span className={styles.heroLabel}>Customer</span>
              <span className={styles.heroValue} style={{ fontSize: 16 }}>
                {dispatch.salesOrder?.customer?.companyName || 'Customer not available'}
              </span>
              <span className={styles.heroSub}>
                To: {dispatch.deliveryAddress || 'N/A'}
              </span>
            </div>
            <div className={styles.heroSection}>
              <span className={styles.heroLabel}>Delivery Details</span>
              <span className={styles.heroValue} style={{ fontSize: 16 }}>
                {dispatch.transporterName || 'No vehicle assigned'}
              </span>
              <span className={styles.heroSub}>
                {dispatch.vehicleNumber || '-'}
              </span>
            </div>
            <div className={styles.heroSection}>
              <span className={styles.heroLabel}>Timeline Metrics</span>
              <span className={styles.heroValue} style={{ fontSize: 16 }}>
                ETA: {dispatch.eta ? new Date(dispatch.eta).toLocaleDateString() : 'N/A'}
              </span>
              <span className={styles.heroSub}>
                Created: {dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Logistics Progress Stepper ── */}
        <div className={styles.stepperCard}>
          <p className={styles.stepperLabel}>Logistics Progress Journey</p>
          <div className={styles.stepperScroll}>
            <div className={styles.stepperTrack}>
              <div className={styles.stepperLine}>
                <div
                  className={styles.stepperProgress}
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                />
              </div>
              {stages.map((stg, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = idx === currentStageIndex;
                return (
                  <div key={stg.code} className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${isCompleted ? styles.completed : isActive ? styles.active : ''}`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className={`${styles.stepLabel} ${isCompleted ? styles.completedLabel : isActive ? styles.activeLabel : ''}`}>
                      {stg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className={styles.mainGrid}>

          {/* ── LEFT Column ── */}
          <div className={styles.leftCol}>

            {/* ── Workflow Control Center ── */}
            <div className={`${styles.card} ${styles.controlCard}`}>
              <div className={styles.controlHeader}>
                <div className={styles.cardHeaderRow}>
                  <ShieldCheck style={{ width: 18, height: 18, color: '#2563eb' }} />
                  <span className={styles.cardHeaderBadge}>Workflow Control Center</span>
                </div>
                <h2 className={styles.cardTitle}>
                  Active Stage: {stages[currentStageIndex]?.label}
                </h2>
                <p className={styles.cardDesc}>
                  Provide the required verification details below to advance this shipment record.
                </p>
              </div>

              <div className={styles.cardContent}>

                {/* ── STAGE 1: DISPATCH_DRAFT ── */}
                {dispatch.status === 'DISPATCH_DRAFT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {dispatch.rejectionRemarks && (
                      <div className={styles.bannerDanger}>
                        <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
                        <div>
                          <strong>Correction Required: </strong>{dispatch.rejectionRemarks}
                        </div>
                      </div>
                    )}

                    {!dispatch.isSubmitted ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Transporter Name</label>
                            <input type="text" value={draftTransporter} onChange={e => setDraftTransporter(e.target.value)} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Vehicle Number</label>
                            <input type="text" value={draftVehicleNo} onChange={e => setDraftVehicleNo(e.target.value)} className={styles.fieldInput} />
                          </div>
                        </div>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Driver Name</label>
                            <input type="text" value={draftDriver} onChange={e => setDraftDriver(e.target.value)} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Driver Phone</label>
                            <input type="text" value={draftDriverPhone} onChange={e => setDraftDriverPhone(e.target.value)} className={styles.fieldInput} />
                          </div>
                        </div>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Weight (kg)</label>
                            <input type="number" value={draftWeight} onChange={e => setDraftWeight(Number(e.target.value))} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Packages Count</label>
                            <input type="number" value={draftPackages} onChange={e => setDraftPackages(Number(e.target.value))} className={styles.fieldInput} />
                          </div>
                        </div>
                        <div className={styles.actionFooter}>
                          <button className={styles.btnOutline} onClick={saveDraftChanges}>Save Changes</button>
                          <button className={styles.btnPrimary} onClick={() => handleAction('submit')}>
                            Submit for Approval
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.awaitingBox}>
                        <Clock style={{ width: 40, height: 40, color: '#f59e0b' }} className="animate-pulse" />
                        <p className={styles.awaitingTitle}>Submitted and Awaiting Review</p>
                        <p className={styles.awaitingSub}>
                          This dispatch note draft is currently locked. A logistics manager or super administrator needs to review the transporter, driver, and packaging details before it can be processed.
                        </p>
                        <div className={styles.awaitingActions}>
                          <button className={styles.btnDanger} onClick={() => handleAction('reject', { remarks: 'Returned by correction coordinator' })}>
                            Return / Reject
                          </button>
                          <button className={styles.btnSuccess} onClick={() => handleAction('approve')}>
                            Approve Dispatch
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STAGE 2: DISPATCH_APPROVED ── */}
                {dispatch.status === 'DISPATCH_APPROVED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className={styles.bannerSuccess}>
                      <CheckCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
                      <div>
                        <strong>Shipment Approved:</strong> Locked dispatch details confirmed. Please complete the packing and labeling checklists.
                      </div>
                    </div>

                    <div>
                      <p className={styles.sectionTitle}>Document Checklist</p>
                      <div className={styles.checkGrid}>
                        <label className={styles.checkItem}>
                          <input type="checkbox" checked={packed} onChange={e => setPacked(e.target.checked)} />
                          <span className={styles.checkLabel}>Goods are packed correctly</span>
                        </label>
                        <label className={styles.checkItem}>
                          <input type="checkbox" checked={labeled} onChange={e => setLabeled(e.target.checked)} />
                          <span className={styles.checkLabel}>Labels are attached</span>
                        </label>
                        <label className={styles.checkItem}>
                          <input type="checkbox" checked={docsReady} onChange={e => setDocsReady(e.target.checked)} />
                          <span className={styles.checkLabel}>Transport documents ready</span>
                        </label>
                        <label className={styles.checkItem}>
                          <input type="checkbox" checked={invoiceGen} onChange={e => setInvoiceGen(e.target.checked)} />
                          <span className={styles.checkLabel}>Invoice & E-way Bill generated</span>
                        </label>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Dispatch Location / Warehouse Bay</label>
                      <input type="text" value={readyLocation} onChange={e => setReadyLocation(e.target.value)} className={styles.fieldInput} />
                    </div>

                    <div className={styles.actionFooter}>
                      <button
                        className={styles.btnPrimary}
                        disabled={!packed || !labeled || !docsReady || !invoiceGen}
                        onClick={() => handleAction('mark-ready', {
                          dispatchLocation: readyLocation,
                          packageCount: dispatch.packageCount || 1,
                          totalWeight: Number(dispatch.totalWeight || 0),
                          checklist: { packed, labeled, docsReady, invoiceGen }
                        })}
                      >
                        Confirm Ready for Pickup
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 3: READY_FOR_PICKUP ── */}
                {dispatch.status === 'READY_FOR_PICKUP' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className={styles.formGrid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Transporter Name *</label>
                        <input type="text" value={assignTransporter} onChange={e => setAssignTransporter(e.target.value)} className={styles.fieldInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Vehicle Number *</label>
                        <input type="text" value={assignVehicleNo} onChange={e => setAssignVehicleNo(e.target.value)} className={styles.fieldInput} placeholder="MH-12-XY-5678" />
                      </div>
                    </div>
                    <div className={styles.formGrid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Vehicle Type *</label>
                        <input type="text" value={assignVehicleType} onChange={e => setAssignVehicleType(e.target.value)} className={styles.fieldInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Driver Name *</label>
                        <input type="text" value={assignDriver} onChange={e => setAssignDriver(e.target.value)} className={styles.fieldInput} />
                      </div>
                    </div>
                    <div className={styles.formGrid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Driver Phone *</label>
                        <input type="text" value={assignDriverPhone} onChange={e => setAssignDriverPhone(e.target.value)} className={styles.fieldInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Driver Licence Number *</label>
                        <input type="text" value={assignDriverLicence} onChange={e => setAssignDriverLicence(e.target.value)} className={styles.fieldInput} />
                      </div>
                    </div>
                    <div className={styles.formGrid2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>LR / Consignment Number</label>
                        <input type="text" value={assignLRNo} onChange={e => setAssignLRNo(e.target.value)} className={styles.fieldInput} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Freight Amount (INR)</label>
                        <input type="number" value={assignFreightAmt} onChange={e => setAssignFreightAmt(Number(e.target.value))} className={styles.fieldInput} />
                      </div>
                    </div>
                    <div className={styles.actionFooter}>
                      <button
                        className={styles.btnPrimary}
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
                      >
                        <Truck style={{ width: 15, height: 15 }} />
                        Assign Vehicle & Driver
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 4: VEHICLE_ASSIGNED ── */}
                {dispatch.status === 'VEHICLE_ASSIGNED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className={styles.vehicleGrid}>
                      <div className={styles.vehicleItem}>Transporter: <strong>{dispatch.transporterName}</strong></div>
                      <div className={styles.vehicleItem}>Vehicle: <strong>{dispatch.vehicleNumber} ({dispatch.vehicleType})</strong></div>
                      <div className={styles.vehicleItem}>Driver: <strong>{dispatch.driverName} ({dispatch.driverPhone})</strong></div>
                      <div className={styles.vehicleItem}>Licence: <strong>{dispatch.driverLicence}</strong></div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Loading Supervisor / Staff *</label>
                      <input type="text" value={loadingSupervisor} onChange={e => setLoadingSupervisor(e.target.value)} className={styles.fieldInput} placeholder="Warehouse loader name" />
                    </div>

                    <div className={styles.actionFooterSpread}>
                      <button className={styles.btnOutline} onClick={() => handleAction('assign-vehicle', { ...dispatch, transporterName: '' })}>
                        Change Vehicle
                      </button>
                      <button
                        className={styles.btnPrimary}
                        disabled={!loadingSupervisor}
                        onClick={() => handleAction('start-loading', { loadingSupervisor })}
                      >
                        <Package style={{ width: 15, height: 15 }} />
                        Start Loading
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 5: LOADING_IN_PROGRESS ── */}
                {dispatch.status === 'LOADING_IN_PROGRESS' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!dispatch.loadingCompletedAt ? (
                      <>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Seal Number *</label>
                            <input type="text" value={sealNumber} onChange={e => setSealNumber(e.target.value)} className={styles.fieldInput} placeholder="e.g. SEAL-000123" />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Loaded Quantity *</label>
                            <input type="number" value={loadedQty} onChange={e => setLoadedQty(Number(e.target.value))} className={styles.fieldInput} />
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Shortage / Damage remarks</label>
                          <textarea rows={2} value={loadingRemarks} onChange={e => setLoadingRemarks(e.target.value)} className={styles.fieldTextarea} placeholder="Describe any loading differences" />
                        </div>
                        <div className={styles.actionFooter}>
                          <button
                            className={styles.btnPrimary}
                            disabled={!sealNumber || loadedQty <= 0}
                            onClick={() => handleAction('complete-loading', { sealNumber, loadedQuantity: loadedQty, remarks: loadingRemarks })}
                          >
                            Complete Loading
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.bannerSuccess}>
                          <CheckCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
                          <div>
                            <strong>Loading Completed.</strong> Loaded qty: {dispatch.loadedQuantity}. Seal: {dispatch.sealNumber}. Proceed to Gate Out.
                          </div>
                        </div>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Gate Pass Number *</label>
                            <input type="text" value={gatePassNo} onChange={e => setGatePassNo(e.target.value)} className={styles.fieldInput} placeholder="e.g. GP-2026-0012" />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                            <label className={styles.checkItem} style={{ width: '100%' }}>
                              <input type="checkbox" checked={securityConfirmed} onChange={e => setSecurityConfirmed(e.target.checked)} />
                              <span className={styles.checkLabel}>Security Gate Cleared</span>
                            </label>
                          </div>
                        </div>
                        <div className={styles.actionFooter}>
                          <button
                            className={styles.btnPrimary}
                            disabled={!gatePassNo || !securityConfirmed}
                            onClick={() => handleAction('gate-out', { gatePassNumber: gatePassNo, gateSecurityConfirmed: securityConfirmed })}
                          >
                            Confirm Gate Out (Dispatch)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── STAGES 6 & 7: DISPATCHED or IN_TRANSIT ── */}
                {(dispatch.status === 'DISPATCHED' || dispatch.status === 'IN_TRANSIT') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoChip}>
                        <span className={styles.infoChipLabel}>Current Location</span>
                        <span className={styles.infoChipValue}>{dispatch.currentLocation || 'Factory Gate'}</span>
                      </div>
                      <div className={styles.infoChip}>
                        <span className={styles.infoChipLabel}>Condition</span>
                        <span className={styles.infoChipValue}>{dispatch.transitCondition || 'ON_SCHEDULE'}</span>
                      </div>
                    </div>

                    <div className={styles.innerPanel}>
                      <p className={styles.sectionTitle}>Update Transit Coordinates</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Current Coordinates / Location *</label>
                            <input type="text" value={currentLoc} onChange={e => setCurrentLoc(e.target.value)} className={styles.fieldInput} placeholder="e.g. Reached NH-4 toll booth" />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Shipment Condition</label>
                            <select value={condition} onChange={e => setCondition(e.target.value)} className={styles.fieldSelect}>
                              <option value="ON_SCHEDULE">On Schedule</option>
                              <option value="DELAYED">Delayed</option>
                              <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                              <option value="ROUTE_CHANGED">Route Changed</option>
                              <option value="DELIVERY_ATTEMPT_FAILED">Delivery Attempt Failed</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Driver/Transporter Remarks</label>
                          <input type="text" value={transitRemarks} onChange={e => setTransitRemarks(e.target.value)} className={styles.fieldInput} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className={styles.btnPrimary}
                            disabled={!currentLoc}
                            onClick={() => {
                              handleAction('transit-update', { currentLocation: currentLoc, transitCondition: condition, remarks: transitRemarks });
                              setCurrentLoc('');
                              setTransitRemarks('');
                            }}
                          >
                            <Navigation style={{ width: 14, height: 14 }} />
                            Update Transit Location
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actionFooterSpread}>
                      <span className={styles.footerNote}>
                        Verify contact person details before dispatching local delivery team.
                      </span>
                      <button
                        className={styles.btnIndigo}
                        onClick={() => handleAction('out-for-delivery', {
                          deliveryContactPerson: dispatch.salesOrder?.customer?.companyName || 'Customer',
                          deliveryContactPhone: '9999999999'
                        })}
                      >
                        <MapPin style={{ width: 14, height: 14 }} />
                        Mark Out for Delivery
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 8: OUT_FOR_DELIVERY ── */}
                {dispatch.status === 'OUT_FOR_DELIVERY' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className={styles.bannerIndigo}>
                      <MapPin style={{ width: 18, height: 18, flexShrink: 0 }} />
                      <div>Shipment is out for local delivery route. Awaiting customer receipt details.</div>
                    </div>

                    <div className={styles.innerPanel}>
                      <p className={styles.sectionTitle}>Confirm Handover / Delivery</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className={styles.formGrid2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Delivered Quantity *</label>
                            <input type="number" value={deliveredQty} onChange={e => setDeliveredQty(Number(e.target.value))} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Received By Name *</label>
                            <input type="text" value={receivedByName} onChange={e => setReceivedByName(e.target.value)} className={styles.fieldInput} />
                          </div>
                        </div>
                        <div className={styles.formGrid3}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Designation</label>
                            <input type="text" value={receiverDesig} onChange={e => setReceiverDesig(e.target.value)} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Phone Number</label>
                            <input type="text" value={receivedPhone} onChange={e => setReceivedPhone(e.target.value)} className={styles.fieldInput} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Shortage / Damage (if any)</label>
                            <input type="number" value={shortQty} onChange={e => setShortQty(Number(e.target.value))} className={styles.fieldInput} placeholder="Short Qty" />
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Delivery Remarks</label>
                          <textarea rows={2} value={deliveryRemarks} onChange={e => setDeliveryRemarks(e.target.value)} className={styles.fieldTextarea} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className={styles.btnSuccess}
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
                          >
                            <CheckCircle style={{ width: 15, height: 15 }} />
                            Confirm Delivery Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STAGE 9: DELIVERED ── */}
                {dispatch.status === 'DELIVERED' && (
                  <div className={styles.centerState}>
                    <div className={styles.centerStateIcon} style={{ background: '#f0fdf4' }}>
                      <FileCheck style={{ width: 28, height: 28, color: '#059669' }} />
                    </div>
                    <p className={styles.centerStateTitle}>Shipment Received by Customer</p>
                    <p className={styles.centerStateSub}>
                      The delivery has been completed. To officially close this dispatch note, please upload a signed Proof of Delivery (POD) document.
                    </p>
                    <div className={styles.podBox}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Proof of Delivery Challan / Link URL *</label>
                        <input
                          type="text"
                          value={podUrlLink}
                          onChange={e => setPodUrlLink(e.target.value)}
                          className={styles.fieldInput}
                          placeholder="e.g. https://storage.corp/pod/challan-123.pdf"
                          style={{ fontFamily: 'monospace', color: '#2563eb' }}
                        />
                      </div>
                      <button
                        className={styles.btnPrimary}
                        disabled={!podUrlLink}
                        onClick={() => handleAction('upload-pod', { podUrl: podUrlLink })}
                        style={{ width: '100%' }}
                      >
                        <Upload style={{ width: 15, height: 15 }} />
                        Submit POD
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STAGE 10: POD_RECEIVED ── */}
                {dispatch.status === 'POD_RECEIVED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className={styles.podTeal}>
                      <div>
                        <span className={styles.podTealTitle}>Proof of Delivery document submitted.</span>
                        <a href={dispatch.podUrl || '#'} target="_blank" rel="noreferrer" className={styles.podTealLink}>
                          View uploaded file ↗
                        </a>
                      </div>
                      <span className={styles.podPendingBadge}>Pending Review</span>
                    </div>

                    <div>
                      <p className={styles.sectionTitle}>Acknowledge Claim Verification</p>
                      <div className={styles.podStats}>
                        <span>Delivered Quantity: <strong>{dispatch.deliveredQuantity}</strong></span>
                        <span>Shortage Claimed: <strong style={{ color: '#dc2626' }}>{dispatch.shortQuantity || 0}</strong></span>
                        <span>Damaged Claimed: <strong style={{ color: '#dc2626' }}>{dispatch.damagedQuantity || 0}</strong></span>
                      </div>
                    </div>

                    <div className={styles.actionFooter}>
                      <button className={styles.btnDanger} onClick={() => handleAction('pod-action', { action: 'REJECT', remarks: 'Incorrect stamp' })}>
                        Reject / Request corrected POD
                      </button>
                      <button className={styles.btnTeal} onClick={() => handleAction('pod-action', { action: 'ACCEPT' })}>
                        Approve & Confirm POD
                      </button>
                    </div>

                    {dispatch.podStatus === 'APPROVED' && (
                      <div className={styles.actionFooter} style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                        <button className={styles.btnDark} onClick={() => handleAction('close')}>
                          <UserCheck style={{ width: 15, height: 15 }} />
                          Close Dispatch Note
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STAGE 11: DISPATCH_CLOSED ── */}
                {dispatch.status === 'DISPATCH_CLOSED' && (
                  <div className={styles.centerState}>
                    <div className={styles.centerStateIcon} style={{ background: '#f0fdf4' }}>
                      <CheckCircle style={{ width: 28, height: 28, color: '#059669' }} />
                    </div>
                    <p className={styles.centerStateTitle}>Logistics Workflow Closed</p>
                    <p className={styles.centerStateSub}>
                      This dispatch note has been completed, verified, and locked in read-only mode.
                    </p>
                    <div className={styles.closedSummary}>
                      <div className={styles.closedItem}>Dispatched By: <strong>{dispatch.dispatchedById || 'SYSTEM'}</strong></div>
                      <div className={styles.closedItem}>Delivered: <strong>{dispatch.deliveredAt ? new Date(dispatch.deliveredAt).toLocaleDateString() : '-'}</strong></div>
                      <div className={styles.closedItem}>Transit: <strong>{dispatch.transitDuration} hrs</strong></div>
                      <div className={styles.closedItem}>Closed: <strong>{dispatch.closedAt ? new Date(dispatch.closedAt).toLocaleDateString() : '-'}</strong></div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Shipped Products Table ── */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderRow}>
                  <Package style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span style={{ fontWeight: 700, color: '#374151', fontSize: 15 }}>Shipped Products &amp; Quantities</span>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th>Product Name</th>
                      <th>Unit</th>
                      <th>Dispatch Qty</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {dispatch.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.salesOrderItem?.productNameSnapshot || 'Unknown Product'}</td>
                        <td>{item.salesOrderItem?.unit || 'Nos'}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── RIGHT Column ── */}
          <div className={styles.rightCol}>

            {/* ── Shipping Details Panel ── */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderRow}>
                  <Truck style={{ width: 16, height: 16, color: '#3b82f6' }} />
                  <span style={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>Shipping Details</span>
                </div>
              </div>
              <div className={styles.cardContent} style={{ padding: '12px 20px 20px' }}>
                {[
                  { label: 'Transporter', value: dispatch.transporterName },
                  { label: 'Vehicle No', value: dispatch.vehicleNumber, mono: true },
                  { label: 'Vehicle Type', value: dispatch.vehicleType },
                  { label: 'Driver', value: dispatch.driverName },
                  { label: 'Driver Phone', value: dispatch.driverPhone, mono: true },
                  { label: 'Package Type', value: dispatch.packageType },
                  { label: 'No of Packages', value: dispatch.packageCount },
                  { label: 'Total Weight', value: dispatch.totalWeight ? `${dispatch.totalWeight} kg` : null },
                  { label: 'E-way Bill', value: dispatch.ewayBillNumber, mono: true },
                  { label: 'Invoice No', value: dispatch.invoiceNumber, mono: true },
                ].map(row => (
                  <div key={row.label} className={styles.detailRow}>
                    <span className={styles.detailKey}>{row.label}</span>
                    <span className={row.mono ? styles.detailValMono : styles.detailVal}>
                      {row.value || '-'}
                    </span>
                  </div>
                ))}
                {dispatch.specialInstructions && (
                  <div style={{ paddingTop: 12 }}>
                    <span className={styles.detailKey} style={{ display: 'block', marginBottom: 6 }}>Special Instructions</span>
                    <p style={{ fontSize: 12, color: '#374151', background: '#f9fafb', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', lineHeight: 1.6 }}>
                      {dispatch.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Transit Checkpoint Log ── */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderRow}>
                  <Map style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span style={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>Transit Checkpoint Log</span>
                </div>
              </div>
              <div className={styles.cardContent}>
                {Array.isArray(dispatch.transitLogs) && dispatch.transitLogs.length > 0 ? (
                  <div className={styles.timeline}>
                    {dispatch.transitLogs.map((log: any, index: number) => (
                      <div key={index} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span className={styles.timelineLocation}>{log.location}</span>
                          <span className={styles.timelineTime}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className={styles.timelineCondition}>{log.condition}</span>
                        {log.remarks && <span className={styles.timelineRemarks}>"{log.remarks}"</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyTimeline}>
                    No transit logs updated yet. Coordinates log automatically registers checkpoints once gate-out completes.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
