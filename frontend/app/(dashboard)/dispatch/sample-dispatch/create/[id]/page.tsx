'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  Truck,
  User,
  Phone,
  Calendar,
  DollarSign,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Package,
  Layers,
  ArrowLeft,
  Check,
  MapPin,
  Mail,
  Info,
  Tag,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { isTradingProduct } from '@/shared/utils/dispatchCategory';
import styles from './create-sample.module.css';

// Helper to format addresses cleanly without raw JSON or fallback strings
function formatAddress(addr: any): string {
  if (!addr) return '';
  if (typeof addr === 'string') {
    const trimmed = addr.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return formatAddress(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    if (trimmed.toLowerCase() === 'see lead/customer address') return '';
    return trimmed;
  }
  if (typeof addr === 'object') {
    const parts: string[] = [];
    const line1 = addr.line1 || addr.addressLine1 || addr.street || addr.address || '';
    const line2 = addr.line2 || addr.addressLine2 || addr.landmark || '';
    const city = addr.city || '';
    const state = addr.state || '';
    const pincode = addr.pincode || addr.postalCode || addr.zipCode || '';
    const country = addr.country || '';

    if (line1) parts.push(line1);
    if (line2) parts.push(line2);
    if (city) parts.push(city);
    if (state && pincode) parts.push(`${state} - ${pincode}`);
    else if (state) parts.push(state);
    else if (pincode) parts.push(pincode);
    if (country && country.toLowerCase() !== 'india') parts.push(country);

    return parts.filter(Boolean).join(', ');
  }
  return '';
}

export default function CreateSampleDispatchPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith('/dispatch-2');
  const basePath = isDispatch2 ? '/dispatch-2' : '/dispatch';
  const rawId = (params?.id as string) || 'new';

  const isNew = rawId === 'new';
  const sampleTargetId = rawId.replace(/^req-/, '');

  const [loading, setLoading] = useState(!isNew);
  const [soNumber, setSoNumber] = useState(isNew ? '' : rawId);
  const [address, setAddress] = useState('');
  const [customer, setCustomer] = useState('');
  const [fetchedCost, setFetchedCost] = useState('0.00');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isReturn, setIsReturn] = useState(false);
  const [sampleDetails, setSampleDetails] = useState<any>(null);

  // New dispatch mode: selected existing pending sample ID
  const [pendingSamplesList, setPendingSamplesList] = useState<any[]>([]);
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  // Form Fields
  const [weight, setWeight] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transport, setTransport] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [dispatchDate, setDispatchDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cost, setCost] = useState('0.00');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Computed Items & Reference Details
  const allItems: any[] = useMemo(() => {
    if (!sampleDetails) return [];
    return sampleDetails.items || sampleDetails.products || sampleDetails.sampleItems || [];
  }, [sampleDetails]);

  const targetConsignmentItems = useMemo(() => {
    if (allItems.length === 0) return [];
    return allItems.filter((it: any) => (isDispatch2 ? isTradingProduct(it) : !isTradingProduct(it)));
  }, [allItems, isDispatch2]);

  const otherPortalItems = useMemo(() => {
    if (allItems.length === 0) return [];
    return allItems.filter((it: any) => (isDispatch2 ? !isTradingProduct(it) : isTradingProduct(it)));
  }, [allItems, isDispatch2]);

  const displayedItems = targetConsignmentItems.length > 0 ? targetConsignmentItems : allItems;

  const contactPerson =
    sampleDetails?.contactPerson ||
    sampleDetails?.lead?.contactPerson ||
    sampleDetails?.customer?.contactPerson ||
    '';
  const contactPhone =
    sampleDetails?.contactPhone ||
    sampleDetails?.phone ||
    sampleDetails?.lead?.phone ||
    sampleDetails?.customer?.phone ||
    '';
  const contactEmail =
    sampleDetails?.email ||
    sampleDetails?.lead?.email ||
    sampleDetails?.customer?.email ||
    '';
  const salesExecutive =
    sampleDetails?.salesExecutiveName ||
    sampleDetails?.salesExecutive?.name ||
    sampleDetails?.lead?.salesExecutive?.name ||
    '';
  const leadNumber =
    sampleDetails?.lead?.leadNumber ||
    (String(soNumber).includes('LEAD') ? soNumber : null);

  // If specific ID is passed, fetch its details
  useEffect(() => {
    if (!isNew) {
      const fetchSample = async () => {
        setLoading(true);
        try {
          let sample: any = null;
          try {
            sample = await backendFetch<any>(`/api/backend/sales/samples/${sampleTargetId}`, { cacheTtlMs: 0 });
          } catch {
            const res = await backendFetch<any[]>('/api/backend/sales/samples', { cacheTtlMs: 0 });
            const dataArray = Array.isArray(res) ? res : (res as any)?.data || [];
            sample = dataArray.find(
              (s: any) =>
                String(s.id) === String(sampleTargetId) ||
                String(s.sampleId) === String(sampleTargetId) ||
                String(s.sampleNumber) === String(sampleTargetId) ||
                String(s.id) === String(rawId) ||
                String(s.sampleNumber) === String(rawId)
            );
          }

          if (sample) {
            setSampleDetails(sample);
            const num = sample.sampleNumber || sample.sampleId || (sample.id ? `SMP-${String(sample.id).slice(0, 6)}` : rawId);
            setSoNumber(num);

            const custName =
              sample.customer ||
              sample.customerName ||
              sample.companyName ||
              sample.leadName ||
              sample.lead?.companyName ||
              sample.customer?.companyName ||
              'Lead / Customer';
            setCustomer(custName);

            const addr =
              formatAddress(sample.deliveryAddress) ||
              formatAddress(sample.address) ||
              formatAddress(sample.lead?.address) ||
              formatAddress(sample.customer?.shippingAddress) ||
              formatAddress(sample.customer?.billingAddress) ||
              '';
            setAddress(addr);

            const tc =
              sample.transportCost != null && !isNaN(Number(sample.transportCost))
                ? Number(sample.transportCost)
                : sample.transportationCost != null && !isNaN(Number(sample.transportationCost))
                ? Number(sample.transportationCost)
                : sample.lead?.transportationCost != null && !isNaN(Number(sample.lead.transportationCost))
                ? Number(sample.lead.transportationCost)
                : sample.lead?.expectedTransportationCost != null && !isNaN(Number(sample.lead.expectedTransportationCost))
                ? Number(sample.lead.expectedTransportationCost)
                : 0;

            setFetchedCost(tc.toFixed(2));
            setCost(tc.toFixed(2));

            if (sample.lead?.remarks) {
              setRemarks(sample.lead.remarks);
            }

            if (sample.status === 'RETURN_REQUESTED' || sample.retrievalStatus === 'Requested') {
              setIsReturn(true);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch sample details from backend:', e);
        } finally {
          setLoading(false);
        }
      };
      void fetchSample();
    } else {
      // If "new", load pending samples list so user can choose from active samples
      const fetchPending = async () => {
        try {
          const res = await backendFetch<any[]>('/api/backend/sales/samples', { cacheTtlMs: 0 });
          const dataArray = Array.isArray(res) ? res : (res as any)?.data || [];
          const pending = dataArray
            .filter((s: any) => {
              const sItems = s.items || s.products || s.sampleItems || [];
              if (sItems.length > 0) {
                return sItems.some((it: any) => (isDispatch2 ? isTradingProduct(it) : !isTradingProduct(it)));
              }
              return isDispatch2 ? isTradingProduct(s) : !isTradingProduct(s);
            })
            .filter(
              (s: any) =>
                s.status === 'CREATED' ||
                s.status === 'PENDING' ||
                s.status === 'PENDING_DISPATCH' ||
                s.status === 'RETURN_REQUESTED' ||
                s.dispatchStatus === 'Pending Dispatch'
            );
          setPendingSamplesList(pending);
        } catch (e) {
          console.warn('Failed to fetch pending samples:', e);
        }
      };
      void fetchPending();
    }
  }, [rawId, isNew, sampleTargetId]);

  const handleSelectPendingSample = (s: any) => {
    if (selectedPendingId === s.id) {
      setSelectedPendingId(null);
      setSoNumber('');
      setCustomer('');
      setAddress('');
      setSelectedOrders([]);
      setFetchedCost('0.00');
      setCost('0.00');
      setSampleDetails(null);
    } else {
      setSelectedPendingId(s.id);
      setSampleDetails(s);
      const num = s.sampleNumber || s.sampleId || (s.id ? `SMP-${String(s.id).slice(0, 6)}` : 'SMP-NEW');
      setSoNumber(num);
      const custName = s.customer || s.customerName || s.companyName || s.leadName || s.lead?.companyName || s.customer?.companyName || 'Customer';
      setCustomer(custName);
      const addr =
        formatAddress(s.deliveryAddress) ||
        formatAddress(s.address) ||
        formatAddress(s.lead?.address) ||
        formatAddress(s.customer?.shippingAddress) ||
        formatAddress(s.customer?.billingAddress) ||
        '';
      setAddress(addr);
      setSelectedOrders([num]);

      const tc =
        s.transportCost != null && !isNaN(Number(s.transportCost))
          ? Number(s.transportCost)
          : s.transportationCost != null && !isNaN(Number(s.transportationCost))
          ? Number(s.transportationCost)
          : s.lead?.transportationCost != null && !isNaN(Number(s.lead.transportationCost))
          ? Number(s.lead.transportationCost)
          : s.lead?.expectedTransportationCost != null && !isNaN(Number(s.lead.expectedTransportationCost))
          ? Number(s.lead.expectedTransportationCost)
          : 0;

      setFetchedCost(tc.toFixed(2));
      setCost(tc.toFixed(2));

      if (s.lead?.remarks) {
        setRemarks(s.lead.remarks);
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'weight':
        if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
          newErrors.weight = 'Please enter a valid positive weight in Tons (e.g. 15.5)';
        } else {
          delete newErrors.weight;
        }
        break;
      case 'vehicleNo':
        if (!vehicleNo.trim()) {
          newErrors.vehicleNo = 'Vehicle number is required';
        } else if (vehicleNo.trim().length < 4) {
          newErrors.vehicleNo = 'Vehicle number is too short';
        } else {
          delete newErrors.vehicleNo;
        }
        break;
      case 'driverName':
        if (!driverName.trim()) {
          newErrors.driverName = 'Driver name is required';
        } else {
          delete newErrors.driverName;
        }
        break;
      case 'driverPhone':
        if (driverPhone.trim() && !/^\+?[0-9]{10,13}$/.test(driverPhone.replace(/[\s-]/g, ''))) {
          newErrors.driverPhone = 'Enter a valid 10-digit phone number';
        } else {
          delete newErrors.driverPhone;
        }
        break;
      case 'transport':
        if (!transport.trim()) {
          newErrors.transport = 'Courier or transporter name is required';
        } else {
          delete newErrors.transport;
        }
        break;
      case 'dispatchDate':
        if (!dispatchDate) {
          newErrors.dispatchDate = 'Dispatch date is required';
        } else {
          delete newErrors.dispatchDate;
        }
        break;
      case 'address':
        if (isNew && !address.trim()) {
          newErrors.address = 'Delivery shipping address is required';
        } else {
          delete newErrors.address;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const fields = ['weight', 'vehicleNo', 'driverName', 'driverPhone', 'transport', 'dispatchDate'];
    if (isNew) fields.push('address');
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight in Tons (e.g. 15.5)';
      isValid = false;
    }
    if (!vehicleNo.trim()) {
      newErrors.vehicleNo = 'Vehicle number is required';
      isValid = false;
    }
    if (!driverName.trim()) {
      newErrors.driverName = 'Driver name is required';
      isValid = false;
    }
    if (driverPhone.trim() && !/^\+?[0-9]{10,13}$/.test(driverPhone.replace(/[\s-]/g, ''))) {
      newErrors.driverPhone = 'Enter a valid 10-digit phone number';
      isValid = false;
    }
    if (!transport.trim()) {
      newErrors.transport = 'Courier or transporter name is required';
      isValid = false;
    }
    if (!dispatchDate) {
      newErrors.dispatchDate = 'Dispatch date is required';
      isValid = false;
    }
    if (isNew && !address.trim()) {
      newErrors.address = 'Delivery address is required';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      weight: true,
      vehicleNo: true,
      driverName: true,
      driverPhone: true,
      transport: true,
      dispatchDate: true,
      address: true,
    });
    return isValid;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl: reader.result as string,
      });
      toast.success(`Attached ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please resolve all validation errors before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const targetId = sampleDetails?.id || selectedPendingId || sampleTargetId;
      const dispatchDetailsPayload = {
        weight: String(weight),
        vehicleNo: vehicleNo.toUpperCase().trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        remarks: remarks.trim(),
        transport: transport.trim(),
        lrNo: lrNo.trim(),
        dispatchDate,
        cost: cost || '0.00',
      };

      if (!isNew || selectedPendingId) {
        await backendFetch(`/api/backend/sales/samples/${targetId}`, {
          method: 'PATCH',
          body: {
            status: isReturn ? 'RETURN_IN_TRANSIT' : 'DISPATCHED',
            retrievalStatus: isReturn ? 'In Transit' : undefined,
            dispatchDetails: dispatchDetailsPayload,
            proofOfDelivery: attachedFile?.dataUrl || undefined,
          },
          idempotencyKey: String(Date.now()),
        });
      } else {
        // Create a new sample with DISPATCHED status
        await backendFetch('/api/backend/sales/samples', {
          method: 'POST',
          body: {
            status: 'DISPATCHED',
            customer: customer.trim() || 'Direct Consignment Customer',
            address: address.trim(),
            expectedDeliveryDate: dispatchDate,
            items: [
              {
                productId: 'PRD-1',
                quantity: 1,
                specifications: selectedOrders.length > 0 ? selectedOrders.join(', ') : 'Commercial Sample Package',
              },
            ],
            dispatchDetails: dispatchDetailsPayload,
            proofOfDelivery: attachedFile?.dataUrl || undefined,
          },
          idempotencyKey: String(Date.now()),
        });
      }

      toast.success(
        isReturn
          ? 'Return pick-up consignment confirmed & marked In Transit!'
          : 'Sample Dispatch consignment booked successfully and moved to In Transit!'
      );
      router.push(`${basePath}/sample-dispatch?status=in-transit`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to record sample dispatch');
    } finally {
      setSubmitting(false);
    }
  };

  const fileInputId = useId();

  return (
    <div className={styles.page}>
      <form className={styles.container} onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              {isReturn ? (
                <div className={styles.headerBadge}>
                  ↩ RETURN PICK-UP LOGISTICS
                </div>
              ) : (
                <div className={styles.headerBadgeDispatch}>
                  🚚 SAMPLE DISPATCH BOOKING
                </div>
              )}
              <h1 className={styles.title}>
                <Truck size={24} color="#60a5fa" />
                {isReturn ? 'Arrange Return Pick-up' : 'Book Dispatch Consignment'}
              </h1>
              <p className={styles.subtitle}>
                {isNew
                  ? 'Select an active pending sample or enter consignment details to create the dispatch'
                  : isReturn
                  ? `Arrange retrieval & collection of sample ${soNumber} from ${customer}`
                  : `Fill in carrier and vehicle details to dispatch sample ${soNumber}`}
              </p>
            </div>

            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => router.push(`${basePath}/sample-dispatch`)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <ArrowLeft size={16} style={{ display: 'inline', marginRight: 6 }} />
              Back
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className={styles.formBody}>
          {/* Section 1: Order & Delivery References */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Package size={18} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Order &amp; Delivery References</h2>
                <div className={styles.sectionDescription}>
                  Linked commercial sample request and destination customer site
                </div>
              </div>
            </div>

            {isNew ? (
              <div className={styles.orderListContainer}>
                {pendingSamplesList.length > 0 && (
                  <div>
                    <label className={styles.label} style={{ marginBottom: 8 }}>
                      Select Pending Sample to Dispatch (Optional):
                    </label>
                    <div className={styles.orderOptionsWrapper}>
                      {pendingSamplesList.map((s) => {
                        const isSelected = selectedPendingId === s.id;
                        const labelNo = s.sampleNumber || s.sampleId || `SMP-${String(s.id).slice(0, 6)}`;
                        const custName = s.customer || s.customerName || s.leadName || 'Customer';
                        return (
                          <div
                            key={s.id}
                            onClick={() => handleSelectPendingSample(s)}
                            className={`${styles.orderOption} ${isSelected ? styles.orderOptionSelected : ''}`}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{labelNo}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{custName}</div>
                            </div>
                            {isSelected && (
                              <span style={{ background: '#2563eb', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.grid2} style={{ marginTop: 12 }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Customer / Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Infra Projects / Alpha Tech"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Shipping To Address <span className={styles.requiredStar}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot No 42, Industrial Area Phase II, Delhi"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (touched.address) validateField('address');
                      }}
                      onBlur={() => handleBlur('address')}
                      className={`${styles.input} ${errors.address && touched.address ? styles.inputError : ''}`}
                      required
                    />
                    {errors.address && touched.address && (
                      <div className={styles.errorText}><AlertCircle size={13} /> {errors.address}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.refDetailsGrid}>
                  {/* Card 1: Sample & Lead Order References */}
                  <div className={styles.refDetailCard}>
                    <div className={styles.refDetailCardTitle}>
                      <Package size={14} color="#2563eb" /> Sample Order &amp; Linked Lead
                    </div>
                    <div className={styles.refDetailCardMain} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{soNumber}</span>
                      <span className={styles.badgeHighlight}>Verified</span>
                      {leadNumber && (
                        <span style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                          {leadNumber}
                        </span>
                      )}
                    </div>
                    {salesExecutive && (
                      <div className={styles.refDetailCardSub}>
                        <User size={13} color="#64748b" />
                        <span>Salesperson: <strong>{salesExecutive}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Customer & Delivery Address */}
                  <div className={styles.refDetailCard}>
                    <div className={styles.refDetailCardTitle}>
                      <Building2 size={14} color="#2563eb" /> Destination Customer &amp; Site
                    </div>
                    <div className={styles.refDetailCardMain}>
                      {customer || 'Lead Customer'}
                    </div>
                    <div className={styles.refDetailCardSub} style={{ color: address ? '#334155' : '#94a3b8' }}>
                      <MapPin size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                      <span>{address || 'Delivery address not specified on lead'}</span>
                    </div>
                  </div>

                  {/* Card 3: Contact Details */}
                  <div className={styles.refDetailCard}>
                    <div className={styles.refDetailCardTitle}>
                      <User size={14} color="#2563eb" /> Contact Person &amp; Phone
                    </div>
                    <div className={styles.refDetailCardMain}>
                      {contactPerson || 'Site Incharge / Representative'}
                    </div>
                    <div className={styles.refDetailCardSub}>
                      {contactPhone ? (
                        <a
                          href={`tel:${contactPhone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                        >
                          <Phone size={13} /> {contactPhone}
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Phone not provided</span>
                      )}
                      {contactEmail && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                          <Mail size={13} /> {contactEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Dispatch Logistics Portal */}
                  <div className={styles.refDetailCard}>
                    <div className={styles.refDetailCardTitle}>
                      <Truck size={14} color="#2563eb" /> Consignment Logistics Routing
                    </div>
                    <div className={styles.refDetailCardMain} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={isDispatch2 ? styles.badgeD2 : styles.badgeD1}>
                        {isDispatch2 ? 'Dispatch 2 — Trading / Sahad Dispatch' : 'Dispatch 1 — Factory Plant Dispatch'}
                      </span>
                    </div>
                    <div className={styles.refDetailCardSub}>
                      <span>Restricted to <strong>{isDispatch2 ? 'Category 2 (Trading Products)' : 'Category 1 (Manufacturing FRP Products)'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 1.5: Commercial Sample Products & Specifications */}
          {!isNew && displayedItems.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <Package size={18} />
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Commercial Sample Products &amp; Specifications</h2>
                  <div className={styles.sectionDescription}>
                    Requested sample items, technical specifications, colour, size and classification
                  </div>
                </div>
              </div>

              {otherPortalItems.length > 0 && (
                <div className={styles.mixedBanner}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Mixed Order Notice:</strong> This sample request contains {displayedItems.length} item(s) for{' '}
                    <strong>{isDispatch2 ? 'Dispatch 2 (Trading)' : 'Dispatch 1 (Manufacturing)'}</strong> and{' '}
                    {otherPortalItems.length} item(s) ({otherPortalItems.map((it: any) => it.productName || it.name || 'Item').join(', ')}) that are handled separately via{' '}
                    <strong>{isDispatch2 ? 'Dispatch 1 (Factory Dispatch)' : 'Dispatch 2 (Sahad Dispatch)'}</strong>.
                  </div>
                </div>
              )}

              <div className={styles.productTableContainer}>
                <table className={styles.productTable}>
                  <thead>
                    <tr>
                      <th>Product &amp; Code</th>
                      <th>Portal / Type</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th>Colour</th>
                      <th>Size</th>
                      <th>Capacity / Class</th>
                      <th>Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item: any, idx: number) => {
                      const itIsTrading = isTradingProduct(item);
                      const pName = item.productName || item.product?.name || item.name || item.specifications || 'Sample Product';
                      const pSku = item.sku || item.product?.sku || item.productCode || '—';
                      const color = item.color || item.leadItem?.color || '—';
                      const size = item.size || item.product?.size || item.leadItem?.size || '—';
                      const capacity = item.capacity || item.product?.capacity || item.leadItem?.capacity || '—';
                      const specs = item.specifications || item.leadItem?.specification || '—';

                      return (
                        <tr key={item.id || idx}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{pName}</div>
                            {pSku && pSku !== '—' && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>SKU: {pSku}</div>
                            )}
                          </td>
                          <td>
                            <span className={itIsTrading ? styles.badgeD2 : styles.badgeD1}>
                              {itIsTrading ? 'Trading (D2)' : 'Manufacturing (D1)'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#2563eb' }}>
                            {item.quantity || 1} {item.unit || 'Pcs'}
                          </td>
                          <td>
                            {color !== '—' ? (
                              <span className={styles.specChip} style={{ textTransform: 'uppercase' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: String(color).toLowerCase() === 'grey' ? '#94a3b8' : String(color).toLowerCase() === 'black' ? '#0f172a' : '#3b82f6', display: 'inline-block' }} />
                                {color}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            {size !== '—' ? <span className={styles.specChip}>{size}</span> : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td>
                            {capacity !== '—' ? <span className={styles.specChip}>{capacity}</span> : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td style={{ maxWidth: 320, fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                            {specs}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569' }}>
                <span>Total Items: <strong>{displayedItems.length}</strong></span>
                <span>Total Consignment Quantity: <strong style={{ color: '#2563eb', fontSize: 14 }}>{displayedItems.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0)} Pcs</strong></span>
              </div>
            </div>
          )}

          {/* Section 2: Transport Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Truck size={18} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Transport &amp; Vehicle Details</h2>
                <div className={styles.sectionDescription}>
                  Vehicle registration, assigned driver, and carrier consignment specifications
                </div>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Total Weight (Tons) <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <Layers size={16} className={styles.inputIcon} />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 15.5"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      if (touched.weight) validateField('weight');
                    }}
                    onBlur={() => handleBlur('weight')}
                    className={`${styles.input} ${styles.inputWithIcon} ${
                      errors.weight && touched.weight ? styles.inputError : ''
                    }`}
                    required
                  />
                </div>
                {errors.weight && touched.weight && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.weight}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Vehicle No <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <Truck size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. UK-07-CB-1234"
                    value={vehicleNo}
                    onChange={(e) => {
                      setVehicleNo(e.target.value.toUpperCase());
                      if (touched.vehicleNo) validateField('vehicleNo');
                    }}
                    onBlur={() => handleBlur('vehicleNo')}
                    className={`${styles.input} ${styles.inputWithIcon} ${
                      errors.vehicleNo && touched.vehicleNo ? styles.inputError : ''
                    }`}
                    required
                  />
                </div>
                {errors.vehicleNo && touched.vehicleNo && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.vehicleNo}</div>
                )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Driver Name <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Singh"
                    value={driverName}
                    onChange={(e) => {
                      setDriverName(e.target.value);
                      if (touched.driverName) validateField('driverName');
                    }}
                    onBlur={() => handleBlur('driverName')}
                    className={`${styles.input} ${styles.inputWithIcon} ${
                      errors.driverName && touched.driverName ? styles.inputError : ''
                    }`}
                    required
                  />
                </div>
                {errors.driverName && touched.driverName && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.driverName}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Driver Phone</label>
                <div className={styles.inputGroup}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={driverPhone}
                    onChange={(e) => {
                      setDriverPhone(e.target.value);
                      if (touched.driverPhone) validateField('driverPhone');
                    }}
                    onBlur={() => handleBlur('driverPhone')}
                    className={`${styles.input} ${styles.inputWithIcon} ${
                      errors.driverPhone && touched.driverPhone ? styles.inputError : ''
                    }`}
                  />
                </div>
                {errors.driverPhone && touched.driverPhone && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.driverPhone}</div>
                )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Courier / Transport <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Himalaya Own Fleet / DTDC Express / FedEx"
                  value={transport}
                  onChange={(e) => {
                    setTransport(e.target.value);
                    if (touched.transport) validateField('transport');
                  }}
                  onBlur={() => handleBlur('transport')}
                  className={`${styles.input} ${
                    errors.transport && touched.transport ? styles.inputError : ''
                  }`}
                  required
                />
                {errors.transport && touched.transport && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.transport}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>LR / AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. LR-2026-99120"
                  value={lrNo}
                  onChange={(e) => setLrNo(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Additional Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Calendar size={18} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Additional Details &amp; Billing</h2>
                <div className={styles.sectionDescription}>
                  Dispatch schedule, transportation cost ledger, and document attachments
                </div>
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Dispatch Date <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => {
                      setDispatchDate(e.target.value);
                      if (touched.dispatchDate) validateField('dispatchDate');
                    }}
                    onBlur={() => handleBlur('dispatchDate')}
                    className={`${styles.input} ${styles.inputWithIcon} ${
                      errors.dispatchDate && touched.dispatchDate ? styles.inputError : ''
                    }`}
                    required
                  />
                </div>
                {errors.dispatchDate && touched.dispatchDate && (
                  <div className={styles.errorText}><AlertCircle size={13} /> {errors.dispatchDate}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Fetched Transport Cost (₹)</label>
                <div className={styles.readOnlyBox}>
                  <span>₹{Number(fetchedCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <DollarSign size={15} color="#10b981" />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>To Be Paid (₹)</label>
                <div className={styles.inputGroup}>
                  <DollarSign size={16} className={styles.inputIcon} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className={`${styles.input} ${styles.inputWithIcon}`}
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dispatch Remarks / Instructions</label>
              <textarea
                placeholder="e.g. Handled with care, fragile commercial samples, target delivery within 48 hours."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dispatch Document (PDF / Image)</label>
              {attachedFile ? (
                <div className={styles.filePreviewCard}>
                  <div className={styles.fileInfo}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>{attachedFile.name} ({attachedFile.size})</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnRemoveFile}
                    onClick={() => setAttachedFile(null)}
                    title="Remove File"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id={fileInputId}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor={fileInputId} className={styles.fileDropzone}>
                    <UploadCloud size={24} color="#3b82f6" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                      Click to upload Lorry Receipt, E-way bill or Challan
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Supports PDF, PNG, JPG (up to 10MB)
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => router.push(`${basePath}/sample-dispatch`)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.btnSubmit} ${submitting ? styles.btnSubmitDisabled : ''}`}
            style={isReturn ? { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' } : {}}
            disabled={submitting}
          >
            {submitting ? (
              'Submitting...'
            ) : isReturn ? (
              <>
                <CheckCircle2 size={16} />
                Confirm Pick-up Arrangement
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Book Dispatch Consignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
