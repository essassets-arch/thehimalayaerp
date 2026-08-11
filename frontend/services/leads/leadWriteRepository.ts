export interface WriteRequestOptions {
  idempotencyKey?: string;
}

export interface CreateLeadInput {
  leadDate?: string | Date;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  source?: string;
  productInterest?: string;
  estimatedQuantity?: number;
  unit?: string;
  remarks?: string;
  assignedToId?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  expectedVersion: number;
}

export interface TransitionLeadInput {
  expectedVersion: number;
  remarks?: string;
  qualificationStatus?: string;
}

export interface AddLeadFollowupInput {
  followupType: string;
  notes: string;
  nextActionAt?: string;
  expectedVersion: number;
}

export interface AddLeadReminderInput {
  reminderAt: string;
  message?: string;
  expectedVersion: number;
}

export interface MarkLeadLostInput {
  lostReason: string;
  expectedVersion: number;
}

export interface LeadWriteRepository {
  createLead(input: CreateLeadInput, options?: WriteRequestOptions): Promise<any>;
  updateLead(leadId: string, input: UpdateLeadInput, options?: WriteRequestOptions): Promise<any>;
  qualifyLead(leadId: string, input: TransitionLeadInput, options?: WriteRequestOptions): Promise<any>;
  addFollowup(leadId: string, input: AddLeadFollowupInput, options?: WriteRequestOptions): Promise<any>;
  addReminder(leadId: string, input: AddLeadReminderInput, options?: WriteRequestOptions): Promise<any>;
  markLost(leadId: string, input: MarkLeadLostInput, options?: WriteRequestOptions): Promise<any>;
  restoreLead(leadId: string, input: TransitionLeadInput, options?: WriteRequestOptions): Promise<any>;
}
