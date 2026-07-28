import { Lead, LeadFollowup, LeadReminder } from '@prisma/client';

export class LeadResponseDto {
  constructor(partial: Partial<Lead>) {
    Object.assign(this, partial);
    // Convert decimal to number for JSON response
    if (this.estimatedQuantity) {
      this.estimatedQuantity = Number(this.estimatedQuantity);
    }
  }
  estimatedQuantity?: number;
  followups?: LeadFollowup[];
  reminders?: LeadReminder[];
}
