import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ComplaintStatus =
  | 'DRAFT'
  | 'PENDING_SUPER_ADMIN_REVIEW'
  | 'UNDER_REVIEW'
  | 'IN_RESOLUTION'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export interface ComplaintAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface ComplaintHistoryEntry {
  status: ComplaintStatus;
  remarks: string;
  actor: string;
  at: string;
}

export interface CustomerComplaint {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  complaintType: string;
  complaintDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  subject: string;
  description: string;
  salesRemarks: string;
  attachment?: ComplaintAttachment;
  status: ComplaintStatus;
  superAdminRemarks: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: ComplaintHistoryEntry[];
}

type NewComplaint = Omit<CustomerComplaint, 'id' | 'status' | 'superAdminRemarks' | 'assignedTo' | 'createdAt' | 'updatedAt' | 'history'>;

interface CustomerComplaintStore {
  complaints: CustomerComplaint[];
  submitComplaint: (complaint: NewComplaint) => string;
  saveDraft: (complaint: NewComplaint, id?: string) => string;
  submitDraft: (id: string, complaint: NewComplaint) => void;
  updateStatus: (id: string, status: ComplaintStatus, remarks: string, actor: string, assignedTo?: string) => void;
}

const nextComplaintId = (complaints: CustomerComplaint[]) => {
  const year = new Date().getFullYear();
  const max = complaints.reduce((value, complaint) => {
    const match = complaint.id.match(/(\d+)$/);
    return Math.max(value, match ? Number(match[1]) : 0);
  }, 0);
  return `CC-${year}-${String(max + 1).padStart(4, '0')}`;
};

export const useCustomerComplaintStore = create<CustomerComplaintStore>()(
  persist(
    (set, get) => ({
      complaints: [],
      submitComplaint: (complaint) => {
        const id = nextComplaintId(get().complaints);
        const now = new Date().toISOString();
        const status: ComplaintStatus = 'PENDING_SUPER_ADMIN_REVIEW';
        const record: CustomerComplaint = {
          ...complaint,
          id,
          status,
          superAdminRemarks: '',
          assignedTo: '',
          createdAt: now,
          updatedAt: now,
          history: [{ status, remarks: complaint.salesRemarks || 'Submitted for Super Admin review.', actor: complaint.createdBy, at: now }]
        };
        set(state => ({ complaints: [record, ...state.complaints] }));
        return id;
      },
      saveDraft: (complaint, existingId) => {
        const now = new Date().toISOString();
        if (existingId) {
          set(state => ({ complaints: state.complaints.map(item => item.id === existingId ? {
            ...item, ...complaint, status: 'DRAFT', updatedAt: now,
            history: [...item.history, { status: 'DRAFT', remarks: 'Draft updated by Sales.', actor: complaint.createdBy, at: now }]
          } : item) }));
          return existingId;
        }
        const id = nextComplaintId(get().complaints);
        set(state => ({ complaints: [{ ...complaint, id, status: 'DRAFT', superAdminRemarks: '', assignedTo: '', createdAt: now, updatedAt: now, history: [{ status: 'DRAFT', remarks: 'Draft saved by Sales.', actor: complaint.createdBy, at: now }] }, ...state.complaints] }));
        return id;
      },
      submitDraft: (id, complaint) => {
        const now = new Date().toISOString();
        set(state => ({ complaints: state.complaints.map(item => item.id === id ? {
          ...item, ...complaint, status: 'PENDING_SUPER_ADMIN_REVIEW', updatedAt: now,
          history: [...item.history, { status: 'PENDING_SUPER_ADMIN_REVIEW', remarks: complaint.salesRemarks || 'Submitted for Super Admin review.', actor: complaint.createdBy, at: now }]
        } : item) }));
      },
      updateStatus: (id, status, remarks, actor, assignedTo = '') => set(state => ({
        complaints: state.complaints.map(complaint => complaint.id === id ? {
          ...complaint,
          status,
          superAdminRemarks: remarks || complaint.superAdminRemarks,
          assignedTo: assignedTo || complaint.assignedTo,
          updatedAt: new Date().toISOString(),
          history: [...complaint.history, { status, remarks, actor, at: new Date().toISOString() }]
        } : complaint)
      }))
    }),
    { name: 'himalaya_customer_complaints_v1' }
  )
);
