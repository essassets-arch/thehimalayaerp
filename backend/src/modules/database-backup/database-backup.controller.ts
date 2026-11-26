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
  Res,
  HttpStatus,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { DatabaseBackupService } from './database-backup.service';
import { UpdateBackupSettingsDto } from './dto/backup-settings.dto';
import { CreateBackupRecipientDto } from './dto/create-recipient.dto';
import { UpdateBackupRecipientDto } from './dto/update-recipient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['super-admin/database-backups', 'admin/database-backups', 'backend/super-admin/database-backups'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN')
export class DatabaseBackupController {
  constructor(private readonly backupService: DatabaseBackupService) {}

  @Get('overview')
  async getOverview() {
    return this.backupService.getOverview();
  }

  @Get('settings')
  async getSettings() {
    return this.backupService.getSettings();
  }

  @Put('settings')
  async updateSettings(
    @Body() dto: UpdateBackupSettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.backupService.updateSettings(dto, user);
  }

  @Get('recipients')
  async getRecipients() {
    return this.backupService.getRecipients();
  }

  @Post('recipients')
  async createRecipient(
    @Body() dto: CreateBackupRecipientDto,
    @CurrentUser() user: any,
  ) {
    return this.backupService.createRecipient(dto, user);
  }

  @Put('recipients/:id')
  async updateRecipient(
    @Param('id') id: string,
    @Body() dto: UpdateBackupRecipientDto,
    @CurrentUser() user: any,
  ) {
    return this.backupService.updateRecipient(id, dto, user);
  }

  @Delete('recipients/:id')
  async deleteRecipient(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.backupService.deleteRecipient(id, user);
  }

  @Post('test-email')
  async sendTestEmail(
    @Body('email') email: string,
    @CurrentUser() user: any,
  ) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid recipient email address is required.');
    }
    return this.backupService.sendTestEmail(email.trim(), user);
  }

  @Post('run')
  async triggerManualBackup(@CurrentUser() user: any) {
    return this.backupService.executeBackup('MANUAL', undefined, user);
  }

  @Get('history')
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.backupService.getHistory(pageNum, limitNum, status);
  }

  @Get('history/:id')
  async getHistoryById(@Param('id') id: string) {
    return this.backupService.getHistoryById(id);
  }

  @Post('history/:id/verify')
  async reVerifyBackup(@Param('id') id: string) {
    return this.backupService.reVerifyBackup(id);
  }

  @Get('download/:id')
  async downloadBackup(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, filename, sizeBytes } = await this.backupService.getDownloadStream(id, user);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(sizeBytes),
    });

    return new StreamableFile(stream);
  }
}
