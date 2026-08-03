import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';

export class AddAttachmentDto {
  entityType: string;
  entityId: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
}

@Controller('attachments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @RequirePermissions('admin.attachments.read')
  @Get()
  async listAttachments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.attachmentsService.listAttachments(entityType, entityId);
  }

  @RequirePermissions('admin.attachments.create')
  @Post()
  async addAttachment(@Body() dto: AddAttachmentDto, @Req() req: any) {
    // In a real app we might determine companyId from the user context
    const companyId = 'COMP-000001'; // Default company from seed
    return this.attachmentsService.addAttachment({
      ...dto,
      userId: req.user?.sub || 'SYSTEM',
      companyId,
    });
  }

  @RequirePermissions('admin.attachments.delete')
  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    return this.attachmentsService.deleteAttachment(id);
  }
}
