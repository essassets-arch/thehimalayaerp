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

interface ProductionPlan {
  id: string;
  planNumber: string;
  salesOrder: {
    orderNumber: string;
    customer: {
      companyName: string;
    }
  };
  createdAt: string;
  workflowState: {
    name: string;
  } | null;
  status: string; // fallback if workflowState is missing
}

export default function ProductionPlanListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['production-plans-list', search, pagination],
    queryFn: async () => {
      // In a real app we'd pass pagination, here we just filter client side for prototype speed
      const res = await axios.get('/api/backend/production/plans');
      return res.data;
    }
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((p: ProductionPlan) => 
      p.planNumber?.toLowerCase().includes(lower) || 
      p.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
      p.salesOrder?.customer?.companyName?.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<ProductionPlan>[] = [
    {
      accessorKey: 'planNumber',
      header: 'Plan Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.planNumber}</span>,
    },
    {
      id: 'salesOrder',
      header: 'Sales Order',
      accessorFn: (row) => row.salesOrder?.orderNumber || '—',
      cell: ({ row }) => <span>{row.original.salesOrder?.orderNumber || '—'}</span>,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) => row.salesOrder?.customer?.companyName || row.salesOrder?.customer?.name || '—',
      cell: ({ row }) => (
        <span>
          {row.original.salesOrder?.customer?.companyName ||
            row.original.salesOrder?.customer?.name ||
            '—'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy') : '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/production/plans/${row.original.id}`)}
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
        title="Production Plans" 
        subtitle="Manage factory production schedules and Work Orders."
        actions={
          <Button onClick={() => router.push('/production/plans/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
        <FilterBar 
          onSearch={setSearch}
          searchPlaceholder="Search plan number or sales order..."
          hasActiveFilters={!!search}
          onClear={() => setSearch('')}
        />

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading plans...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData.slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize
            )} 
            pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
            onPaginationChange={setPagination}
            serverSide={false}
          />
        )}
      </div>
    </div>
  );
}
