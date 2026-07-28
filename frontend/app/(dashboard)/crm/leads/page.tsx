import React from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header'; // Might exist or not, I'll build a standard header

export default function LeadsPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads Pipeline</h2>
          <p className="text-muted-foreground">Manage customer acquisition and follow-ups.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
