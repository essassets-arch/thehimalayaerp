'use client';
import dynamic from 'next/dynamic';

const BrandAnalysisPage = dynamic(
  () => import('../../../../modules/super-admin/pages/BrandAnalysisPage'),
  { ssr: false }
);

export default function Page() {
  return <BrandAnalysisPage />;
}
