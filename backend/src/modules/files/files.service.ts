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

const ALLOWED_CATEGORIES = new Set([
  'pod',
  'attachments',
  'brand-analysis',
  'employees',
  'attendance',
  'qc',
  'dispatch',
  'receipts',
  'expenses',
  'payment-proof',
  'payments',
  'temp-exports',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
]);

export interface FileResolveResult {
  fullPath: string;
  fileName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsRoot = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!existsSync(this.uploadsRoot)) {
      mkdirSync(this.uploadsRoot, { recursive: true });
    }
    for (const sub of ALLOWED_CATEGORIES) {
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
    // Strict traversal sanitization: strip directory traversal sequences
    clean = normalize(clean).replace(/^(\.\.[\/\\])+/, '');
    clean = clean.replace(/(\.\.[\/\\])/g, '');

    const roots = Array.from(new Set([
      this.uploadsRoot,
      join(process.cwd(), 'uploads'),
      '/app/uploads',
    ])).filter(r => existsSync(r));

    const possiblePaths: string[] = [];

    const fileNameOnly = basename(clean);
    const ext = extname(fileNameOnly).toLowerCase();
    const nameWithoutExt = ext ? fileNameOnly.slice(0, -ext.length) : fileNameOnly;

    // Potential extension variants (.jpeg <-> .jpg, etc.)
    const altFileNames = [fileNameOnly];
    if (ext === '.jpeg') altFileNames.push(`${nameWithoutExt}.jpg`);
    if (ext === '.jpg') altFileNames.push(`${nameWithoutExt}.jpeg`);
    if (!ext) {
      altFileNames.push(`${fileNameOnly}.jpg`, `${fileNameOnly}.jpeg`, `${fileNameOnly}.png`, `${fileNameOnly}.webp`, `${fileNameOnly}.pdf`);
    }

    const safeCategory = category && ALLOWED_CATEGORIES.has(category) ? category : undefined;

    for (const root of roots) {
      // 1. If category provided, check category folder
      if (safeCategory) {
        for (const fName of altFileNames) {
          possiblePaths.push(join(root, safeCategory, fName));
        }
        possiblePaths.push(join(root, safeCategory, clean));
      }

      // 2. Direct subpath inside uploads
      for (const fName of altFileNames) {
        possiblePaths.push(join(root, fName));
      }
      possiblePaths.push(join(root, clean));
      const cleanWithoutEmployees = clean.replace(/^employees\//i, '');
      possiblePaths.push(join(root, 'employees', cleanWithoutEmployees));
      possiblePaths.push(join(root, 'employees', clean));

      // 3. Search all subdirectories
      for (const sub of ALLOWED_CATEGORIES) {
        for (const fName of altFileNames) {
          possiblePaths.push(join(root, sub, fName));
        }
        possiblePaths.push(join(root, sub, clean));
        possiblePaths.push(join(root, sub, cleanWithoutEmployees));
      }
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
      for (const sub of ALLOWED_CATEGORIES) {
        for (const fName of altFileNames) {
          possiblePaths.push(join(frontendUploads, sub, fName));
        }
      }
    }

    // Find the first existing file within strict boundary
    for (const candidate of possiblePaths) {
      const candidateResolved = resolve(candidate);
      // Boundary check: candidate must be inside one of the recognized roots
      const isWithinBounds = roots.some(r => candidateResolved.startsWith(resolve(r))) ||
        (existsSync(frontendUploads) && candidateResolved.startsWith(resolve(frontendUploads)));
      if (!isWithinBounds) {
        continue;
      }

      if (existsSync(candidateResolved)) {
        try {
          const stats = statSync(candidateResolved);
          if (stats.isFile()) {
            const foundExt = extname(candidateResolved).toLowerCase();
            const mimeType = MIME_TYPES[foundExt] || 'application/octet-stream';
            return {
              fullPath: candidateResolved,
              fileName: basename(candidateResolved),
              mimeType,
              size: stats.size,
            };
          }
        } catch {
          // Continue search
        }
      }
    }

    // 5. Fallback scan for partial name/UUID match in roots & subdirs
    if (nameWithoutExt && nameWithoutExt.length >= 6) {
      for (const root of roots) {
        const checkDirs = safeCategory ? [safeCategory, ...ALLOWED_CATEGORIES] : Array.from(ALLOWED_CATEGORIES);
        for (const sub of checkDirs) {
          const dirPath = join(root, sub);
          if (existsSync(dirPath)) {
            try {
              const files = readdirSync(dirPath);
              const matched = files.find(
                (f) =>
                  f.includes(nameWithoutExt) ||
                  f.startsWith(nameWithoutExt),
              );
              if (matched) {
                const fullPath = join(dirPath, matched);
                const fullResolved = resolve(fullPath);
                if (!fullResolved.startsWith(resolve(root))) continue;
                const stats = statSync(fullResolved);
                if (stats.isFile()) {
                  const foundExt = extname(matched).toLowerCase();
                  return {
                    fullPath: fullResolved,
                    fileName: matched,
                    mimeType:
                      MIME_TYPES[foundExt] || 'application/octet-stream',
                    size: stats.size,
                  };
                }
              }
            } catch {
              // Continue search
            }
          }
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
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        `File extension '${ext}' is not permitted for upload security.`,
      );
    }

    const safeCategory = ALLOWED_CATEGORIES.has(category) ? category : 'attachments';
    const uniqueName = `${randomUUID()}${ext}`;
    const targetDir = join(this.uploadsRoot, safeCategory);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const fullPath = join(targetDir, uniqueName);
    await writeFile(fullPath, file.buffer);

    const relativePath = `/uploads/${safeCategory}/${uniqueName}`;
    const serveUrl = `/api/backend/files/serve/${safeCategory}/${uniqueName}`;

    // Mirror to frontend/public/uploads if exists (for local dev parity)
    try {
      const frontendDir = join(
        process.cwd(),
        '..',
        'frontend',
        'public',
        'uploads',
        safeCategory,
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
      category: safeCategory,
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

    const exportsDir = join(this.uploadsRoot, 'temp-exports');
    if (!existsSync(exportsDir)) {
      mkdirSync(exportsDir, { recursive: true });
    }

    const cleanName = basename(payload.filename || 'export.csv').replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
    const token = `${randomUUID()}_${cleanName}`;
    const targetPath = join(exportsDir, token);

    let buffer: Buffer;
    if (payload.data.includes('base64,')) {
      const b64 = payload.data.split('base64,')[1];
      buffer = Buffer.from(b64, 'base64');
    } else {
      try {
        const isBase64 =
          /^[A-Za-z0-9+/=]+$/.test(payload.data) && payload.data.length % 4 === 0;
        if (isBase64) {
          buffer = Buffer.from(payload.data, 'base64');
        } else {
          buffer = Buffer.from(payload.data, 'utf-8');
        }
      } catch {
        buffer = Buffer.from(payload.data, 'utf-8');
      }
    }

    await writeFile(targetPath, buffer);

    const ext = extname(cleanName).toLowerCase();
    const mimeType =
      payload.mimeType || MIME_TYPES[ext] || 'application/octet-stream';

    return {
      success: true,
      token,
      filename: cleanName,
      downloadUrl: `/api/v1/files/download/${token}`,
      mimeType,
      size: buffer.length,
    };
  }

  /**
   * Resolves a temporary export file by token
   */
  public resolveExportFile(token: string): FileResolveResult | null {
    if (!token) return null;
    const cleanToken = basename(token);
    const exportsDir = join(this.uploadsRoot, 'temp-exports');
    const fullPath = join(exportsDir, cleanToken);

    if (existsSync(fullPath)) {
      const stats = statSync(fullPath);
      const ext = extname(cleanToken).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const originalName = cleanToken.includes('_')
        ? cleanToken.split('_').slice(1).join('_')
        : cleanToken;

      return {
        fullPath,
        fileName: originalName,
        mimeType,
        size: stats.size,
      };
    }
    return null;
  }
}
