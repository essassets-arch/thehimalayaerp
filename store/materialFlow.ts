/* eslint-disable @typescript-eslint/no-explicit-any */
import { useERPStore } from './erpStore';
import { MATERIAL_REQUEST_STATUS } from '../constants/production';

export { MATERIAL_REQUEST_STATUS };

const requests = (state: any) =>
  Array.isArray(state?.production?.materialRequests)
    ? state.production.materialRequests
    : [];

export const selectMaterialRequests = requests;

export const selectPlantHeadPendingRequests = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.status === MATERIAL_REQUEST_STATUS.PENDING_PLANT_HEAD_APPROVAL
  );

export const selectPlantHeadHistoryRequests = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.status !== MATERIAL_REQUEST_STATUS.PENDING_PLANT_HEAD_APPROVAL
  );

export const selectStoreApprovedRequests = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.status === MATERIAL_REQUEST_STATUS.PLANT_HEAD_APPROVED
  );

export const selectStoreRequestHistory = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.status === MATERIAL_REQUEST_STATUS.STORE_REJECTED
  );

export const selectStoreReleaseRequests = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.status === MATERIAL_REQUEST_STATUS.STORE_APPROVED
  );

export const selectProductionStoreReleases = (state: any) =>
  requests(state).filter(
    (request: any) =>
      request.department === 'Production' &&
      request.status === MATERIAL_REQUEST_STATUS.ISSUED
  );

const commit = (updater: (state: any) => any) => {
  const store: any = useERPStore.getState();
  store.setState(updater(store.state || {}));
};

const materialMatches = (inventoryItem: any, requestItem: any) =>
  [inventoryItem?.id, inventoryItem?.materialId, inventoryItem?.code]
    .filter(Boolean)
    .includes(requestItem?.materialId) ||
  String(inventoryItem?.material || inventoryItem?.name || '').toLowerCase() ===
    String(requestItem?.materialName || requestItem?.material || '').toLowerCase();

export const submitMaterialRequest = (data: any) => {
  const now = new Date().toISOString();
  const id = data.id || (useERPStore.getState() as any).generateEntityId('materialRequest');
  const request = {
    ...data,
    id,
    requestNo: id,
    orderId: data.orderId || data.workOrderNo || '',
    department: 'Production',
    items: (data.items || []).map((item: any, index: number) => ({
      ...item,
      materialId: item.materialId || item.id || `MAT-${Date.now()}-${index + 1}`,
      materialName: item.materialName || item.material,
      material: item.materialName || item.material,
      requestedQty: Number(item.requestedQty || 0),
      approvedQty: 0,
      issuedQty: 0,
      unit: item.unit || 'Units',
    })),
    status: MATERIAL_REQUEST_STATUS.PENDING_PLANT_HEAD_APPROVAL,
    createdAt: data.createdAt || now,
  };

  commit((state) => ({
    ...state,
    production: {
      ...(state.production || {}),
      materialRequests: [request, ...requests(state)],
    },
  }));
  return request;
};

export const approveMaterialRequest = (
  requestId: string,
  approvedItems: any[],
  approvedBy = 'Plant Head'
) => {
  const approvedAt = new Date().toISOString();
  commit((state) => ({
    ...state,
    production: {
      ...(state.production || {}),
      materialRequests: requests(state).map((request: any) =>
        request.id === requestId
          ? {
              ...request,
              status: MATERIAL_REQUEST_STATUS.PLANT_HEAD_APPROVED,
              approvedBy,
              approvedAt,
              items: request.items.map((item: any) => {
                const approved = approvedItems.find(
                  (candidate: any) =>
                    candidate.materialId === item.materialId ||
                    candidate.materialName === item.materialName ||
                    candidate.material === item.material
                );
                return {
                  ...item,
                  approvedQty: Number(
                    approved?.approvedQty ?? item.requestedQty ?? 0
                  ),
                };
              }),
            }
          : request
      ),
    },
  }));
};

export const rejectMaterialRequest = (
  requestId: string,
  approvedBy = 'Plant Head'
) => {
  const approvedAt = new Date().toISOString();
  commit((state) => ({
    ...state,
    production: {
      ...(state.production || {}),
      materialRequests: requests(state).map((request: any) =>
        request.id === requestId
          ? {
              ...request,
              status: MATERIAL_REQUEST_STATUS.PLANT_HEAD_REJECTED,
              approvedBy,
              approvedAt,
            }
          : request
      ),
    },
  }));
};

