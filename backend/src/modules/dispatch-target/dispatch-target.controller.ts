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
  Query,
} from '@nestjs/common';
import { DispatchTargetService } from './dispatch-target.service';
import { CreateDispatchTargetDto } from './dto/create-dispatch-target.dto';
import { UpdateDispatchTargetDto } from './dto/update-dispatch-target.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('dispatch-targets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DispatchTargetController {
  constructor(private readonly service: DispatchTargetService) {}

  @Post()
  @RequirePermissions(
    'super-admin',
    'dispatch.targets.create',
    'dispatch.targets.manage',
    'planthead.create',
    'plant-head.create',
  )
  async create(@Req() req, @Body() dto: CreateDispatchTargetDto) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.create(dto, userId);
    return { message: 'Dispatch target assigned successfully.', data };
  }

  @Get()
  @RequirePermissions(
    'super-admin',
    'dispatch.targets.read',
    'dispatch.targets.manage',
    'planthead.read',
    'plant-head.read',
    'logistics.dispatches.read',
    'dispatch.shipments.read',
  )
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get('achievement')
  async getAchievement(
    @Query('month') month?: string,
    @Query('period') period?: string,
    @Query('depot') depot?: string,
  ) {
    return this.service.getCurrentAchievement(month, period, depot);
  }

  @Get(':id')
  @RequirePermissions(
    'super-admin',
    'dispatch.targets.read',
    'dispatch.targets.manage',
    'planthead.read',
    'plant-head.read',
  )
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions(
    'super-admin',
    'dispatch.targets.update',
    'dispatch.targets.manage',
    'planthead.create',
    'plant-head.create',
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchTargetDto,
    @Req() req,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const data = await this.service.update(id, dto, userId);
    return { message: 'Dispatch target updated successfully.', data };
  }

  @Delete(':id')
  @RequirePermissions(
    'super-admin',
    'dispatch.targets.delete',
    'dispatch.targets.manage',
    'planthead.create',
    'plant-head.create',
  )
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
