'use client';
import dynamic from 'next/dynamic';

const FinanceBrandAnalysis = dynamic(
  () => import('../../../../modules/finance/pages/FinanceBrandAnalysis'),
  { ssr: false }
);

export default function Page() {
  return <FinanceBrandAnalysis />;
}
