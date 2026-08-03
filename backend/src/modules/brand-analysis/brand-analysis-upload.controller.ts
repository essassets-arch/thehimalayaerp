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
import { extname } from 'path';

@Controller('uploads/brand-analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandAnalysisUploadController {
  @Post()
  @RequirePermissions('store.brand-analysis.create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/brand-analysis',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        // Validate MIME type
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is missing or invalid');
    }

    // Return a safe URL string
    return {
      url: `/uploads/brand-analysis/${file.filename}`,
      originalName: file.originalname,
    };
  }
}
