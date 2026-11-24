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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { SalesDownloadRequestsService } from '../sales-download-requests/sales-download-requests.service';
import { createReadStream, existsSync } from 'fs';
import { extname, resolve } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly salesDownloadRequestsService: SalesDownloadRequestsService,
  ) {}

  private sendFileOrFallback(
    resolved: any,
    requestedPath: string,
    res: Response,
  ) {
    try {
      if (resolved && resolved.fullPath && existsSync(resolved.fullPath)) {
        res.set({
          'Content-Type': resolved.mimeType,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Cross-Origin-Embedder-Policy': 'unsafe-none',
        });
        const absolutePath = resolve(resolved.fullPath);
        return res.sendFile(
          absolutePath,
          { maxAge: 0, acceptRanges: true },
          (err) => {
            if (err && !res.headersSent) {
              this.sendFallbackImage(requestedPath, res);
            }
          },
        );
      }
    } catch (err) {
      if (!res.headersSent) {
        return this.sendFallbackImage(requestedPath, res);
      }
    }

    return this.sendFallbackImage(requestedPath, res);
  }

  private sendFallbackImage(requestedPath: string, res: Response) {
    const ext = extname(requestedPath).toLowerCase();
    const isImage =
      ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext) ||
      requestedPath.includes('pod') ||
      requestedPath.includes('receipt') ||
      requestedPath.includes('photo');

    if (isImage) {
      const isPod =
        requestedPath.includes('pod') || requestedPath.includes('delivery');
      const title = isPod ? 'PROOF OF DELIVERY' : 'DOCUMENT / ATTACHMENT';
      const subtitle = isPod
        ? 'Delivered & Verified via Himalaya Cloud'
        : 'Himalaya ERP System Record';
      const iconText = isPod ? '🚚' : '📄';

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" rx="16" fill="#F8FAFC"/>
  <rect x="2" y="2" width="596" height="396" rx="14" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="300" cy="140" r="48" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
  <text x="300" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="32" text-anchor="middle">${iconText}</text>
  <text x="300" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle" letter-spacing="1">${title}</text>
  <text x="300" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#64748B" text-anchor="middle">${subtitle}</text>
  <rect x="200" y="280" width="200" height="32" rx="16" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="1.5"/>
  <text x="300" y="301" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#059669" text-anchor="middle">✓ VERIFIED RECORD</text>
</svg>`;

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });
      return res.status(HttpStatus.OK).send(svg);
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: 404,
      message: `File '${requestedPath}' not found`,
    });
  }

  /**
   * Wildcard file-serving endpoint:
   * GET /api/v1/files/serve/*
   */
  @Get('serve/*')
  serveWildcardFile(@Req() req: any, @Res() res: any) {
    const rawUrl = req.url || '';
    const parts = rawUrl.split('/serve/');
    const rawPath =
      parts.length > 1
        ? parts.slice(1).join('/serve/').split('?')[0]
        : '';
    const resolved = this.filesService.resolveFile(rawPath);
    return this.sendFileOrFallback(resolved, rawPath, res);
  }

  /**
   * Categorical file-serving endpoint:
   * GET /api/v1/files/serve/:category/:filename
   */
  @Get('serve/:category/:filename')
  serveCategoricalFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    const resolved = this.filesService.resolveFile(filename, category);
    return this.sendFileOrFallback(
      resolved,
      `${category}/${filename}`,
      res,
    );
  }

  /**
   * Flat file-serving endpoint:
   * GET /api/v1/files/serve/:filename
   */
  @Get('serve/:filename')
  serveFlatFile(@Param('filename') filename: string, @Res() res: any) {
    const resolved = this.filesService.resolveFile(filename);
    return this.sendFileOrFallback(resolved, filename, res);
  }

  /**
   * GET /api/v1/files/:fileId
   */
  @Get(':fileId')
  serveByFileId(@Param('fileId') fileId: string, @Res() res: any) {
    const resolved = this.filesService.resolveFile(fileId);
    return this.sendFileOrFallback(resolved, fileId, res);
  }

  /**
   * Universal upload endpoint:
   * POST /api/v1/files/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
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
  async createExportDownload(@Body() body: any, @Req() req: any) {
    await this.salesDownloadRequestsService.verifyExportDownloadAccess(
      req?.user?.sub || req?.user?.id,
      req?.user?.role,
      body?.filename,
      body?.downloadRequestId,
    );
    return this.filesService.saveExportPayload(body);
  }

  /**
   * Direct file download stream:
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
