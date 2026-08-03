'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Wait, I should import Button from ui/button
import { toast } from 'sonner';
import { backendFetch } from '@/lib/backendFetch';

const COLUMNS = [
  { id: 'NEW', title: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'REQUIREMENT_IDENTIFIED', title: 'Requirement Identified', color: 'bg-purple-100 text-purple-800' },
  { id: 'QUOTATION_SENT', title: 'Quotation Sent', color: 'bg-pink-100 text-pink-800' },
  { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { id: 'WON', title: 'Won', color: 'bg-green-100 text-green-800' },
  { id: 'LOST', title: 'Lost', color: 'bg-red-100 text-red-800' },
];

export function KanbanBoard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLeads = async () => {
    try {
      const data = await backendFetch<any[]>('/api/backend/crm/leads');
      setLeads(data);
    } catch (e) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStateCode: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.workflowState?.code === targetStateCode) return;

    // Very naive mapping of targetState to actionName
    const actionMap: Record<string, string> = {
      'CONTACTED': 'CONTACT',
      'REQUIREMENT_IDENTIFIED': 'IDENTIFY_REQ',
      'QUOTATION_SENT': 'SEND_QUOTE',
      'NEGOTIATION': 'NEGOTIATE',
      'WON': 'WON',
      'LOST': 'LOST'
    };

    const action = actionMap[targetStateCode];
    if (!action) {
      toast.error('Invalid transition via drag and drop');
      return;
    }

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, workflowState: { ...l.workflowState, code: targetStateCode } }
          : l
      )
    );

    try {
      await backendFetch(`/api/backend/crm/leads/${leadId}/action`, {
        method: 'POST',
        body: { action, remarks: `Moved to ${targetStateCode} via Kanban` },
      });
      toast.success('Lead updated successfully');
      fetchLeads();
    } catch (e: any) {
      toast.error(e.message || 'Error updating lead');
      fetchLeads(); // Revert on failure
    }
  };

  if (loading) return <div>Loading Kanban...</div>;

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="flex min-w-[300px] max-w-[300px] flex-col rounded-lg bg-slate-50/50 p-3"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">{col.title}</h3>
            <Badge variant="outline" className={col.color}>
              {leads.filter((l) => l.workflowState?.code === col.id).length}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-[200px]">
            {leads
              .filter((l) => l.workflowState?.code === col.id)
              .map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => router.push(`/crm/leads/${lead.id}`)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-slate-500">{lead.leadNumber}</div>
                      <div className="mt-1 font-semibold">{lead.companyName}</div>
                      <div className="text-sm text-slate-600">{lead.contactPerson}</div>
                      {lead.activities?.length > 0 && lead.activities[0].scheduledAt && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-1 rounded inline-block">
                          Follow-up: {new Date(lead.activities[0].scheduledAt).toLocaleDateString()}
                        </div>
                      )}
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
