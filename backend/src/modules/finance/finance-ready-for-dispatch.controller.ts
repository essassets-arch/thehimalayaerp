import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  FinanceReadyForDispatchService,
  ReadyForDispatchQueryDto,
} from './finance-ready-for-dispatch.service';

@Controller('finance/ready-for-dispatch')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceReadyForDispatchController {
  constructor(
    private readonly readyForDispatchService: FinanceReadyForDispatchService,
  ) {}

  @Get()
  @RequirePermissions(
    'finance.ready-for-dispatch.read',
    'finance.read',
    'finance.reports.read',
    'finance.invoice.read',
    'finance.invoices.read',
    'finance.ledger.read',
    'sales.orders.read',
  )
  async getReadyForDispatchOrders(
    @Query() query: ReadyForDispatchQueryDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    // Avoid stale caching for dispatch-sensitive operational views
    res.set({
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    });

    return this.readyForDispatchService.getReadyForDispatchOrders(
      req.user,
      query,
    );
  }
}
