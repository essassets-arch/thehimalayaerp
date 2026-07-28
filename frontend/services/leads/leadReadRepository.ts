export interface LeadListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  leadStatus?: string;
  qualificationStatus?: string;
  assignedToId?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface LeadListResponse {
  data: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadReadRepository {
  listLeads(params?: LeadListParams): Promise<LeadListResponse>;
  getLead(leadId: string): Promise<any>;
  getLeadTimeline(leadId: string): Promise<any[]>;
}
