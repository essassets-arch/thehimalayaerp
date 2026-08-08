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

  @RequirePermissions('production.productiontesting.read', 'production.testing.read', 'production.floor.read', 'production.qc.read', 'production.productionworkflow.read', 'plant-head.testing.read', 'planthead.read', 'plant-head.read', 'planthead.testing.read')
  @Get()
  async listTestingRecords() {
    const data = await this.testingService.listTestingRecords();
    return { success: true, data };
  }

  @RequirePermissions('production.productiontesting.read', 'production.testing.read', 'production.floor.read', 'production.qc.read', 'production.productionworkflow.read', 'plant-head.testing.read', 'planthead.read', 'plant-head.read', 'planthead.testing.read')
  @Get(':id')
  async getTestingRecord(@Param('id') id: string) {
    const data = await this.testingService.getTestingRecord(id);
    return { success: true, data };
  }

  @RequirePermissions('production.productiontesting.create', 'production.testing.create', 'production.floor.create', 'production.floor.read', 'production.qc.approve')
  @Post()
  async createTestingRecord(
    @Body() dto: { productName: string; quantity: number; status?: string; remarks?: string; testedBy?: string },
    @Req() req: any,
  ) {
    const data = await this.testingService.createTestingRecord(
      dto,
      req.user?.sub || 'system',
    );
    return { success: true, data };
  }

  @RequirePermissions('production.productiontesting.update', 'production.testing.update', 'production.floor.create', 'plant-head.testing.read', 'planthead.read', 'plant-head.read', 'planthead.testing.read')
  @Put(':id')
  async updateTestingRecord(
    @Param('id') id: string,
    @Body() dto: { productName?: string; quantity?: number; status?: string; remarks?: string },
  ) {
    const data = await this.testingService.updateTestingRecord(id, dto);
    return { success: true, data };
  }

  @RequirePermissions('production.productiontesting.update', 'production.testing.update', 'production.floor.create', 'plant-head.testing.read', 'planthead.read', 'plant-head.read', 'planthead.testing.read')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; remarks?: string; reviewedBy?: string },
  ) {
    const data = await this.testingService.updateStatus(id, dto);
    return { success: true, data };
  }

  @RequirePermissions('production.productiontesting.delete', 'production.testing.delete', 'production.floor.create')
  @Delete(':id')
  async deleteTestingRecord(@Param('id') id: string) {
    const data = await this.testingService.deleteTestingRecord(id);
    return { success: true, data };
  }
}
