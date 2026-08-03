import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Param, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @RequirePermissions('procurement.suppliers.read')
  @Get()
  findAll(@CurrentUser() user: any, @Query('search') search?: string) {
    return this.suppliersService.findAll(user.companyId, search);
  }

  @RequirePermissions('procurement.suppliers.read')
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.findOne(user.companyId, id);
  }
}
