import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { RequestSalesReturnDto } from './dto/request-sales-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sales-returns')
@UseGuards(JwtAuthGuard)
export class SalesReturnsController {
  constructor(private readonly returnsService: SalesReturnsService) {}

  @Post()
  requestReturn(@Body() requestDto: RequestSalesReturnDto, @Req() req: any) {
    const userId = req.user.id;
    return this.returnsService.requestReturn(requestDto, userId);
  }

  @Get()
  findAll() {
    return this.returnsService.findAll();
  }
}
