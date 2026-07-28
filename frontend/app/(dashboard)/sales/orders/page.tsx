'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { FilterBar } from '@/components/erp/common/FilterBar';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { EntityHeader } from '@/components/erp/common/EntityHeader';

interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  customer: {
    companyName: string;
  };
  workflowState: {
    status: string;
  };
}

export default function SalesOrderListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['sales-orders-list', search, pagination],
    queryFn: async () => {
      const res = await axios.get('/api/backend/sales/orders', {
        params: {
          search,
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        }
      });
      return res.data; // { data: [], total: 0 }
    }
  });

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('orderNumber')}</span>,
    },
    {
      accessorKey: 'customer.companyName',
      header: 'Customer',
    },
    {
      accessorKey: 'orderDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.getValue('orderDate')), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      },
    },
    {
      accessorKey: 'workflowState.status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowState?.status || 'UNKNOWN'} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/sales/orders/${row.original.id}`)}
          className="h-8 gap-1"
        >
          <Eye className="h-4 w-4 text-gray-500" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <EntityHeader 
        title="Sales Orders" 
        subtitle="Manage customer orders and workflow transitions."
        actions={
          <Button onClick={() => router.push('/sales/orders/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
        <FilterBar 
          onSearch={(val) => {
            setSearch(val);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
          }}
          searchPlaceholder="Search order number or customer..."
          hasActiveFilters={!!search}
          onClear={() => setSearch('')}
        />

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading orders...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={data?.data || []} 
            pageCount={Math.ceil((data?.total || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            serverSide={true}
          />
        )}
      </div>
    </div>
  );
}
