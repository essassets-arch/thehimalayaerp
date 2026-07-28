import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listComments(entityType: string, entityId: string, includeInternal = false) {
    const whereClause: any = { entityType, entityId };
    
    // If not including internal comments, only return public ones
    if (!includeInternal) {
      whereClause.isInternal = false;
    }

    return this.prisma.comment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  async addComment(data: {
    entityType: string;
    entityId: string;
    message: string;
    isInternal: boolean;
    userId: string;
    companyId: string;
  }) {
    return this.prisma.comment.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        message: data.message,
        isInternal: data.isInternal,
        userId: data.userId,
        companyId: data.companyId,
      }
    });
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    // Soft delete
    await this.prisma.comment.update({ 
      where: { id },
      data: { deletedAt: new Date() }
    });
    return { success: true };
  }
}
