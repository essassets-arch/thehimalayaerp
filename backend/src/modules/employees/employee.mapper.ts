export function mapEmployee(employee: any) {
  const { aadhaarNumberEncrypted, aadhaarHash, bankAccountEncrypted, bankAccountHash, ...safe } = employee;
  return {
    ...safe,
    aadhaarMasked: `XXXX-XXXX-${employee.aadhaarLastFour}`,
    bankAccountMasked: `XXXXXXXX${employee.bankAccountLastFour}`,
  };
}
