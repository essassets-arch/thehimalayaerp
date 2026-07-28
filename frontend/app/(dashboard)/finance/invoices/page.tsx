'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function InvoicesDashboard() {
  const router = useRouter();
  
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoice-list'],
    queryFn: async () => {
      const res = await axios.get('/api/backend/finance/invoices');
      return res.data;
    }
  });

  const columns = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }: any) => row.original.id.slice(0, 8) },
    { accessorKey: 'salesOrder.orderNumber', header: 'Sales Order' },
    { accessorKey: 'salesOrder.customer.companyName', header: 'Customer' },
    { 
      accessorKey: 'createdAt', 
      header: 'Date',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString()
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
        <Button variant="outline" size="sm" onClick={() => router.push(`/finance/invoices/${row.original.id}`)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Invoices</h1>
          <p className="text-muted-foreground">Manage and track customer invoices</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices || []}
        isLoading={isLoading}
        searchKey="salesOrder.orderNumber"
      />
    </div>
  );
}
