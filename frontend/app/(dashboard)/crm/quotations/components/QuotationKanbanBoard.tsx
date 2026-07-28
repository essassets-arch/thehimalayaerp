'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { backendFetch } from '@/lib/backendFetch';

const COLUMNS = [
  { id: 'DRAFT', title: 'Draft', color: 'bg-slate-100 text-slate-800' },
  { id: 'INTERNAL_REVIEW', title: 'Review', color: 'bg-orange-100 text-orange-800' },
  { id: 'SENT', title: 'Sent', color: 'bg-blue-100 text-blue-800' },
  { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
  { id: 'APPROVED', title: 'Approved', color: 'bg-green-100 text-green-800' },
  { id: 'CONVERTED_TO_SO', title: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
];

export function QuotationKanbanBoard() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchQuotations = async () => {
    try {
      const data = await backendFetch<any[]>('/api/backend/crm/quotations');
      setQuotations(data);
    } catch (e) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('quotationId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStateCode: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('quotationId');
    if (!id) return;

    const quotation = quotations.find((q) => q.id === id);
    if (!quotation || quotation.workflowState?.code === targetStateCode) return;

    const actionMap: Record<string, string> = {
      'INTERNAL_REVIEW': 'SUBMIT_REVIEW',
      'SENT': 'SEND',
      'NEGOTIATION': 'NEGOTIATE',
      'APPROVED': 'APPROVE',
    };

    const action = actionMap[targetStateCode];
    if (!action) {
      toast.error('Invalid transition via drag and drop');
      return;
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, workflowState: { ...q.workflowState, code: targetStateCode } }
          : q
      )
    );

    try {
      await backendFetch(`/api/backend/crm/quotations/${id}/action`, {
        method: 'POST',
        body: { action, remarks: `Moved to ${targetStateCode}` },
      });
      toast.success('Quotation updated');
      fetchQuotations();
    } catch (e: any) {
      toast.error(e.message || 'Error updating quotation');
      fetchQuotations(); // Revert
    }
  };

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="flex min-w-[300px] max-w-[300px] flex-col rounded-lg bg-slate-50/50 p-3 border border-slate-100"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">{col.title}</h3>
            <Badge variant="outline" className={col.color}>
              {quotations.filter((q) => q.workflowState?.code === col.id).length}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-[200px]">
            {quotations
              .filter((q) => q.workflowState?.code === col.id)
              .map((quotation) => (
                <div
                  key={quotation.id}
                  draggable={col.id !== 'CONVERTED_TO_SO'} // Don't drag if already converted
                  onDragStart={(e) => handleDragStart(e, quotation.id)}
                  onClick={() => router.push(`/crm/quotations/${quotation.id}`)}
                  className={`cursor-grab active:cursor-grabbing ${col.id === 'CONVERTED_TO_SO' ? 'cursor-pointer' : ''}`}
                >
                  <Card className="hover:shadow-md transition-all hover:border-slate-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-bold text-slate-700">{quotation.quotationNumber}</div>
                        <Badge variant="secondary" className="text-xs font-mono">v{quotation.version}</Badge>
                      </div>
                      <div className="font-semibold truncate mb-1">
                        {quotation.lead?.companyName || 'Unknown Company'}
                      </div>
                      <div className="text-sm text-slate-500 font-mono">
                        ₹ {Number(quotation.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
