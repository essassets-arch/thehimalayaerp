import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('transactions')
  createTransaction(@CurrentUser() user: any, @Body() dto: CreateInventoryTransactionDto) {
    return this.inventoryService.createTransaction(user.companyId, dto);
  }

  @Get('transactions')
  getTransactions(
    @CurrentUser() user: any,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string
  ) {
    return this.inventoryService.getTransactions(user.companyId, productId, warehouseId);
  }

  @Get('stock-levels')
  getStockLevels(
    @CurrentUser() user: any,
    @Query('warehouseId') warehouseId?: string
  ) {
    return this.inventoryService.getStockLevels(user.companyId, warehouseId);
  }
}
