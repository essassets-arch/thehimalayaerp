import { SalesOrderResponseDto } from './sales-order-response.dto';

export interface SalesOrderListResponseDto {
  data: SalesOrderResponseDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
