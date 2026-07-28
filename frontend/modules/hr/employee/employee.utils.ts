// Verhoeff algorithm multiplication table
const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

/** Placeholder – actual circular-loop check is done in employee.service.ts */
export function validateManagerRelationship(): void { /* logic in service */ }

// Verhoeff algorithm permutation table
const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 4, 2, 1, 6],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 5, 8, 2]
];

/**
 * Validates Aadhaar card number digits using Verhoeff algorithm
 */
export function validateVerhoeff(array: string | number[]): boolean {
  let c = 0;
  let arr: number[] = [];
  if (typeof array === 'string') {
    arr = array.replace(/\D/g, '').split('').map(Number);
  } else {
    arr = array;
  }
  
  if (arr.length !== 12) return false;
  
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const digit = arr[len - 1 - i];
    c = verhoeffTableD[c][verhoeffTableP[i % 8][digit]];
  }
  return c === 0;
}

/**
 * Mask Aadhaar number to form XXXX-XXXX-1234
 */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return '';
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Mask PAN number to form XXXXX1234F
 */
export function maskPan(pan: string): string {
  if (!pan) return '';
  const clean = pan.toUpperCase().replace(/\s/g, '');
  if (clean.length < 5) return clean;
  // Mask first 5 characters
  const suffix = clean.slice(5);
  return `XXXXX${suffix}`;
}

/**
 * Mask Bank Account number to form XXXXXXXX4321
 */
export function maskBankAccount(accountNo: string): string {
  if (!accountNo) return '';
  const clean = accountNo.trim();
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  const maskedLength = Math.max(4, clean.length - 4);
  return 'X'.repeat(maskedLength) + last4;
}

/**
 * Mask UAN number to form XXXX-XXXX-1234
 */
export function maskUan(uan: string): string {
  if (!uan) return '';
  const clean = uan.replace(/\D/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Mask ESIC number to form XXXXXXXXXXXXX1234 (17 digits)
 */
export function maskEsic(esic: string): string {
  if (!esic) return '';
  const clean = esic.replace(/\D/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  const maskedLength = Math.max(4, clean.length - 4);
  return 'X'.repeat(maskedLength) + last4;
}
