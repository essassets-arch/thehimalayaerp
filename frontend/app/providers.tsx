'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AxiosAuthBridge } from '@/components/AxiosAuthBridge';

import { LocationTrackingProvider } from '@/providers/LocationTrackingProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AxiosAuthBridge />
      <LocationTrackingProvider>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </LocationTrackingProvider>
    </QueryClientProvider>
  );
}
