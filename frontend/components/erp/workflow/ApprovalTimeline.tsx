'use client';

import React from 'react';
import { WorkflowTimeline } from './WorkflowTimeline';

interface ApprovalTimelineProps {
  entityType: string;
  entityId: string;
  className?: string;
}

export function ApprovalTimeline({ entityType, entityId, className }: ApprovalTimelineProps) {
  // In the future, this component can filter the generic workflow history 
  // to ONLY show approval-related transitions (e.g. SUBMITTED, APPROVED, REJECTED).
  // For now, it delegates to the full WorkflowTimeline.
  return <WorkflowTimeline entityType={entityType} entityId={entityId} className={className} />;
}
