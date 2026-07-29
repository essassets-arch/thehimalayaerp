import { BadRequestException, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { basename, join } from 'path';
import { randomUUID } from 'crypto';

const DOCUMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

@Injectable()
export class EmployeeFilesService {
  private readonly root = join(process.cwd(), 'uploads', 'employees');

  validate(file: any, imageOnly = false) {
    const allowed = imageOnly ? IMAGE_TYPES : DOCUMENT_TYPES;
    const limit = imageOnly ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: `Unsupported file type for ${file.fieldname}.`, field: file.fieldname });
    }
    if (file.size > limit) {
      throw new BadRequestException({ code: 'FILE_SIZE_EXCEEDED', message: `${file.fieldname} exceeds the upload limit.`, field: file.fieldname });
    }
  }

  async store(employeeId: string, file: any, folder: string) {
    this.validate(file, folder === 'photograph' || folder === 'signature');
    const extension = basename(file.originalname).split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const storedFileName = `${randomUUID()}.${extension}`;
    const storageKey = `${employeeId}/${folder}/${storedFileName}`;
    const directory = join(this.root, employeeId, folder);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(join(directory, storedFileName), file.buffer);
    return { storedFileName, storageKey };
  }

  async removeEmployeeFiles(employeeId: string) {
    await fs.rm(join(this.root, employeeId), { recursive: true, force: true });
  }

  async remove(storageKey: string) {
    const resolved = join(this.root, storageKey);
    if (!resolved.startsWith(this.root)) throw new BadRequestException('Invalid storage key');
    await fs.rm(resolved, { force: true });
  }
}
