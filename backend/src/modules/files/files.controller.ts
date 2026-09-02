import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
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

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Universal file-serving endpoint for categorical paths:
   * GET /api/v1/files/serve/:category/:filename
   */
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
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }

  /**
   * Universal file-serving endpoint for flat paths:
   * GET /api/v1/files/serve/:filename
   */
  @Get('serve/:filename')
  serveFlatFile(@Param('filename') filename: string, @Res() res: any) {
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
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }

  /**
   * GET /api/v1/files/:fileId
   */
  @Get(':fileId')
  serveByFileId(@Param('fileId') fileId: string, @Res() res: any) {
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
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
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

  /**
   * Universal export endpoint for mobile APK / Web download:
   * POST /api/v1/files/export-download
   */
  @Post('export-download')
  async createExportDownload(@Body() body: any) {
    return this.filesService.saveExportPayload(body);
  }

  /**
   * Direct file download stream with Content-Disposition attachment:
   * GET /api/v1/files/download/:token
   */
  @Get('download/:token')
  downloadExportFile(
    @Param('token') token: string,
    @Query('filename') queryFilename: string,
    @Res() res: any,
  ) {
    const resolved = this.filesService.resolveExportFile(token);
    if (!resolved) {
      // Fallback check general file resolver
      const generalResolved = this.filesService.resolveFile(token);
      if (!generalResolved) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: 404,
          message: `Download token '${token}' not found or expired`,
        });
      }
      const downloadName = queryFilename || generalResolved.fileName;
      res.set({
        'Content-Type': generalResolved.mimeType,
        'Content-Length': generalResolved.size,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadName)}"`,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      const stream = createReadStream(generalResolved.fullPath);
      return stream.pipe(res);
    }

    const downloadName = queryFilename || resolved.fileName;
    res.set({
      'Content-Type': resolved.mimeType,
      'Content-Length': resolved.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadName)}"`,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    const stream = createReadStream(resolved.fullPath);
    return stream.pipe(res);
  }
}
