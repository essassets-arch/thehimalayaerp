import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAttachments(entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({
      where: { entityType, entityId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async addAttachment(data: {
    entityType: string;
    entityId: string;
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
    userId: string;
    companyId: string;
  }) {
    return this.prisma.attachment.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        uploadedById: data.userId,
        companyId: data.companyId,
      },
    });
  }

  async deleteAttachment(id: string) {
    // Should check permissions here in a real app
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.prisma.attachment.delete({ where: { id } });
    return { success: true };
  }
}
