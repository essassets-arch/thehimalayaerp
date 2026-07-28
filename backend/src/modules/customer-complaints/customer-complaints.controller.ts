import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { CustomerComplaintsService } from './customer-complaints.service';
import { CreateCustomerComplaintDto } from './dto/create-customer-complaint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('customer-complaints')
@UseGuards(JwtAuthGuard)
export class CustomerComplaintsController {
  constructor(private readonly complaintsService: CustomerComplaintsService) {}

  @Post()
  create(@Body() createDto: CreateCustomerComplaintDto, @Req() req: any) {
    const userId = req.user.id;
    return this.complaintsService.create(createDto, userId);
  }

  @Get()
  findAll() {
    return this.complaintsService.findAll();
  }
}
