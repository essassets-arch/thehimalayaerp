export const ENTITY_ID_PREFIXES = {
  lead: 'LEAD',
  quotation: 'QUO',
  sample: 'SMP',
  order: 'ORD',
  workOrder: 'WO',
  batch: 'BATCH',
  materialRequest: 'MR',
  storeRelease: 'SR',
  materialIssue: 'MI',
  dispatch: 'DSP',
  returnRequest: 'RET',
  replacementRequest: 'REP',
  purchaseIndent: 'IND',
  purchaseOrder: 'PO',
  grn: 'GRN',
  vendorReturn: 'VRN',
  complaint: 'CMP',
  payrollRun: 'PAY',
  payment: 'PMT',
  qcInspection: 'QC',
  analysisRequest: 'AR',
  audit: 'AUD',
  notification: 'NOTIF'
} as const;

export type EntityIdType = keyof typeof ENTITY_ID_PREFIXES;

export const normalizeId = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .replace(/^#/, '')
    .toUpperCase();

export const getNextEntityId = (
  type: EntityIdType,
  existingRecords: unknown[]
): string => {
  const prefix = ENTITY_ID_PREFIXES[type];

  const highestNumber = existingRecords.reduce((highest: number, record: any) => {
    const possibleIds = [
      record?.id,
      record?.leadId,
      record?.quotationId,
      record?.sampleId,
      record?.orderId,
      record?.workOrderId,
      record?.batchId,
      record?.requestId,
      record?.releaseId,
      record?.dispatchId,
      record?.returnId,
      record?.replacementId,
      record?.indentId,
      record?.purchaseOrderId,
      record?.poId,
      record?.grnId,
      record?.complaintId,
      record?.payrollRunId,
      record?.inspectionId,
      record?.returnNo,
      record?.grnNumber
    ];

    for (const rawId of possibleIds) {
      if (!rawId) continue;
      const id = normalizeId(rawId);

      const match = id.match(
        new RegExp(`^${prefix}(?:-|_)?(\\d+)$`)
      );

      if (match) {
        highest = Math.max(highest, Number(match[1]));
      }
    }

    return highest;
  }, 0);

  return `${prefix}${highestNumber + 1}`;
};

export const displayEntityId = (id: unknown): string => {
  const normalized = normalizeId(id);
  return normalized ? `#${normalized}` : '—';
};

export const generateEntityIdPure = (state: any, type: EntityIdType): [string, any] => {
  const prefix = ENTITY_ID_PREFIXES[type];
  let currentSequence = Number(state?.idSequences?.[type]) || 0;

  if (currentSequence === 0) {
    let existingRecords: any[] = [];
    switch (type) {
      case 'lead': existingRecords = state?.sales?.leads || []; break;
      case 'quotation': existingRecords = state?.sales?.quotations || []; break;
      case 'sample': existingRecords = state?.sales?.samples || []; break;
      case 'order': existingRecords = state?.sales?.orders || []; break;
      case 'workOrder': existingRecords = state?.production?.workOrders || []; break;
      case 'batch': existingRecords = state?.production?.finishedGoods || []; break;
      case 'materialRequest': existingRecords = state?.production?.materialRequests || []; break;
      case 'storeRelease': existingRecords = state?.dispatch?.storeReleases || []; break;
      case 'materialIssue': existingRecords = state?.production?.materialIssues || []; break;
      case 'dispatch': existingRecords = state?.dispatch?.dispatchOrders || []; break;
      case 'returnRequest': existingRecords = state?.sales?.returnRequests || []; break;
      case 'replacementRequest': existingRecords = state?.sales?.replacementRequests || []; break;
      case 'purchaseIndent': existingRecords = state?.purchaseIndents || []; break;
      case 'purchaseOrder': existingRecords = state?.purchaseOrders || []; break;
      case 'grn': existingRecords = state?.goodsReceipts || []; break;
      case 'vendorReturn': existingRecords = state?.vendorReturns || []; break;
      case 'complaint': existingRecords = state?.complaints || []; break;
      case 'payrollRun': existingRecords = state?.payrollRuns || []; break;
      case 'payment': existingRecords = state?.sales?.paymentConfirmations || []; break;
      case 'qcInspection': existingRecords = state?.qcInspections || []; break;
      case 'analysisRequest': existingRecords = state?.analysisRequests || []; break;
      case 'audit': existingRecords = state?.auditEvents || []; break;
      case 'notification': existingRecords = state?.notifications || []; break;
    }
    const scanNextId = getNextEntityId(type, existingRecords);
    const match = scanNextId.match(/\d+$/);
    currentSequence = match ? (Number(match[0]) - 1) : 0;
  }

  const nextSequence = currentSequence + 1;
  const generatedId = `${prefix}${nextSequence}`;

  const newState = {
    ...state,
    idSequences: {
      ...(state?.idSequences || {}),
      [type]: nextSequence,
    }
  };

  return [generatedId, newState];
};
