import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards, Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions('inventory.inventory.create')
  @Post('transactions')
  createTransaction(
    @CurrentUser() user: any,
    @Body() dto: CreateInventoryTransactionDto,
  ) {
    return this.inventoryService.createTransaction(user.companyId, dto);
  }

  @RequirePermissions('inventory.inventory.read', 'store.inventory.read', 'store.read', 'store.view', 'store.materials.read', 'store.rawinventory.read', 'inventory.read', 'store.dashboard.read', 'logistics.dispatches.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read')
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

  @RequirePermissions('inventory.inventory.read', 'store.inventory.read', 'store.read', 'store.view', 'store.materials.read', 'store.rawinventory.read', 'inventory.read', 'store.dashboard.read', 'logistics.dispatches.read', 'admin.planthead.read', 'planthead.read', 'plant-head.read')
  @Get('stock-levels')
  getStockLevels(
    @CurrentUser() user: any,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getStockLevels(user.companyId, warehouseId);
  }

  @Get('items')
  getItems() {
    return this.inventoryService.getItems();
  }

  @RequirePermissions('inventory.inventory.update', 'store.inventory.update')
  @Patch('items/:id')
  updateItemBalance(
    @Param('id') id: string,
    @Body('balance') balance: number,
  ) {
    return this.inventoryService.updateItemBalance(id, balance);
  }
}
