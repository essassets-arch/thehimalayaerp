'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function SuperSalesOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: order } = useQuery({
    queryKey: ['sales-orders', id],
    queryFn: async () => {
      const res = await axios.get(`/api/backend/sales/orders/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  React.useEffect(() => {
    if (order?.orderNumber) {
      router.replace(`/orders/${order.orderNumber}`);
    } else if (id) {
      router.replace(`/orders/${id}`);
    }
  }, [order?.orderNumber, id, router]);

  return (
    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">Redirecting to Order Details...</span>
    </div>
  );
}
