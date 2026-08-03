/**
 * Module declarations for legacy JSX components that lack TypeScript source.
 * These declarations provide type safety without rewriting the components.
 */
import type * as React from 'react';

// ─── HeroBanner ─────────────────────────────────────────────────────────────

interface HeroBannerStat {
  id?: string;
  title?: string;
  label?: string;
  value: string | number;
  icon?: string | React.ComponentType;
  trend?: string;
  color?: string;
  subtext?: string;
  theme?: string;
  action?: string;
  msg?: string;
}

interface HeroBannerProps {
  stats?: HeroBannerStat[];
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onActionClick?: (action: string, message: string) => void;
  notifications?: unknown[];
  onNavigate?: (id: string) => void | Promise<void>;
  onAddLead?: () => void;
  onCreateQuote?: () => void;
  isDashboard?: boolean;
}

declare module '*/HeroBanner' {
  const HeroBanner: React.ComponentType<HeroBannerProps>;
  export default HeroBanner;
}

declare module '@/components/HeroBanner' {
  const HeroBanner: React.ComponentType<HeroBannerProps>;
  export default HeroBanner;
}

// ─── FinishedGoodsTable ──────────────────────────────────────────────────────

interface FinishedGoodsRecord {
  id: string;
  workOrderNumber?: string;
  productName?: string;
  quantity?: number;
  status: string;
  items?: Array<{
    qcApprovedQuantity?: number;
    reservedQuantity?: number;
    dispatchedQuantity?: number;
  }>;
  [key: string]: unknown;
}

interface FinishedGoodsTableProps {
  records?: FinishedGoodsRecord[];
  readOnly?: boolean;
  showActions?: boolean;
  onActionComplete?: () => void;
}

declare module '*/shared/FinishedGoodsTable' {
  const FinishedGoodsTable: React.ComponentType<FinishedGoodsTableProps>;
  export default FinishedGoodsTable;
}

declare module '@/components/shared/FinishedGoodsTable' {
  const FinishedGoodsTable: React.ComponentType<FinishedGoodsTableProps>;
  export default FinishedGoodsTable;
}
