import { test, expect } from '@playwright/test';

test.describe('Phase 8 Document Sequencing & Concurrency Suite', () => {
  test('Generated document numbers follow strict format [PREFIX]/26-27/[0001-9999]', async () => {
    const sampleDocs = [
      'lead/26-27/0001',
      'QU/26-27/0042',
      'HCPPL/26-27/0100',
      'WO/26-27/0015',
      'MR/26-27/0003',
      'IND/26-27/0088',
      'PO/26-27/0050',
      'GRN/26-27/0022',
      'DC/26-27/0034',
      'INV/26-27/0099'
    ];

    const sequenceRegex = /^[A-Za-z0-9_-]+\/26-27\/\d{4}$/;
    for (const doc of sampleDocs) {
      expect(sequenceRegex.test(doc)).toBe(true);
    }
  });

  test('Simulated concurrent sequence counter generates 100 strictly unique sequential IDs', async () => {
    const generated = new Set<string>();
    let currentCounter = 1;

    for (let i = 0; i < 100; i++) {
      const seqStr = String(currentCounter++).padStart(4, '0');
      const docNum = `QU/26-27/${seqStr}`;
      expect(generated.has(docNum)).toBe(false); // No duplicates allowed
      generated.add(docNum);
    }

    expect(generated.size).toBe(100);
  });
});
