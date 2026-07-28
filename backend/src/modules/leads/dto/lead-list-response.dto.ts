import { LeadResponseDto } from './lead-response.dto';

export class LeadListResponseDto {
  data: LeadResponseDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
