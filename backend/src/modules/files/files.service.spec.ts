import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from '../../database/prisma.service';
import { join } from 'path';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';

describe('FilesService & FilesController — Universal File Access Layer', () => {
  let service: FilesService;
  let controller: FilesController;
  let mockPrisma: any;
  const testDir = join(process.cwd(), 'uploads', 'pod');
  const testFileName = 'test-delivery-proof.jpg';
  const testFilePath = join(testDir, testFileName);

  beforeAll(() => {
    if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
    writeFileSync(testFilePath, 'dummy image content');
  });

  afterAll(() => {
    if (existsSync(testFilePath)) {
      try {
        unlinkSync(testFilePath);
      } catch {}
    }
  });

  beforeEach(async () => {
    mockPrisma = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('resolveFile', () => {
    it('resolves existing file by relative categorical path', () => {
      const result = service.resolveFile(testFileName, 'pod');
      expect(result).toBeDefined();
      expect(result?.fileName).toBe(testFileName);
      expect(result?.mimeType).toBe('image/jpeg');
    });

    it('resolves existing file by full upload path containing leading slashes', () => {
      const result = service.resolveFile(`/uploads/pod/${testFileName}`);
      expect(result).toBeDefined();
      expect(result?.fileName).toBe(testFileName);
    });

    it('cleans localhost origins and resolves correct disk path', () => {
      const result = service.resolveFile(
        `http://localhost:3000/uploads/pod/${testFileName}`,
      );
      expect(result).toBeDefined();
      expect(result?.fileName).toBe(testFileName);
    });

    it('prevents path traversal attacks', () => {
      const result = service.resolveFile('../../../etc/passwd');
      expect(result).toBeNull();
    });

    it('returns null for non-existent file', () => {
      const result = service.resolveFile('non-existent-file-99999.png');
      expect(result).toBeNull();
    });
  });

  describe('saveUploadedFile', () => {
    it('saves uploaded buffer and returns normalized relative and serve URLs', async () => {
      const mockFile: any = {
        originalname: 'delivery-receipt.png',
        buffer: Buffer.from('png file data'),
        size: 1024,
        mimetype: 'image/png',
      };

      const result = await service.saveUploadedFile(mockFile, 'pod');
      expect(result.success ?? true).toBeTruthy();
      expect(result.category).toBe('pod');
      expect(result.relativePath).toContain('/uploads/pod/');
      expect(result.url).toContain('/api/backend/files/serve/pod/');
      expect(result.mimeType).toBe('image/png');

      // Cleanup saved test file
      const savedPath = join(
        process.cwd(),
        'uploads',
        'pod',
        result.storedName,
      );
      if (existsSync(savedPath)) unlinkSync(savedPath);
    });
  });
});
