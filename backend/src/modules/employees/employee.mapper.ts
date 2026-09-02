export function mapEmployee(employee: any) {
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

  return {
    ...safe,
    aadhaarMasked: employee.aadhaarLastFour ? `XXXX-XXXX-${employee.aadhaarLastFour}` : '—',
    bankAccountMasked: employee.bankAccountLastFour ? `XXXXXXXX${employee.bankAccountLastFour}` : '—',
    selfieUrl: photoDoc?.storageKey || employee.selfieUrl || null,
    signatureUrl: sigDoc?.storageKey || employee.signatureUrl || null,
  };
}
