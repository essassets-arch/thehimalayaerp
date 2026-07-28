import { LeadStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export class LeadTransitionPolicy {
  private static readonly ALLOWED_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
    NEW: [LeadStatus.QUALIFIED, LeadStatus.LOST, LeadStatus.CANCELLED],
    QUALIFIED: [LeadStatus.SAMPLE_REQUIRED, LeadStatus.QUOTATION_DRAFT, LeadStatus.LOST, LeadStatus.CANCELLED],
    SAMPLE_REQUIRED: [LeadStatus.SAMPLE_IN_PROGRESS, LeadStatus.LOST, LeadStatus.CANCELLED],
    SAMPLE_IN_PROGRESS: [LeadStatus.SAMPLE_APPROVED, LeadStatus.LOST, LeadStatus.CANCELLED],
    SAMPLE_APPROVED: [LeadStatus.QUOTATION_DRAFT, LeadStatus.LOST, LeadStatus.CANCELLED],
    QUOTATION_DRAFT: [LeadStatus.QUOTATION_SENT, LeadStatus.LOST, LeadStatus.CANCELLED],
    QUOTATION_SENT: [LeadStatus.QUOTATION_ACCEPTED, LeadStatus.LOST, LeadStatus.CANCELLED],
    QUOTATION_ACCEPTED: [LeadStatus.CONVERTED, LeadStatus.LOST, LeadStatus.CANCELLED],
    CONVERTED: [], // Terminal state, no further lead transitions
    LOST: [LeadStatus.NEW, LeadStatus.QUALIFIED], // Restore path
    CANCELLED: [], // Terminal state
  };

  static assertCanTransition(currentStatus: LeadStatus, newStatus: LeadStatus): void {
    if (currentStatus === newStatus) return; // No status change is fine
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`INVALID_TRANSITION: Cannot transition Lead from ${currentStatus} to ${newStatus}`);
    }
  }
}
