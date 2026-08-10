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
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequirePermissions('admin.products.create', 'products.create', 'store.materials.create', 'store.create', 'inventory.inventory.create', 'products.read', 'inventory.stock.read')
  @Post()
  create(@CurrentUser() user: any, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user.companyId, createProductDto);
  }

  @RequirePermissions('admin.products.read', 'products.read', 'store.read', 'store.materials.read', 'store.rawinventory.read', 'inventory.stock.read')
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('scope') scope?: string,
    @Query('type') type?: string,
  ) {
    return this.productsService.findAll(user.companyId, search, scope, type, user.sub || user.id, user.role);
  }

  @RequirePermissions('admin.products.read', 'products.read', 'store.read', 'store.materials.read', 'store.rawinventory.read', 'inventory.stock.read')
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.findOne(user.companyId, id);
  }

  @RequirePermissions('admin.products.update', 'products.update', 'store.materials.update', 'store.update', 'products.read', 'inventory.stock.read')
  @Patch(':id')
  @Put(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(user.companyId, id, updateProductDto);
  }

  @RequirePermissions('admin.products.update', 'admin.products.delete', 'products.update', 'products.delete', 'products.read', 'inventory.stock.read')
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.remove(user.companyId, id);
  }
}
