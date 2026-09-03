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

interface QCInspection {
  id: string;
  workOrder: {
    workOrderNumber: string;
    productionPlan: {
      planNumber: string;
      salesOrder: {
        orderNumber: string;
        customer: { companyName: string }
      }
    }
  };
  createdAt: string;
  workflowState: {
    name: string;
  } | null;
  status: string; // fallback
}

export default function QCInspectionListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['qc-list', search, pagination],
    queryFn: async () => {
      const res = await axios.get('/api/backend/qc/inspections');
      return res.data;
    }
  });

  const filteredData = React.useMemo(() => {
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((q: QCInspection) => 
      q.workOrder?.workOrderNumber?.toLowerCase().includes(lower) || 
      q.workOrder?.productionPlan?.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
      q.workOrder?.productionPlan?.salesOrder?.customer?.companyName?.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<QCInspection>[] = [
    {
      id: 'salesOrder',
      header: 'Sales Order',
      accessorFn: (row) => row.workOrder?.productionPlan?.salesOrder?.orderNumber || 'SO-2026-00001',
      cell: ({ row }) => (
        <span className="font-bold text-blue-600 hover:underline">
          {row.original.workOrder?.productionPlan?.salesOrder?.orderNumber || 'SO-2026-00001'}
        </span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) =>
        row.workOrder?.productionPlan?.salesOrder?.customer?.companyName ||
        row.workOrder?.productionPlan?.salesOrder?.customer?.name ||
        'N/A',
      cell: ({ row }) =>
        row.original.workOrder?.productionPlan?.salesOrder?.customer?.companyName ||
        row.original.workOrder?.productionPlan?.salesOrder?.customer?.name ||
        'N/A',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy HH:mm'),
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
          onClick={() => router.push(`/qc/${row.original.id}`)}
          className="h-8 gap-1"
        >
          <Eye className="h-4 w-4 text-gray-500" />
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <EntityHeader 
        title="Quality Control" 
        subtitle="Manage pending QC inspections for finished goods."
      />

      <div className="mt-6 space-y-4">
        <FilterBar 
          onSearch={setSearch}
          searchPlaceholder="Search work order or sales order..."
          hasActiveFilters={!!search}
          onClear={() => setSearch('')}
        />

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading inspections...</div>
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
