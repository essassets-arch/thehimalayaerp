/**
 * Type declarations for the HeroBanner JSX component.
 * This file provides TypeScript types for the legacy JavaScript module
 * at @/components/HeroBanner.jsx
 */
import type * as React from 'react';

export interface HeroBannerStat {
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

export interface HeroBannerProps {
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

declare const HeroBanner: React.ComponentType<HeroBannerProps>;
export default HeroBanner;