export const approveStoreMaterialRequest = (
  requestId: string,
  actorName = 'Store'
) => {
  const store: any = useERPStore.getState();
  const state = store.state || {};
  const request = requests(state).find((entry: any) => entry.id === requestId);
  if (!request) throw new Error('Material request not found.');
  if (request.status !== MATERIAL_REQUEST_STATUS.PLANT_HEAD_APPROVED) {
    throw new Error('Only a Plant Head approved request can be Store approved.');
  }
  const storeApprovedAt = new Date().toISOString();
  store.setState({
    ...state,
    production: {
      ...(state.production || {}),
      materialRequests: requests(state).map((entry: any) =>
        entry.id === requestId
          ? {
              ...entry,
              status: MATERIAL_REQUEST_STATUS.STORE_APPROVED,
              storeApprovedBy: actorName,
              storeApprovedAt,
              items: entry.items.map((item: any) => ({
                ...item,
                issueQty: Number(item.approvedQty || 0),
              })),
            }
          : entry
      ),
    },
  });
};

export const rejectStoreMaterialRequest = (
  requestId: string,
  remarks: string,
  actorName = 'Store'
) => {
  if (!remarks?.trim()) throw new Error('Rejection reason is required.');
  const storeRejectedAt = new Date().toISOString();
  commit((state) => ({
    ...state,
    production: {
      ...(state.production || {}),
      materialRequests: requests(state).map((request: any) =>
        request.id === requestId &&
        request.status === MATERIAL_REQUEST_STATUS.PLANT_HEAD_APPROVED
          ? {
              ...request,
              status: MATERIAL_REQUEST_STATUS.STORE_REJECTED,
              storeRejectedBy: actorName,
              storeRejectedAt,
              storeRejectionRemarks: remarks.trim(),
            }
          : request
      ),
    },
  }));
};

export const issueCompleteOrderMaterials = (
  orderId: string,
  actorName = 'Store'
) => {
  const store: any = useERPStore.getState();
  const state = store.state || {};
  const orderRequests = requests(state).filter(
    (request: any) => request.orderId === orderId
  );
  if (!orderRequests.length) throw new Error('No requests found for this order.');
  if (orderRequests.some((request: any) => request.status === MATERIAL_REQUEST_STATUS.ISSUED)) {
    throw new Error('This order has already been issued.');
  }
  if (orderRequests.some((request: any) => request.status !== MATERIAL_REQUEST_STATUS.STORE_APPROVED)) {
    throw new Error('Every request in this order must be Store approved.');
  }

  const inventory = [...(state.rawInventory || [])];
  orderRequests.forEach((request: any) =>
    request.items.forEach((item: any) => {
      const approvedQty = Number(item.approvedQty || 0);
      const issueQty = Number(item.issueQty || 0);
      const inventoryIndex = inventory.findIndex((entry) =>
        materialMatches(entry, item)
      );
      if (approvedQty <= 0 || issueQty !== approvedQty) {
        throw new Error(`Issue quantity is incomplete for ${item.materialName}.`);
      }
      if (inventoryIndex >= 0) {
        const availableStock = Number(inventory[inventoryIndex]?.stock || 0);
        inventory[inventoryIndex] = {
          ...inventory[inventoryIndex],
          stock: Math.max(0, availableStock - issueQty),
        };
      }
    })
  );

  const issuedAt = new Date().toISOString();
  const sequence = String(
    (state.production?.stockLedgerEntries || []).filter((entry: any) => entry.orderId === orderId).length + 1
  ).padStart(3, '0');
  const issueReference = `ISS-${orderId}-${sequence}`;
  const requestIds = new Set(orderRequests.map((request: any) => request.id));
  const stockLedgerEntries = orderRequests.flatMap((request: any) =>
    request.items.map((item: any) => ({
      id: `LEDGER-${Date.now()}-${item.materialId}`,
      type: 'MATERIAL_ISSUE',
      orderId,
      requestId: request.id,
      materialId: item.materialId,
      materialName: item.materialName,
      quantity: Number(item.issueQty || 0),
      unit: item.unit,
      issueReference,
      performedBy: actorName,
      createdAt: issuedAt,
    }))
  );

  store.setState({
    ...state,
    rawInventory: inventory,
    production: {
      ...(state.production || {}),
      stockLedgerEntries: [
        ...(state.production?.stockLedgerEntries || []),
        ...stockLedgerEntries,
      ],
      materialRequests: requests(state).map((request: any) =>
        requestIds.has(request.id)
          ? {
              ...request,
              status: MATERIAL_REQUEST_STATUS.ISSUED,
              issuedBy: actorName,
              issuedAt,
              issueReference,
              items: request.items.map((item: any) => ({
                ...item,
                issuedQty: Number(item.issueQty || 0),
              })),
            }
          : request
      ),
    },
  });
  return issueReference;
};
