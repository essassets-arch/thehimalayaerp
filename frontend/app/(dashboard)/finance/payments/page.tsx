'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PaymentsDashboard() {
  const router = useRouter();
  
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-list'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/finance/payments');
      return res.data;
    }
  });

  const columns = [
    { accessorKey: 'paymentNo', header: 'Payment No' },
    { accessorKey: 'customer.companyName', header: 'Customer' },
    { 
      accessorKey: 'amount', 
      header: 'Amount (₹)',
      cell: ({ row }: any) => `₹${Number(row.original.amount).toFixed(2)}`
    },
    { 
      id: 'unallocated', 
      header: 'Unallocated (₹)',
      cell: ({ row }: any) => {
        const allocated = row.original.allocations?.reduce((s: number, a: any) => s + Number(a.amount), 0) || 0;
        const unallocated = Number(row.original.amount) - allocated;
        return <span className={unallocated > 0 ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>₹{unallocated.toFixed(2)}</span>;
      }
    },
    { 
      accessorKey: 'receivedAt', 
      header: 'Received Date',
      cell: ({ row }: any) => new Date(row.original.receivedAt).toLocaleDateString()
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <StatusBadge status={row.original.workflowState?.code || row.original.status} />
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm" onClick={() => router.push(`/finance/payments/${row.original.id}`)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Payments</h1>
          <p className="text-muted-foreground">Record and allocate customer payments</p>
        </div>
        <Button onClick={() => router.push('/finance/payments/create')}>
          <Plus className="mr-2 h-4 w-4" /> Receive Payment
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={payments || []}
        isLoading={isLoading}
        searchKey="paymentNo"
      />
    </div>
  );
}
