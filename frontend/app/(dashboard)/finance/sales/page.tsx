'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinanceSalesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/finance/dashboard');
  }, [router]);

  return null;
}
