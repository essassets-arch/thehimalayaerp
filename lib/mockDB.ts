import { mockLeads, mockQuotations, mockOrders, mockCustomers, mockPayments } from './mockData';
import { getMockStorage, persistMockStorage } from './mockStorage';

// ── In-memory DB state (hydrated from localStorage or seed) ──
let db: any = getMockStorage({
  leads: [...mockLeads],
  quotations: [...mockQuotations],
  orders: [...mockOrders],
  customers: [...mockCustomers],
  payments: [...mockPayments],
  samples: [],
  reminders: [],
  dispatches: [],
  workOrders: [],
  materialRequests: [],
});

function save() {
  persistMockStorage(db);
}

// ── Helper: generate a timeline event object ──────────────
export function makeTimelineEvent(status: string, event: string, action: string, actor: string, department: string, notes?: string) {
  return {
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    event,
    action,
    timestamp: new Date().toISOString(),
    actor: actor || 'System',
    department: department || 'System',
    notes: notes || ''
  };
}

// ── Helper: advance an order's status + push timeline event ──
export function advanceOrder(
  orderId: string,
  newStatus: string,
  newDepartment: string,
  overallStage: string,
  timelineEvent: ReturnType<typeof makeTimelineEvent>,
  extraFields: Record<string, any> = {}
): any | null {
  const idx = (db.orders as any[]).findIndex((o: any) => String(o.id) === String(orderId) || String(o.orderNo) === String(orderId) || String(o.workOrderId) === String(orderId) || String(o.workOrderNo) === String(orderId) || `WO-${String(o.orderNo || o.id || '').split('-').slice(1).join('-') || o.id}` === String(orderId));
  if (idx === -1) return null;

  const order = db.orders[idx];
  const updatedHistory = [...(order.history || []), timelineEvent];

  db.orders[idx] = {
    ...order,
    ...extraFields,
    workflowStatus: newStatus,
    status: newStatus,
    currentDepartment: newDepartment,
    overallStage,
    history: updatedHistory,
    updatedAt: new Date().toISOString(),
  };

  save();
  return db.orders[idx];
}

export const mockDB = {
  get(collection: string): any[] {
    return db[collection] || [];
  },

  getById(collection: string, id: string): any | null {
    if (!db[collection]) return null;
    return db[collection].find((item: any) => String(item.id) === String(id) || String(item.orderNo) === String(id)) || null;
  },

  insert(collection: string, data: any): any {
    if (!db[collection]) db[collection] = [];
    const initEvent = makeTimelineEvent(
      data.status || 'Created',
      'Record Created',
      `New ${collection} record created`,
      data.actor || 'System User',
      collection.toUpperCase()
    );
    const newRecord = {
      id: `${collection.toUpperCase().replace(/S$/, '')}-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: data.history || [initEvent],
      ...data,
    };
    db[collection].push(newRecord);
    save();
    return newRecord;
  },

  update(collection: string, id: string, data: any): any | null {
    if (!db[collection]) return null;
    const index = db[collection].findIndex((item: any) => String(item.id) === String(id) || String(item.orderNo) === String(id));
    if (index === -1) return null;

    const currentItem = db[collection][index];
    const newStatus = data.status || data.dispatchStatus || data.dispatch_status || currentItem.status || 'Updated';
    const actionDesc = data.action || `Updated ${collection} record status to ${newStatus}`;

    const historyEvent = makeTimelineEvent(
      newStatus,
      'Status Update',
      actionDesc,
      data.updatedBy || data.actor || 'System / Dispatch User',
      data.department || collection.toUpperCase(),
      data.remarks || data.delivery_remarks || data.reason || ''
    );

    const existingHistory = Array.isArray(currentItem.history) ? currentItem.history : [];
    const updatedHistory = [...existingHistory, historyEvent];

    db[collection][index] = {
      ...currentItem,
      ...data,
      history: updatedHistory,
      updatedAt: new Date().toISOString(),
    };
    save();
    return db[collection][index];
  },

  remove(collection: string, id: string): boolean {
    if (!db[collection]) return false;
    const initialLength = db[collection].length;
    db[collection] = db[collection].filter((item: any) => String(item.id) !== String(id) && String(item.orderNo) !== String(id));
    if (db[collection].length !== initialLength) {
      save();
      return true;
    }
    return false;
  },

  // Advance order status with full timeline tracking
  advanceOrder,
  makeTimelineEvent,
};
