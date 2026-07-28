import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MaterialRequestItem {
  material: string;
  requestedQty: number;
  approvedQty: number;
  issuedQty: number;
  receivedQty: number;
  consumedQty: number;
  returnedQty: number;
  unit: string;
}

export type MaterialRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Issued'
  | 'Partially Issued'
  | 'Received'
  | 'Consuming'
  | 'Return Pending'
  | 'Returned'
  | 'Closed';

export interface MaterialRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  warehouse: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  items: MaterialRequestItem[];
  notes?: string;
  status: MaterialRequestStatus;
  requester?: string;
  workOrderNo?: string;
  approvedBy?: string;
  issuedBy?: string;
  receivedAt?: string;
}

interface MaterialRequestStore {
  materialRequests: MaterialRequest[];
  createRequest: (request: Omit<MaterialRequest, 'id' | 'requestNo'>) => MaterialRequest;
  updateRequest: (id: string, updates: Partial<MaterialRequest>) => void;
  submitRequest: (id: string) => void;
  approveRequest: (id: string, items: MaterialRequestItem[], status?: 'Approved' | 'Rejected') => void;
  issueMaterials: (id: string, items: MaterialRequestItem[], isPartial?: boolean) => void;
  confirmReceipt: (id: string, items: MaterialRequestItem[]) => void;
  logConsumption: (id: string, items: MaterialRequestItem[]) => void;
  returnMaterials: (id: string, items: MaterialRequestItem[], notes?: string) => void;
  confirmReturn: (id: string, items?: MaterialRequestItem[]) => void;
  closeRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  resetToDefault: () => void;
}

const update = (
  set: (updater: (state: MaterialRequestStore) => Partial<MaterialRequestStore>) => void,
  id: string,
  mapper: (request: MaterialRequest) => MaterialRequest
) =>
  set((state) => ({
    materialRequests: state.materialRequests.map((request) =>
      request.id === id ? mapper(request) : request
    ),
  }));

import { useERPStore } from './erpStore';

export const useMaterialRequestStore = create<MaterialRequestStore>()(
  persist(
    (set) => ({
      materialRequests: [],
      createRequest: (data) => {
        const id = useERPStore.getState().generateEntityId('materialRequest');
        const request = {
          id,
          requestNo: id,
          ...data,
        } as MaterialRequest;
        set((state) => ({ materialRequests: [request, ...state.materialRequests] }));
        return request;
      },
      updateRequest: (id, updates) =>
        update(set, id, (request) => ({ ...request, ...updates })),
      submitRequest: (id) =>
        update(set, id, (request) => ({ ...request, status: 'Submitted' })),
      approveRequest: (id, items, status = 'Approved') =>
        update(set, id, (request) => ({ ...request, items, status })),
      issueMaterials: (id, items, isPartial = false) =>
        update(set, id, (request) => ({
          ...request,
          items,
          status: isPartial ? 'Partially Issued' : 'Issued',
        })),
      confirmReceipt: (id, items) =>
        update(set, id, (request) => ({ ...request, items, status: 'Received' })),
      logConsumption: (id, items) =>
        update(set, id, (request) => ({ ...request, items, status: 'Consuming' })),
      returnMaterials: (id, items, notes) =>
        update(set, id, (request) => ({ ...request, items, notes, status: 'Return Pending' })),
      confirmReturn: (id, items) =>
        update(set, id, (request) => ({ ...request, items: items || request.items, status: 'Returned' })),
      closeRequest: (id) =>
        update(set, id, (request) => ({ ...request, status: 'Closed' })),
      deleteRequest: (id) =>
        set((state) => ({
          materialRequests: state.materialRequests.filter((request) => request.id !== id),
        })),
      resetToDefault: () => set({ materialRequests: [] }),
    }),
    {
      name: 'himalaya_material_requests_v1',
      version: 2,
      migrate: () => ({ materialRequests: [] }),
    }
  )
);
