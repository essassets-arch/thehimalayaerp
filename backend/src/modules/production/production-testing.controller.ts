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
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ProductionTestingService } from './production-testing.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('production/testing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionTestingController {
  constructor(private readonly testingService: ProductionTestingService) {}

  @RequirePermissions('production.productiontesting.read')
  @Get()
  async listTestingRecords() {
    return this.testingService.listTestingRecords();
  }

  @RequirePermissions('production.productiontesting.read')
  @Get(':id')
  async getTestingRecord(@Param('id') id: string) {
    return this.testingService.getTestingRecord(id);
  }

  @RequirePermissions('production.productiontesting.create')
  @Post()
  async createTestingRecord(
    @Body() dto: { productName: string; quantity: number; status?: string },
  ) {
    return this.testingService.createTestingRecord(dto);
  }

  @RequirePermissions('production.productiontesting.update')
  @Put(':id')
  async updateTestingRecord(
    @Param('id') id: string,
    @Body() dto: { productName?: string; quantity?: number; status?: string },
  ) {
    return this.testingService.updateTestingRecord(id, dto);
  }

  @RequirePermissions('production.productiontesting.update')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; remarks?: string; reviewedBy?: string },
  ) {
    return this.testingService.updateStatus(id, dto);
  }

  @RequirePermissions('production.productiontesting.delete')
  @Delete(':id')
  async deleteTestingRecord(@Param('id') id: string) {
    return this.testingService.deleteTestingRecord(id);
  }
}
