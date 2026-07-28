import { Controller, Get, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':customerId')
  @Permissions('finance.ledger.read')
  async getCustomerLedger(@Param('customerId') customerId: string) {
    return this.ledgerService.getCustomerLedger(customerId);
  }
}
