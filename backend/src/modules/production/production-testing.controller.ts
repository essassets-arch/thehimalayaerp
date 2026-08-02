import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ProductionTestingService } from './production-testing.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('production/testing')
export class ProductionTestingController {
  constructor(private readonly testingService: ProductionTestingService) {}

  @Get()
  async listTestingRecords() {
    return this.testingService.listTestingRecords();
  }

  @Get(':id')
  async getTestingRecord(@Param('id') id: string) {
    return this.testingService.getTestingRecord(id);
  }

  @Post()
  async createTestingRecord(
    @Body() dto: { productName: string; quantity: number; status?: string },
  ) {
    return this.testingService.createTestingRecord(dto);
  }

  @Put(':id')
  async updateTestingRecord(
    @Param('id') id: string,
    @Body() dto: { productName?: string; quantity?: number; status?: string },
  ) {
    return this.testingService.updateTestingRecord(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; remarks?: string; reviewedBy?: string },
  ) {
    return this.testingService.updateStatus(id, dto);
  }

  @Delete(':id')
  async deleteTestingRecord(@Param('id') id: string) {
    return this.testingService.deleteTestingRecord(id);
  }
}
