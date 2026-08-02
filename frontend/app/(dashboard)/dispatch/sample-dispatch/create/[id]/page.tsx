'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import styles from './create-sample.module.css';

export default function CreateSampleDispatchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const isNew = id === 'new';
  
  const [soNumber, setSoNumber] = useState(isNew ? '' : id);
  const [address, setAddress] = useState(isNew ? '' : '');
  const [customer, setCustomer] = useState('');
  const [fetchedCost, setFetchedCost] = useState('0.00');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isReturn, setIsReturn] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const fetchSample = async () => {
        try {
          const { apiClient } = await import('@/lib/apiClient');
          const sampleId = id.replace('req-', '');
          const res = await apiClient.get(`/api/backend/sales/samples`);
          const dataArray = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          const sample = dataArray.find((s: any) => String(s.id) === String(sampleId) || String(s.sampleId) === String(sampleId));
          
          if (sample) {
            setSoNumber(sample.sampleNumber || sample.sampleId || `#SMP-${sample.id}`);
            setAddress(sample.address || 'See Lead/Customer address');
            setCustomer(sample.customer || sample.customerName || sample.companyName || sample.leadName || 'Unknown Customer');
            if (sample.transportationCost !== undefined) {
              setFetchedCost(Number(sample.transportationCost).toFixed(2));
            } else if (sample.transportCost !== undefined) {
              setFetchedCost(Number(sample.transportCost).toFixed(2));
            }
            // Detect if this is a return pick-up request
            if (sample.status === 'RETURN_REQUESTED') {
              setIsReturn(true);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch sample details', e);
        }
      };
      fetchSample();
    }
  }, [id, isNew]);

  const MOCK_ACTIVE_ORDERS = [
    { id: 'SO-2026-00007', units: 4 },
    { id: 'SO-2026-00008', units: 10 },
    { id: 'SO-2026-00009', units: 2 },
  ];

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const [weight, setWeight] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transport, setTransport] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [cost, setCost] = useState('500.00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !vehicleNo || !driverName || !transport || !dispatchDate || (isNew && selectedOrders.length === 0) || (isNew && !address)) {
      toast.error('Please fill in all required fields and select at least one order');
      return;
    }
    
    try {
      if (!isNew) {
        const { apiClient } = await import('@/lib/apiClient');
        const sampleId = id.replace('req-', '');
        await apiClient.patch(`/api/backend/sales/samples/${sampleId}`, {
          status: isReturn ? 'RETURN_IN_TRANSIT' : 'DISPATCHED',
          dispatchDetails: { weight, vehicleNo, driverName, driverPhone, remarks, transport, lrNo, dispatchDate, cost }
        });
      }
      toast.success(isReturn ? 'Return pick-up dispatched successfully!' : 'Sample Dispatch created successfully!');
      router.push('/dispatch/sample-dispatch?status=in-transit');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update sample dispatch status');
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.container} onSubmit={handleSubmit}>
        
        <div className={styles.header}>
          {isReturn && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
              ↩ RETURN PICK-UP REQUEST
            </div>
          )}
          <h1 className={styles.title}>{isReturn ? 'Arrange Return Pick-up' : 'Book Dispatch Consignment'}</h1>
          <p className={styles.subtitle}>
            {isNew ? 'Create a brand new sample dispatch by entering the details manually' : isReturn ? `Arrange collection of sample ${soNumber} from ${customer}` : `Fill in logistics details to create the dispatch for ${soNumber}`}
          </p>
        </div>

        <div className={styles.formBody}>
          
          {/* Section 1: Address */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Order &amp; Delivery References</h2>
            {isNew ? (
              <div className={styles.orderListContainer}>
                <span className={styles.orderListLabel}>Select Active Order Reference</span>
                <div className={styles.orderOptionsWrapper}>
                  {MOCK_ACTIVE_ORDERS.map(order => (
                    <label key={order.id} className={styles.orderOption}>
                      <input 
                        type="checkbox" 
                        className={styles.orderCheckbox} 
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrder(order.id)}
                      />
                      <span className={styles.orderText}>{order.id} ({order.units} Units)</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>{isReturn ? 'Sample to be Collected' : 'Sample Order'}</label>
                  <div className={styles.readOnlyBox}>{soNumber} {customer ? `— ${customer}` : ''}</div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{isReturn ? 'Collecting From' : 'Shipping To'}</label>
                  <div className={styles.readOnlyBox}>{address}</div>
                </div>
              </div>
            )}
            
            {isNew && (
              <div className={styles.field} style={{ marginTop: 8 }}>
                <label className={styles.label}>Shipping To*</label>
                <input type="text" placeholder="e.g. Full Delivery Address" value={address} onChange={e => setAddress(e.target.value)} className={styles.input} required />
              </div>
            )}
          </div>

          {/* Section 2: Logistics */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Transport Details</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Total Weight (Tons)*</label>
                <input type="number" step="0.1" placeholder="e.g. 15.5" value={weight} onChange={e => setWeight(e.target.value)} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Vehicle No*</label>
                <input type="text" placeholder="e.g. UK-07-CB-1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className={styles.input} required />
              </div>
            </div>
            
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Driver Name*</label>
                <input type="text" placeholder="e.g. Ramesh Singh" value={driverName} onChange={e => setDriverName(e.target.value)} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Driver Phone</label>
                <input type="text" placeholder="e.g. 9876543210" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} className={styles.input} />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Courier / Transport*</label>
                <input type="text" placeholder="e.g. Himalaya Own Fleet / DTDC" value={transport} onChange={e => setTransport(e.target.value)} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>LR / AWB Number</label>
                <input type="text" placeholder="e.g. LR-2024-00123" value={lrNo} onChange={e => setLrNo(e.target.value)} className={styles.input} />
              </div>
            </div>
          </div>

          {/* Section 3: Cost and Remarks */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Additional Details</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Dispatch Date*</label>
                <input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Fetched Transportation Cost (₹)</label>
                <div className={styles.readOnlyBox}>{fetchedCost}</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>To Be Paid (₹)</label>
                <input type="number" step="0.01" placeholder="e.g. 500.00" value={cost} onChange={e => setCost(e.target.value)} className={styles.input} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dispatch Remarks</label>
              <textarea placeholder="e.g. Fragile items loaded carefully" value={remarks} onChange={e => setRemarks(e.target.value)} className={styles.textarea} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dispatch Document (PDF / Image)</label>
              <input type="file" className={styles.fileInput} />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnCancel} onClick={() => router.push('/dispatch/sample-dispatch')}>Cancel</button>
          <button type="submit" className={styles.btnSubmit} style={isReturn ? { background: '#b91c1c' } : {}}>
            {isReturn ? '↩ Confirm Pick-up Arrangement' : 'Book Dispatch Consignment'}
          </button>
        </div>

      </form>
    </div>
  );
}
