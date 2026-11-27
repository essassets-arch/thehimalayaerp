import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

const MACHINE_ADMIN_ROLES = [
  'Plant Head',
  'PLANT_HEAD',
  'Super Admin',
  'SUPER_ADMIN',
  'Production Manager',
  'PRODUCTION_MANAGER',
  'PRODUCTION_PLANNER',
];

const MACHINE_DELETE_ROLES = [
  'Plant Head',
  'PLANT_HEAD',
  'Super Admin',
  'SUPER_ADMIN',
];

@Controller('machines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
  @Roles(...MACHINE_ADMIN_ROLES)
  async create(@Body() createMachineDto: CreateMachineDto) {
    return this.machineService.create(createMachineDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.machineService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.machineService.findOne(parseInt(id, 10));
  }

  @Put(':id')
  @Roles(...MACHINE_ADMIN_ROLES)
  async update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machineService.update(parseInt(id, 10), updateMachineDto);
  }

  @Delete(':id')
  @Roles(...MACHINE_DELETE_ROLES)
  async remove(@Param('id') id: string) {
    return this.machineService.remove(parseInt(id, 10));
  }
}
