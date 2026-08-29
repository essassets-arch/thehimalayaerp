'use client';

import { useState } from 'react';
import { useERPStore } from '@/store/erpStore';
import OrdersView from '@/components/OrdersView';
import { useNotificationStore } from '@/store/notificationStore';
import Swal from 'sweetalert2';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: 'rgba(15, 23, 42, 0.58)',
};

const cardStyle = {
  width: 'min(680px, 100%)',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 16,
  padding: 24,
  background: '#fff',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.3)',
};

function AfterSalesRequestModal({ type, order, onClose, onSuccess }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const [selectedLineId, setSelectedLineId] = useState(items[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [pickupRequired, setPickupRequired] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState(order.deliveryAddress || '');
  const [contactPerson, setContactPerson] = useState(order.contactPerson || '');
  const [refundExpected, setRefundExpected] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');

  const requestReplacement = useERPStore((state) => state.requestReplacement);
  const requestReturn = useERPStore((state) => state.requestReturn);
  const selectedItem = items.find((item) => item.id === selectedLineId);
  const isReplacement = type === 'REPLACEMENT';
  const title = isReplacement
    ? 'Request Product Replacement'
    : 'Request Order Return / Take Back';

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files || []);
    setError('');
    try {
      const uploadedAt = new Date().toISOString();
      const nextAttachments = await Promise.all(files.map((file, index) => new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error(`${file.name} is not an image.`));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          reject(new Error(`${file.name} exceeds the 5 MB limit.`));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
        reader.onload = () => resolve({
          id: `IMG-${Date.now()}-${index + 1}`,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          localDataUrl: reader.result,
          uploadedAt,
          uploadedBy: 'Sales User',
        });
        reader.readAsDataURL(file);
      })));
      setAttachments(nextAttachments);
    } catch (attachmentError) {
      event.target.value = '';
      setAttachments([]);
      setError(attachmentError instanceof Error ? attachmentError.message : 'Unable to attach image.');
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setError('');

    if (!selectedItem) {
      setError('Select a delivered product.');
      return;
    }

    const requestedQuantity = Number(quantity);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError(`Enter a valid ${isReplacement ? 'replacement' : 'return'} quantity.`);
      return;
    }

    const requestItem = {
      orderLineId: selectedItem.id,
      productId: selectedItem.productId,
      productName: selectedItem.productName,
      requestedQuantity,
      condition,
      reason,
    };

    try {
      const requestId = isReplacement
        ? requestReplacement(order.id, {
            items: [requestItem],
            pickupRequired,
            replacementAddress: order.deliveryAddress || '',
            preferredDate,
            remarks,
            photos: attachments,
            documents: attachments,
          })
        : requestReturn(order.id, {
            items: [requestItem],
            pickupAddress,
            contactPerson,
            preferredPickupDate: preferredDate,
            refundExpected,
            replacementExpected: false,
            remarks,
            photos: attachments,
            documents: attachments,
          });

      onSuccess(requestId);
    } catch (requestError) {
      console.error(`${title} failed:`, requestError);
      setError(requestError instanceof Error ? requestError.message : `Unable to create ${type.toLowerCase()} request.`);
    }
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={title}>
      <form style={cardStyle} onSubmit={submit}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ margin: '8px 0 18px', color: '#5E6B82' }}>
          <div>Order: <strong>{order.id}</strong></div>
          <div>Customer: <strong>{order.customerName}</strong></div>
        </div>

        <div className="form-group">
          <label className="form-label">Delivered product</label>
          <select
            name="orderLineId"
            className="form-input"
            value={selectedLineId}
            onChange={(event) => setSelectedLineId(event.target.value)}
            required
          >
            {items.length === 0 && <option value="">No delivered products available</option>}
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName || item.productId || 'Item'} — Delivered: {item.quantity} {item.unit || ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">{isReplacement ? 'Replacement' : 'Return'} quantity</label>
            <input
              name="requestedQuantity"
              className="form-input"
              type="number"
              min="1"
              max={selectedItem?.quantity || undefined}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Item condition</label>
            <select
              name="condition"
              className="form-input"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              required
            >
              <option value="">Select condition</option>
              {isReplacement ? (
                <>
                  <option value="DAMAGED_IN_TRANSIT">Damaged in Transit</option>
                  <option value="MANUFACTURING_DEFECT">Manufacturing Defect</option>
                  <option value="WRONG_PRODUCT">Wrong Product</option>
                </>
              ) : (
                <>
                  <option value="DAMAGED">Damaged</option>
                  <option value="NOT_REQUIRED">No Longer Required</option>
                  <option value="WRONG_PRODUCT">Wrong Product</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{isReplacement ? 'Replacement' : 'Return'} reason</label>
          <textarea
            name="reason"
            className="form-input"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </div>

        {!isReplacement && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Pickup address</label>
              <input name="pickupAddress" className="form-input" value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact person</label>
              <input name="contactPerson" className="form-input" value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} required />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">{isReplacement ? 'Preferred replacement date' : 'Preferred pickup date'}</label>
          <input name="preferredDate" className="form-input" type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 20, margin: '10px 0 16px' }}>
          {isReplacement ? (
            <label><input type="checkbox" checked={pickupRequired} onChange={(event) => setPickupRequired(event.target.checked)} /> Pickup required</label>
          ) : (
            <label><input type="checkbox" checked={refundExpected} onChange={(event) => setRefundExpected(event.target.checked)} /> Refund expected</label>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Detailed remarks</label>
          <textarea name="remarks" className="form-input" rows={2} value={remarks} onChange={(event) => setRemarks(event.target.value)} />
        </div>

        {isReplacement && (
          <div className="form-group">
            <label className="form-label">Upload damage images</label>
            <input
              name="replacementImages"
              className="form-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAttachmentChange}
            />
            <small style={{ color: '#5E6B82' }}>PNG, JPG or other image formats. Maximum 5 MB per image.</small>
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {attachments.map((attachment) => (
                  <div key={attachment.id} style={{ width: 92 }}>
                    <img
                      src={attachment.localDataUrl}
                      alt={attachment.name}
                      style={{ width: 92, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid #D6E2F0' }}
                    />
                    <div title={attachment.name} style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attachment.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p role="alert" style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn-small btn-outline-small" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-small btn-primary-small">
            Submit {isReplacement ? 'Replacement' : 'Return'} Request
          </button>
        </div>
      </form>
    </div>
  );
}

import { useOrders } from '@/modules/sales/hooks/useOrders';

export default function SalesOrdersView() {
  const { orders: backendOrders, sendToPlantHead } = useOrders();
  const sales = useERPStore((store) => store.state?.sales);
  const localOrders = Array.isArray(sales?.orders) ? sales.orders : [];
  const orders = [...backendOrders, ...localOrders].filter((order, index, list) => {
    const key = String(order.id || order.orderNo || order.orderNumber || '');
    return list.findIndex((candidate) =>
      String(candidate.id || candidate.orderNo || candidate.orderNumber || '') === key
    ) === index;
  });
  const replacementRequests = sales?.replacementRequests || [];
  const returnRequests = sales?.returnRequests || [];
  const showToast = useNotificationStore((state) => state.showToast);
  const [replacementOrder, setReplacementOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [sendingOrderId, setSendingOrderId] = useState(null);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'PLANT_PENDING') {
      if (sendingOrderId) return;
      const confirmation = await Swal.fire({
        title: 'Send Order to Plant Head?',
        text: 'This order will be added to the Plant Head incoming-order queue for production planning.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Send Order',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
      });
      if (!confirmation.isConfirmed) return;
      setSendingOrderId(orderId);
      try {
        const order = orders.find(o => o.id === orderId);
        const expectedVersion = order?.version || 1;
        if (process.env.NEXT_PUBLIC_DATA_SOURCE_MODE !== 'local') {
          const res = await sendToPlantHead(orderId, { expectedVersion });
          if (!res.success) throw new Error(res.error || 'Failed to send to plant head');
        } else {
          useERPStore.getState().sendOrderToPlantHead(orderId);
        }
        await Swal.fire({
          title: 'Order Sent Successfully',
          text: 'The order is now available in Plant Head Incoming Orders.',
          icon: 'success',
        });
      } catch (error) {
        await Swal.fire({
          title: 'Unable to Send Order',
          text: error instanceof Error ? error.message : String(error),
          icon: 'error',
        });
      } finally {
        setSendingOrderId(null);
      }
    }
  };

  const requestCreated = (kind, requestId) => {
    setReplacementOrder(null);
    setReturnOrder(null);
    showToast?.(`${kind} request ${requestId || ''} submitted for Plant Head review.`);
  };

  return (
    <>
      <OrdersView
        orders={orders}
        replacementRequests={replacementRequests}
        returnRequests={returnRequests}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAskReplacement={setReplacementOrder}
        onAskReturn={setReturnOrder}
      />

      {replacementOrder && (
        <AfterSalesRequestModal
          type="REPLACEMENT"
          order={replacementOrder}
          onClose={() => setReplacementOrder(null)}
          onSuccess={(requestId) => requestCreated('Replacement', requestId)}
        />
      )}

      {returnOrder && (
        <AfterSalesRequestModal
          type="RETURN"
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={(requestId) => requestCreated('Return', requestId)}
        />
      )}
    </>
  );
}
