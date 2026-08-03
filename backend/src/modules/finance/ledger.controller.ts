import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/ledger')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':customerId')
  @RequirePermissions('finance.ledger.read')
  async getCustomerLedger(@Param('customerId') customerId: string) {
    return this.ledgerService.getCustomerLedger(customerId);
  }
}
