export function mapEmployee(employee: any, decryptFn?: (val: string) => string | null) {
  const {
    aadhaarNumberEncrypted,
    aadhaarHash,
    bankAccountEncrypted,
    bankAccountHash,
    ...safe
  } = employee;

  const docs = Array.isArray(employee.documents) ? employee.documents : [];
  const photoDoc = docs.find((d: any) => d.documentType === 'PHOTOGRAPH');
  const sigDoc = docs.find((d: any) => d.documentType === 'SIGNATURE');

  const decryptedAadhaar = decryptFn && aadhaarNumberEncrypted ? decryptFn(aadhaarNumberEncrypted) : null;
  const decryptedBank = decryptFn && bankAccountEncrypted ? decryptFn(bankAccountEncrypted) : null;

  const fullAadhaar = decryptedAadhaar || employee.aadhaarNumber || (employee.aadhaarLastFour ? `XXXX-XXXX-${employee.aadhaarLastFour}` : '—');
  const fullBankAccount = decryptedBank || employee.bankAccountNumber || (employee.bankAccountLastFour ? `XXXXXXXX${employee.bankAccountLastFour}` : '—');

  return {
    ...safe,
    aadhaarNumber: fullAadhaar,
    aadhaarMasked: fullAadhaar,
    bankAccountNumber: fullBankAccount,
    bankAccountMasked: fullBankAccount,
    selfieUrl: photoDoc?.storageKey || employee.selfieUrl || null,
    signatureUrl: sigDoc?.storageKey || employee.signatureUrl || null,
  };
}
