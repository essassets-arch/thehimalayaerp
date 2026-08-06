import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MachineStatusService } from './machine-status.service';
import { SaveMachineStatusDto } from './dto/save-machine-status.dto';

@Controller('machine-status')
@UseGuards(JwtAuthGuard)
export class MachineStatusController {
  constructor(private readonly machineStatusService: MachineStatusService) {}

  @Get()
  async getDailyStatus(@Query('date') date: string) {
    // If no date parameter is supplied, default to today's date in local YYYY-MM-DD
    const dateQuery = date || new Date().toLocaleDateString('en-CA');
    return this.machineStatusService.getDailyStatus(dateQuery);
  }

  @Post()
  async saveDailyStatus(
    @Body() saveMachineStatusDto: SaveMachineStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    return this.machineStatusService.saveDailyStatus(saveMachineStatusDto, userId);
  }
}
