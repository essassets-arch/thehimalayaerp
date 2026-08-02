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
import { CommentsService } from './comments.service';

export class AddCommentDto {
  entityType: string;
  entityId: string;
  message: string;
  isInternal?: boolean = false;
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async listComments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('includeInternal') includeInternal?: string,
  ) {
    const showInternal = includeInternal === 'true';
    return this.commentsService.listComments(
      entityType,
      entityId,
      showInternal,
    );
  }

  @Post()
  async addComment(@Body() dto: AddCommentDto, @Req() req: any) {
    // In a real app we might determine companyId from the user context
    const companyId = 'COMP-000001';
    return this.commentsService.addComment({
      ...dto,
      isInternal: dto.isInternal || false,
      userId: req.user?.sub || 'SYSTEM',
      companyId,
    });
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.deleteComment(id, req.user?.sub);
  }
}
