import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { join, resolve, normalize, basename, extname } from 'path';
import {
  existsSync,
  mkdirSync,
  statSync,
  createReadStream,
  readdirSync,
} from 'fs';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.zip': 'application/zip',
};

export interface FileResolveResult {
  fullPath: string;
  fileName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    // Ensure base upload directories exist
    const subDirs = [
      'pod',
      'attachments',
      'brand-analysis',
      'employees',
      'attendance',
      'qc',
      'dispatch',
      'receipts',
    ];
    if (!existsSync(this.uploadsRoot)) {
      mkdirSync(this.uploadsRoot, { recursive: true });
    }
    for (const sub of subDirs) {
      const p = join(this.uploadsRoot, sub);
      if (!existsSync(p)) mkdirSync(p, { recursive: true });
    }
  }

  /**
   * Resolves a file from disk by looking into multiple known upload directories.
   * Secure against path traversal attacks.
   */
  public resolveFile(
    targetPathOrId: string,
    category?: string,
  ): FileResolveResult | null {
    if (!targetPathOrId) return null;

    let clean = targetPathOrId;
    try {
      clean = decodeURIComponent(targetPathOrId);
    } catch (e) {
      // Fallback if not decodable
    }

    // Clean leading slashes, localhost URLs, and api prefixes
    clean = clean.replace(/^https?:\/\/[^\/]+/i, '');
    clean = clean.replace(
      /^\/?(api\/(backend|v1)\/)?(uploads|files\/serve)\/?/i,
      '',
    );
    clean = normalize(clean).replace(/^(\.\.[\/\\])+/, ''); // Strip directory traversal

    const possiblePaths: string[] = [];

    // 1. If category provided, check category folder
    if (category) {
      possiblePaths.push(join(this.uploadsRoot, category, basename(clean)));
      possiblePaths.push(join(this.uploadsRoot, category, clean));
    }

    // 2. Direct subpath inside uploads
    possiblePaths.push(join(this.uploadsRoot, clean));

    // 3. Search subdirectories by filename (static fallbacks + dynamically scanned folders)
    const fileNameOnly = basename(clean);
    let subDirs = [
      'pod',
      'attachments',
      'brand-analysis',
      'employees',
      'attendance',
      'qc',
      'dispatch',
      'receipts',
      'payment-proof',
      'payments',
    ];
    try {
      if (existsSync(this.uploadsRoot)) {
        const items = readdirSync(this.uploadsRoot, { withFileTypes: true });
        const dynamicDirs = items
          .filter((item) => item.isDirectory())
          .map((item) => item.name);
        subDirs = Array.from(new Set([...subDirs, ...dynamicDirs]));
      }
    } catch (e) {
      // Fallback to static list on error
    }

    for (const sub of subDirs) {
      possiblePaths.push(join(this.uploadsRoot, sub, fileNameOnly));
    }

    // 4. Check frontend public uploads if running in monolith/dev
    const frontendUploads = join(
      process.cwd(),
      '..',
      'frontend',
      'public',
      'uploads',
    );
    if (existsSync(frontendUploads)) {
      possiblePaths.push(join(frontendUploads, clean));
      for (const sub of subDirs) {
        possiblePaths.push(join(frontendUploads, sub, fileNameOnly));
      }
    }

    // Find the first existing file
    for (const candidate of possiblePaths) {
      const resolved = resolve(candidate);
      if (existsSync(resolved)) {
        try {
          const stats = statSync(resolved);
          if (stats.isFile()) {
            const ext = extname(resolved).toLowerCase();
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            return {
              fullPath: resolved,
              fileName: basename(resolved),
              mimeType,
              size: stats.size,
            };
          }
        } catch {
          // Continue search
        }
      }
    }

    return null;
  }

  /**
   * Saves an uploaded buffer / file to the centralized uploads directory.
   */
  public async saveUploadedFile(
    file: any,
    category = 'attachments',
    entityType?: string,
    entityId?: string,
    userId?: string,
    companyId?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file buffer provided for upload');
    }

    const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
    const uniqueName = `${randomUUID()}${ext}`;
    const targetDir = join(this.uploadsRoot, category);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const fullPath = join(targetDir, uniqueName);
    await writeFile(fullPath, file.buffer);

    const relativePath = `/uploads/${category}/${uniqueName}`;
    const serveUrl = `/api/backend/files/serve/${category}/${uniqueName}`;

    // Also mirror to frontend/public/uploads if exists (for local dev parity)
    try {
      const frontendDir = join(
        process.cwd(),
        '..',
        'frontend',
        'public',
        'uploads',
        category,
      );
      if (existsSync(join(process.cwd(), '..', 'frontend', 'public'))) {
        if (!existsSync(frontendDir))
          mkdirSync(frontendDir, { recursive: true });
        await writeFile(join(frontendDir, uniqueName), file.buffer);
      }
    } catch {
      // Non-fatal if frontend directory not writable
    }

    return {
      fileId: uniqueName,
      fileName: file.originalname,
      storedName: uniqueName,
      category,
      relativePath,
      url: serveUrl,
      size: file.size,
      mimeType: file.mimetype || MIME_TYPES[ext] || 'application/octet-stream',
    };
  }

  /**
   * Universal Temporary Export Handler for Mobile APKs and Web Apps:
   * Accepts base64 data URL, raw text (e.g. CSV), or raw base64 and saves to `uploads/temp-exports/`
   */
  public async saveExportPayload(payload: {
    filename: string;
    mimeType?: string;
    data: string;
  }) {
    if (!payload || !payload.data) {
      throw new BadRequestException('No export data provided');
    }

    const exportDir = join(this.uploadsRoot, 'temp-exports');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir, { recursive: true });
    }

    // Clean filename
    let rawFilename = payload.filename || 'download.bin';
    rawFilename = rawFilename.replace(/[/\\?%*:|"<>]/g, '_');
    const ext = extname(rawFilename).toLowerCase() || (payload.mimeType?.includes('png') ? '.png' : payload.mimeType?.includes('pdf') ? '.pdf' : payload.mimeType?.includes('csv') ? '.csv' : '.bin');
    
    let mimeType = payload.mimeType || MIME_TYPES[ext] || 'application/octet-stream';
    let buffer: Buffer;

    if (payload.data.startsWith('data:')) {
      const matches = payload.data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1] || mimeType;
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        const parts = payload.data.split(',');
        mimeType = parts[0].match(/:(.*?);/)?.[1] || mimeType;
        try {
          buffer = Buffer.from(decodeURIComponent(parts[1]), 'utf-8');
        } catch {
          buffer = Buffer.from(parts[1], 'base64');
        }
      }
    } else if (/^[A-Za-z0-9+/=\s]+$/.test(payload.data.substring(0, 100))) {
      try {
        buffer = Buffer.from(payload.data.replace(/\s/g, ''), 'base64');
      } catch {
        buffer = Buffer.from(payload.data, 'utf-8');
      }
    } else {
      buffer = Buffer.from(payload.data, 'utf-8');
    }

    const token = `${randomUUID()}${ext}`;
    const filePath = join(exportDir, token);
    await writeFile(filePath, buffer);

    return {
      success: true,
      token,
      filename: rawFilename,
      mimeType,
      size: buffer.length,
      downloadUrl: `/api/backend/files/download/${token}?filename=${encodeURIComponent(rawFilename)}`,
    };
  }

  public resolveExportFile(token: string): FileResolveResult | null {
    if (!token) return null;
    const cleanToken = basename(token);
    const exportDir = join(this.uploadsRoot, 'temp-exports');
    const filePath = join(exportDir, cleanToken);
    if (!existsSync(filePath)) return null;

    try {
      const stats = statSync(filePath);
      const ext = extname(cleanToken).toLowerCase();
      return {
        fullPath: filePath,
        fileName: cleanToken,
        mimeType: MIME_TYPES[ext] || 'application/octet-stream',
        size: stats.size,
      };
    } catch {
      return null;
    }
  }
}

