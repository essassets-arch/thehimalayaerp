'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { FilterBar } from '@/components/erp/common/FilterBar';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { EntityHeader } from '@/components/erp/common/EntityHeader';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionPlan: {
    planNumber: string;
    salesOrder: {
      orderNumber: string;
      customer: { companyName: string }
    }
  };
  quantity: number;
  createdAt: string;
  workflowState: {
    name: string;
  } | null;
  status: string; // fallback
}

export default function WorkOrderListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders-list', search, pagination],
    queryFn: async () => {
      const res = await axios.get('/api/backend/production/work-orders');
      return res.data;
    }
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((w: WorkOrder) => 
      w.workOrderNumber.toLowerCase().includes(lower) || 
      w.productionPlan?.planNumber.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('workOrderNumber')}</span>,
    },
    {
      accessorKey: 'productionPlan.planNumber',
      header: 'Production Plan',
    },
    {
      accessorKey: 'productionPlan.salesOrder.customer.companyName',
      header: 'Customer',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
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
          onClick={() => router.push(`/production/work-orders/${row.original.id}`)}
          className="h-8 gap-1"
        >
          <Eye className="h-4 w-4 text-gray-500" />
          Terminal
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <EntityHeader 
        title="Work Orders" 
        subtitle="Manage shop floor execution and log batches."
      />

      <div className="mt-6 space-y-4">
        <FilterBar 
          onSearch={setSearch}
          searchPlaceholder="Search work order or plan number..."
          hasActiveFilters={!!search}
          onClear={() => setSearch('')}
        />

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading work orders...</div>
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
