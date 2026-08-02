import {
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
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  async listAttachments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.attachmentsService.listAttachments(entityType, entityId);
  }

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

  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    return this.attachmentsService.deleteAttachment(id);
  }
}
