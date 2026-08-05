'use client';
import React from 'react';
import { QuotationKanbanBoard } from './components/QuotationKanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function QuotationsPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage commercial offers and convert to orders.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Quotation
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <QuotationKanbanBoard />
      </div>
    </div>
  );
}
