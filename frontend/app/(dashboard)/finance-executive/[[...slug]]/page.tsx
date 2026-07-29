'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FinancePortal from '../../../../modules/finance/pages/FinancePortal';

export default function FinanceExecutivePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string[] | undefined;

  useEffect(() => {
    if (!slug?.length) {
      router.replace('/finance-executive/dashboard');
    }
  }, [router, slug]);

  if (!slug?.length) return null;
  return <FinancePortal />;
}
