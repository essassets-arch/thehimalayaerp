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
  Body,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['inventory', 'store'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions(
    'inventory.inventory.create',
    'inventory.create',
    'store.inventory.create',
    'store.create',
    'store.materials.create',
    'procurement.grns.create',
    'inventory.stock.read',
    'store.read',
    'store.rawinventory.read',
    'planthead.read',
    'plant-head.read',
  )
  @Post(['transactions', 'stock-transaction'])
  createTransaction(
    @CurrentUser() user: any,
    @Body() dto: CreateInventoryTransactionDto,
  ) {
    return this.inventoryService.createTransaction(user.companyId, dto);
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'logistics.dispatches.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('transactions')
  getTransactions(
    @CurrentUser() user: any,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getTransactions(
      user.companyId,
      productId,
      warehouseId,
    );
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'logistics.dispatches.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('material-log/:identifier')
  getMaterialMovementLog(
    @CurrentUser() user: any,
    @Param('identifier') identifier: string,
  ) {
    return this.inventoryService.getMaterialMovementLog(
      user.companyId,
      identifier,
    );
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'logistics.dispatches.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('raw-material-snapshot')
  getRawMaterialSnapshot(@CurrentUser() user: any) {
    return this.inventoryService.getRawMaterialSnapshot(user.companyId);
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'logistics.dispatches.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('stock-levels')
  getStockLevels(
    @CurrentUser() user: any,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getStockLevels(user.companyId, warehouseId);
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('dashboard')
  getDashboardData(@CurrentUser() user: any) {
    return this.inventoryService.getDashboardData(user.companyId);
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'inventory.read',
    'inventory.stock.read',
    'store.dashboard.read',
    'admin.planthead.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('low-stock')
  getLowStockItems(@CurrentUser() user: any) {
    return this.inventoryService.getLowStockItems(user.companyId);
  }

  @Get('items')
  getItems() {
    return this.inventoryService.getItems();
  }

  @RequirePermissions('inventory.inventory.update', 'store.inventory.update')
  @Patch('items/:id')
  updateItemBalance(@Param('id') id: string, @Body('balance') balance: number) {
    return this.inventoryService.updateItemBalance(id, balance);
  }

  @RequirePermissions(
    'inventory.inventory.delete',
    'inventory.delete',
    'store.inventory.delete',
    'store.delete',
    'store.materials.delete',
    'admin.products.delete',
    'products.delete',
    'products.read',
    'store.read',
  )
  @Delete('raw-materials/clear-all')
  clearAllRawMaterials(@CurrentUser() user: any) {
    return this.inventoryService.clearAllRawMaterials(user.companyId);
  }

  @RequirePermissions(
    'inventory.inventory.read',
    'store.inventory.read',
    'store.read',
    'store.view',
    'store.materials.read',
    'store.rawinventory.read',
    'planthead.read',
    'plant-head.read',
  )
  @Get('raw-materials')
  getRawMaterials(@CurrentUser() user: any) {
    return this.inventoryService.getRawMaterialSnapshot(user.companyId);
  }

  @RequirePermissions(
    'inventory.inventory.create',
    'inventory.create',
    'store.inventory.create',
    'store.create',
    'store.materials.create',
    'admin.products.create',
    'products.create',
    'planthead.create',
    'plant-head.create',
  )
  @Post('raw-materials')
  createRawMaterial(@CurrentUser() user: any, @Body() body: any) {
    return this.inventoryService.createRawMaterial(user.companyId, body);
  }

  @RequirePermissions(
    'inventory.inventory.update',
    'inventory.update',
    'store.inventory.update',
    'store.update',
    'store.materials.update',
    'admin.products.update',
    'products.update',
    'planthead.update',
    'plant-head.update',
  )
  @Put('raw-materials/:id')
  @Patch('raw-materials/:id')
  updateRawMaterial(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.inventoryService.updateRawMaterial(user.companyId, id, body);
  }

  @RequirePermissions(
    'inventory.inventory.delete',
    'inventory.delete',
    'store.inventory.delete',
    'store.delete',
    'store.materials.delete',
    'admin.products.delete',
    'products.delete',
    'products.read',
    'store.read',
  )
  @Delete('raw-materials/:id')
  deleteRawMaterial(@CurrentUser() user: any, @Param('id') id: string) {
    return this.inventoryService.deleteRawMaterial(user.companyId, id);
  }
}
