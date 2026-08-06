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
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Controller('machines')
@UseGuards(JwtAuthGuard)
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
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
  async update(
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machineService.update(parseInt(id, 10), updateMachineDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.machineService.remove(parseInt(id, 10));
  }
}
