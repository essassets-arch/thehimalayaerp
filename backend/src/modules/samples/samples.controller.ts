import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Headers,
  Request,
  UnauthorizedException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller(['samples', 'sales/samples'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  private extractAuthData(req: any, headers: any) {
    const companyId =
      headers['x-company-id'] ||
      req.user?.companyId ||
      'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
    const userId =
      req.user?.sub || req.user?.id || 'a6605e65-beca-40f2-a19f-8e451e270867';
    const role = req.user?.role || 'admin';

    if (!companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    return { companyId, userId, role };
  }

  @RequirePermissions('admin.samples.create')
  @Post()
  async create(
    @Body() createSampleDto: CreateSampleDto,
    @Request() req,
    @Headers() headers,
  ) {
    const { companyId, userId } = this.extractAuthData(req, headers);
    createSampleDto.companyId = companyId;
    try {
      return await this.samplesService.create(createSampleDto, userId);
    } catch (error) {
      console.error('CREATE SAMPLE FAILED:', error);
      throw error;
    }
  }

  @RequirePermissions('admin.samples.read')
  @Get()
  async findAll(@Request() req, @Headers() headers) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    return this.samplesService.findAll(companyId, userId, role);
  }

  @RequirePermissions('admin.samples.read')
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req, @Headers() headers) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    return this.samplesService.findOne(id, companyId, userId, role);
  }

  @RequirePermissions('admin.samples.update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Request() req,
    @Headers() headers,
  ) {
    const { companyId, userId, role } = this.extractAuthData(req, headers);
    return this.samplesService.update(
      id,
      companyId,
      updateSampleDto,
      userId,
      role,
    );
  }

  @RequirePermissions('admin.samples.create')
  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: SampleStatus;
      expectedVersion: number;
      extraData?: Record<string, any>;
    },
    @Request() req,
    @Headers() headers,
  ) {
    if (!body.status || !body.expectedVersion) {
      throw new BadRequestException('status and expectedVersion are required');
    }
    const { companyId, userId } = this.extractAuthData(req, headers);
    return this.samplesService.updateStatus(
      id,
      companyId,
      body.status,
      body.expectedVersion,
      userId,
    );
  }
}
