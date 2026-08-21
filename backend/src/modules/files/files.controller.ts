import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { createReadStream } from 'fs';
import { Public } from '../../common/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Universal file-serving endpoint for categorical paths:
   * GET /api/v1/files/serve/:category/:filename
   */
  @Public()
  @Get('serve/:category/:filename')
  serveCategoricalFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    const resolved = this.filesService.resolveFile(filename, category);
    if (!resolved) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: `File '${filename}' not found in category '${category}'`,
      });
    }

    res.set({
      'Content-Type': resolved.mimeType,
      'Content-Length': resolved.size,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }

  /**
   * Universal file-serving endpoint for flat paths:
   * GET /api/v1/files/serve/:filename
   */
  @Public()
  @Get('serve/:filename')
  serveFlatFile(
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    const resolved = this.filesService.resolveFile(filename);
    if (!resolved) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: `File '${filename}' not found`,
      });
    }

    res.set({
      'Content-Type': resolved.mimeType,
      'Content-Length': resolved.size,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }

  /**
   * GET /api/v1/files/:fileId
   */
  @Public()
  @Get(':fileId')
  serveByFileId(
    @Param('fileId') fileId: string,
    @Res() res: any,
  ) {
    const resolved = this.filesService.resolveFile(fileId);
    if (!resolved) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: `File '${fileId}' not found`,
      });
    }

    res.set({
      'Content-Type': resolved.mimeType,
      'Content-Length': resolved.size,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }

  /**
   * Universal upload endpoint:
   * POST /api/v1/files/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
    }),
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Query('category') queryCategory?: string,
    @Req() req?: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const category = queryCategory || req?.body?.category || 'attachments';
    const result = await this.filesService.saveUploadedFile(
      file,
      category,
      req?.body?.entityType,
      req?.body?.entityId,
      req?.user?.sub,
      req?.user?.companyId,
    );

    return {
      success: true,
      ...result,
    };
  }
}
