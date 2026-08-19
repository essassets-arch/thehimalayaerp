import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SalesTargetService } from './sales-target.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('sales-targets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesTargetController {
  constructor(private readonly service: SalesTargetService) {}

  @Post()
  @RequirePermissions('sales.targets.create', 'super-admin')
  async create(@Req() req, @Body() dto: CreateSalesTargetDto) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.create(dto, userId);
    return { message: 'Sales target created successfully.', data };
  }

  @Get()
  @RequirePermissions('sales.targets.read', 'super-admin')
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get('dashboard')
  @RequirePermissions('sales.targets.read', 'sales.orders.read')
  async dashboard(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    return this.service.dashboard(userId, role);
  }

  @Get('history')
  @RequirePermissions('sales.targets.read', 'sales.orders.read')
  async history(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.history(userId);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions('sales.targets.update', 'super-admin')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateSalesTargetDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.update(id, dto, userId);
    return { message: 'Sales target updated successfully.', data };
  }

  @Delete(':id')
  @RequirePermissions('sales.targets.delete', 'super-admin')
  async delete(@Req() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    await this.service.softDelete(id, userId);
    return { message: 'Sales target cancelled successfully.' };
  }
}
