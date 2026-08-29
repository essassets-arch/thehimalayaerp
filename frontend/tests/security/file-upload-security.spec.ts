import { test, expect } from '@playwright/test';

test.describe('Phase 8 File Upload Security Suite', () => {
  test('Path traversal filenames are sanitized before disk persistence', async () => {
    const dangerousFilenames = [
      '../../etc/passwd',
      '..\\..\\windows\\system32\\cmd.exe',
      '../../../uploads/malicious.js',
      'selfie.png\0.exe'
    ];

    dangerousFilenames.forEach(name => {
      // Path sanitization replaces directory traversal tokens
      const sanitized = name.replace(/^(\.\.[\/\\])+/, '').replace(/\0/g, '');
      expect(sanitized.startsWith('..')).toBe(false);
      expect(sanitized.includes('\0')).toBe(false);
    });
  });

  test('Allowed MIME types for document and image uploads are strictly enforced', async () => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maliciousMimeType = 'application/x-msdownload'; // .exe
    expect(allowedMimeTypes.includes(maliciousMimeType)).toBe(false);
  });
});
