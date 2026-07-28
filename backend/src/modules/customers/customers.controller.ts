import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Controller('sales/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('sales.customers.create')
  @UseInterceptors(IdempotencyInterceptor)
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.customersService.create(
      createCustomerDto,
      user.sub || user.userId,
      req.requestId,
    );
  }

  @Get()
  @Permissions('sales.customers.read')
  findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(25), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ) {
    return this.customersService.list(user.companyId, page, pageSize, search);
  }

  @Get('check-duplicates')
  @Permissions('sales.customers.read')
  checkDuplicates(
    @CurrentUser() user: any,
    @Query('gstin') gstin?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('companyName') companyName?: string,
  ) {
    return this.customersService.checkDuplicates(
      user.companyId,
      gstin,
      email,
      phone,
      companyName,
    );
  }

  @Get(':id')
  @Permissions('sales.customers.read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.getById(id, user.companyId);
  }

  @Patch(':id')
  @Permissions('sales.customers.update')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.customersService.update(
      id,
      user.companyId,
      updateCustomerDto,
      user.sub || user.userId,
      req.requestId,
    );
  }

  @Post(':id/deactivate')
  @Permissions('sales.customers.update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(IdempotencyInterceptor)
  deactivate(
    @Param('id') id: string,
    @Body('expectedVersion', ParseIntPipe) expectedVersion: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.customersService.deactivate(
      id,
      user.companyId,
      expectedVersion,
      user.sub || user.userId,
      req.requestId,
    );
  }

  @Post(':id/restore')
  @Permissions('sales.customers.update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(IdempotencyInterceptor)
  restore(
    @Param('id') id: string,
    @Body('expectedVersion', ParseIntPipe) expectedVersion: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.customersService.restore(
      id,
      user.companyId,
      expectedVersion,
      user.sub || user.userId,
      req.requestId,
    );
  }
}
