/**
 * Type declarations for the FinishedGoodsTable JSX component.
 * This file provides TypeScript types for the legacy JavaScript module
 * at @/components/shared/FinishedGoodsTable.jsx
 */

export interface FinishedGoodsRecord {
  id: string;
  workOrderNumber?: string;
  productName?: string;
  quantity?: number;
  status: string;
  /** Items array present in mock/legacy format */
  items?: Array<{
    qcApprovedQuantity?: number;
    reservedQuantity?: number;
    dispatchedQuantity?: number;
  }>;
  [key: string]: unknown;
}

export interface FinishedGoodsTableProps {
  records?: FinishedGoodsRecord[];
  readOnly?: boolean;
  showActions?: boolean;
  onActionComplete?: () => void;
}
