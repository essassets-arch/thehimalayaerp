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
import { ProductionTargetService } from './production-target.service';
import { CreateProductionTargetDto } from './dto/create-production-target.dto';
import { UpdateProductionTargetDto } from './dto/update-production-target.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('production-targets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionTargetController {
  constructor(private readonly service: ProductionTargetService) {}

  @Post()
  @RequirePermissions('super-admin')
  async create(@Req() req, @Body() dto: CreateProductionTargetDto) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.create(dto, userId);
    return { message: 'Production target assigned successfully.', data };
  }

  @Get()
  @RequirePermissions('super-admin')
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get('achievement')
  async getAchievement() {
    return this.service.getCurrentAchievement();
  }

  @Get(':id')
  @RequirePermissions('super-admin')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions('super-admin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductionTargetDto,
    @Req() req,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.update(id, dto, userId);
    return { message: 'Production target updated successfully.', data };
  }

  @Delete(':id')
  @RequirePermissions('super-admin')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
