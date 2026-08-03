import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { RequestSalesReturnDto } from './dto/request-sales-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sales-returns')
@UseGuards(JwtAuthGuard)
export class SalesReturnsController {
  constructor(private readonly returnsService: SalesReturnsService) {}

  @RequirePermissions('sales.salesreturns.create')
  @Post()
  requestReturn(@Body() requestDto: RequestSalesReturnDto, @Req() req: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.returnsService.requestReturn(requestDto, userId);
  }

  @RequirePermissions('sales.salesreturns.read')
  @Get()
  findAll(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.returnsService.findAll(companyId);
  }

  @RequirePermissions('sales.salesreturns.approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.returnsService.approve(id, body, req.user.id ?? req.user.sub);
  }

  @RequirePermissions('sales.salesreturns.reject')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.returnsService.reject(id, body, req.user.id ?? req.user.sub);
  }

  @RequirePermissions('sales.salesreturns.update')
  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() body: any) {
    return this.returnsService.dispatch(id, body);
  }

  @RequirePermissions('sales.salesreturns.update')
  @Patch(':id/in-transit')
  inTransit(@Param('id') id: string) {
    return this.returnsService.inTransit(id);
  }

  @RequirePermissions('sales.salesreturns.update')
  @Patch(':id/deliver')
  deliver(@Param('id') id: string, @Body() body: any) {
    return this.returnsService.deliver(id, body);
  }
}
