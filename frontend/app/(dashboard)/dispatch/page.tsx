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

interface Dispatch {
  id: string;
  dispatchNo: string;
  salesOrder: {
    orderNumber: string;
    customer: { companyName: string }
  };
  createdAt: string;
  workflowState: {
    name: string;
  } | null;
  status: string; // fallback
}

export default function DispatchListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['dispatch-list', search, pagination],
    queryFn: async () => {
      const res = await axios.get('/api/backend/logistics/dispatches');
      return res.data;
    }
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((d: Dispatch) => 
      d.dispatchNo.toLowerCase().includes(lower) || 
      d.salesOrder?.orderNumber.toLowerCase().includes(lower) ||
      d.salesOrder?.customer?.companyName.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: 'dispatchNo',
      header: 'Dispatch No',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('dispatchNo')}</span>,
    },
    {
      accessorKey: 'salesOrder.orderNumber',
      header: 'Sales Order',
      cell: ({ row }) => row.original.salesOrder?.orderNumber || 'N/A'
    },
    {
      accessorKey: 'salesOrder.customer.companyName',
      header: 'Customer',
      cell: ({ row }) => row.original.salesOrder?.customer?.companyName || 'N/A'
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
          onClick={() => router.push(`/dispatch/${row.original.id}`)}
          className="h-8 gap-1"
        >
          <Eye className="h-4 w-4 text-gray-500" />
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <EntityHeader 
        title="Dispatch Dashboard" 
        subtitle="Manage logistics, trucks, and deliveries."
        actions={
          <Button onClick={() => router.push('/dispatch/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dispatch
          </Button>
        }
      />

      <div className="mt-6 space-y-4">
        <FilterBar 
          onSearch={setSearch}
          searchPlaceholder="Search dispatch no or customer..."
          hasActiveFilters={!!search}
          onClear={() => setSearch('')}
        />

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading dispatches...</div>
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
