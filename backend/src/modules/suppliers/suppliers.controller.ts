import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['suppliers', 'purchase/vendors', 'vendors', 'procurement/suppliers'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @RequirePermissions('procurement.suppliers.read')
  @Get()
  findAll(@CurrentUser() user: any, @Query('search') search?: string) {
    return this.suppliersService.findAll(user?.companyId, search);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.findOne(user?.companyId, id);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.suppliersService.create(user?.companyId, dto);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.suppliersService.update(user?.companyId, id, dto);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Patch(':id')
  patch(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.suppliersService.update(user?.companyId, id, dto);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.remove(user?.companyId, id);
  }
}
