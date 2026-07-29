import { Controller, Post, Patch, Param, Body, Get, Req, UseGuards } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { RequestSalesReturnDto } from './dto/request-sales-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sales-returns')
@UseGuards(JwtAuthGuard)
export class SalesReturnsController {
  constructor(private readonly returnsService: SalesReturnsService) {}

  @Post()
  requestReturn(@Body() requestDto: RequestSalesReturnDto, @Req() req: any) {
    const userId = req.user.id ?? req.user.sub;
    return this.returnsService.requestReturn(requestDto, userId);
  }

  @Get()
  findAll() {
    return this.returnsService.findAll();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.returnsService.approve(id, body, req.user.id ?? req.user.sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.returnsService.reject(id, body, req.user.id ?? req.user.sub);
  }

  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() body: any) {
    return this.returnsService.dispatch(id, body);
  }

  @Patch(':id/in-transit')
  inTransit(@Param('id') id: string) {
    return this.returnsService.inTransit(id);
  }

  @Patch(':id/deliver')
  deliver(@Param('id') id: string, @Body() body: any) {
    return this.returnsService.deliver(id, body);
  }
}
