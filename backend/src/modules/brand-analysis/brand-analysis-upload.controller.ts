import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { memoryStorage } from 'multer';
import { join, extname } from 'path';
import * as fs from 'fs';

@Controller('uploads/brand-analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandAnalysisUploadController {
  @Post()
  @RequirePermissions(
    'store.brand-analysis.create',
    'store.create',
    'store.read',
    'store.manage',
    'inventory.stock.read',
    'inventory.inventory.read',
    'procurement.create',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'File is missing or invalid. Please upload a valid image (JPEG, PNG, WEBP) or PDF file under 10MB.',
      );
    }

    const isImage = Boolean(
      file.mimetype?.match(/^image\//i) ||
      file.originalname?.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i),
    );
    const isPdf = Boolean(
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf'),
    );

    if (!isImage && !isPdf) {
      throw new BadRequestException(
        'Unsupported file type. Only JPEG, PNG, WEBP, GIF, SVG, and PDF files are allowed.',
      );
    }

    try {
      const uploadDir = join(process.cwd(), 'uploads', 'brand-analysis');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = extname(file.originalname || '') || '.png';
      const filename = `${uniqueSuffix}${fileExt}`;
      const filePath = join(uploadDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      return {
        url: `/uploads/brand-analysis/${filename}`,
        originalName: file.originalname,
      };
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to save uploaded file: ${err.message || 'Storage write error'}`,
      );
    }
  }
}
