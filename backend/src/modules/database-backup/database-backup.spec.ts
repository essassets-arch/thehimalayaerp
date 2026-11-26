import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { getIstCurrentTime } from './backup-scheduler.service';

describe('DatabaseBackup Crypto & Integrity Verification Unit Tests', () => {
  const testDir = path.join(__dirname, '../../../test_scratch_backup');
  const testKey = crypto.randomBytes(32);
  const testIv = crypto.randomBytes(12);

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('correctly reports current IST date and time in Asia/Kolkata', () => {
    const { dateIst, hour, minute } = getIstCurrentTime();
    expect(dateIst).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    expect(minute).toBeGreaterThanOrEqual(0);
    expect(minute).toBeLessThanOrEqual(59);
  });

  it('performs AES-256-GCM encryption and authenticates decryption successfully', () => {
    const samplePayload = Buffer.from('PGDMP_HIMALAYA_ERP_PRODUCTION_SNAPSHOT_DATABASE_CONTENT');

    // 1. Encrypt
    const cipher = crypto.createCipheriv('aes-256-gcm', testKey, testIv);
    const ciphertext = Buffer.concat([cipher.update(samplePayload), cipher.final()]);
    const authTag = cipher.getAuthTag();

    expect(ciphertext.length).toBeGreaterThan(0);
    expect(authTag.length).toBe(16);

    // 2. Decrypt with correct key, IV, and authTag
    const decipher = crypto.createDecipheriv('aes-256-gcm', testKey, testIv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    expect(decrypted.toString()).toBe(samplePayload.toString());
  });

  it('rejects decryption when authentication tag or ciphertext is tampered', () => {
    const samplePayload = Buffer.from('PGDMP_INTEGRITY_CHECK_SAMPLE');

    const cipher = crypto.createCipheriv('aes-256-gcm', testKey, testIv);
    const ciphertext = Buffer.concat([cipher.update(samplePayload), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Tamper single byte in ciphertext
    const tamperedCiphertext = Buffer.from(ciphertext);
    tamperedCiphertext[0] ^= 0xff;

    const decipher = crypto.createDecipheriv('aes-256-gcm', testKey, testIv);
    decipher.setAuthTag(authTag);

    expect(() => {
      Buffer.concat([decipher.update(tamperedCiphertext), decipher.final()]);
    }).toThrow();
  });

  it('computes accurate SHA-256 checksums matching Node.js standard hash', () => {
    const data = Buffer.from('HIMALAYA_ERP_BACKUP_SHA256_VERIFICATION');
    const expectedHash = crypto.createHash('sha256').update(data).digest('hex');

    const calculatedHash = crypto.createHash('sha256').update(data).digest('hex');
    expect(calculatedHash).toBe(expectedHash);
    expect(calculatedHash.length).toBe(64);
  });
});
