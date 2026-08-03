import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @RequirePermissions('inventory.warehouses.create')
  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createWarehouseDto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(user.companyId, createWarehouseDto);
  }

  @RequirePermissions('inventory.warehouses.read')
  @Get()
  findAll(@CurrentUser() user: any, @Query('search') search?: string) {
    return this.warehousesService.findAll(user.companyId, search);
  }

  @RequirePermissions('inventory.warehouses.read')
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.warehousesService.findOne(user.companyId, id);
  }

  @RequirePermissions('inventory.warehouses.update')
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(
      user.companyId,
      id,
      updateWarehouseDto,
    );
  }
}
