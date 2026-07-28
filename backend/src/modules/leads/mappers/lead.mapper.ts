import { Lead, LeadFollowup, LeadReminder } from '@prisma/client';
import { LeadResponseDto } from '../dto/lead-response.dto';

type LeadWithRelations = Lead & {
  followups?: LeadFollowup[];
  reminders?: LeadReminder[];
};

export class LeadMapper {
  static toDto(lead: LeadWithRelations): LeadResponseDto {
    return new LeadResponseDto({
      ...lead,
      estimatedQuantity: lead.estimatedQuantity ? Number(lead.estimatedQuantity) : undefined,
      followups: lead.followups || [],
      reminders: lead.reminders || [],
    });
  }
}
