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
import { diskStorage } from 'multer';
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          try {
            const uploadPath = join(process.cwd(), 'uploads', 'brand-analysis');
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
          } catch (e) {
            cb(e as Error, join(process.cwd(), 'uploads', 'brand-analysis'));
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname || '')}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(null, false);
        }
        const isImage = Boolean(
          file.mimetype?.match(/^image\//i) ||
          file.originalname?.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i)
        );
        const isPdf = Boolean(
          file.mimetype === 'application/pdf' ||
          file.originalname?.toLowerCase().endsWith('.pdf')
        );
        if (!isImage && !isPdf) {
          return cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException(
        'File is missing or invalid. Please upload a valid image (JPEG, PNG, WEBP) or PDF file under 10MB.',
      );
    }

    return {
      url: `/uploads/brand-analysis/${file.filename}`,
      originalName: file.originalname,
    };
  }
}
