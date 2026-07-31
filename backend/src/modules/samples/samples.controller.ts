import { Controller, Get, Post, Body, Patch, Param, Headers, Request, UnauthorizedException, BadRequestException, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(['samples', 'sales/samples'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  private extractAuthData(req: any, headers: any) {
    const companyId = headers['x-company-id'] || req.user?.companyId;
    const userId = req.user?.sub || req.user?.id || 'system';

    if (!companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    return { companyId, userId };
  }

  @Post()
  async create(@Body() createSampleDto: CreateSampleDto, @Request() req, @Headers() headers) {
    const { companyId, userId } = this.extractAuthData(req, headers);
    createSampleDto.companyId = companyId;
    return this.samplesService.create(createSampleDto, userId);
  }

  @Get()
  async findAll(@Request() req, @Headers() headers) {
    const { companyId } = this.extractAuthData(req, headers);
    return this.samplesService.findAll(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req, @Headers() headers) {
    const { companyId } = this.extractAuthData(req, headers);
    return this.samplesService.findOne(id, companyId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Request() req,
    @Headers() headers
  ) {
    const { companyId, userId } = this.extractAuthData(req, headers);
    return this.samplesService.update(id, companyId, updateSampleDto, userId);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SampleStatus, expectedVersion: number },
    @Request() req,
    @Headers() headers
  ) {
    if (!body.status || !body.expectedVersion) {
      throw new BadRequestException('status and expectedVersion are required');
    }
    const { companyId, userId } = this.extractAuthData(req, headers);
    return this.samplesService.updateStatus(id, companyId, body.status, body.expectedVersion, userId);
  }
}
