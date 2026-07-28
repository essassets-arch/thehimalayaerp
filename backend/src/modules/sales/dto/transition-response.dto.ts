import { SalesOrderResponseDto } from './sales-order-response.dto';

export class TransitionResponseDto {
  success: boolean;
  message: string;
  order: SalesOrderResponseDto;
}
