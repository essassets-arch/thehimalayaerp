import { SalesReadRepository } from './salesReadRepository';
import { backendSalesReadRepository } from './backendSalesReadRepository';
import { localSalesReadRepository } from './localSalesReadRepository';
import { SalesWriteRepository } from './salesWriteRepository';
import { backendSalesWriteRepository } from './backendSalesWriteRepository';

export function getSalesReadRepository(): SalesReadRepository {
  const mode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE ?? 'local';
  if (mode === 'backend') {
    return backendSalesReadRepository;
  }
  return localSalesReadRepository;
}

export function getSalesWriteRepository(): SalesWriteRepository {
  const mode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE ?? 'local';
  if (mode === 'backend') {
    return backendSalesWriteRepository;
  }
  // For 'local', we can either throw or provide a mock local write repository
  // We'll throw because backend mode is now enforced for writes.
  throw new Error('Local write repository is not fully implemented in Phase E. Run NEXT_PUBLIC_DATA_SOURCE_MODE=backend');
}
