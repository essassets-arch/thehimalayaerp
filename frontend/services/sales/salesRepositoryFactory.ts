import { SalesReadRepository } from './salesReadRepository';
import { backendSalesReadRepository } from './backendSalesReadRepository';
import { localSalesReadRepository } from './localSalesReadRepository';
import { SalesWriteRepository } from './salesWriteRepository';
import { backendSalesWriteRepository } from './backendSalesWriteRepository';

export function getSalesReadRepository(): SalesReadRepository {
  const mode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE ?? 'backend';
  if (mode === 'local') {
    return localSalesReadRepository;
  }
  return backendSalesReadRepository;
}

export function getSalesWriteRepository(): SalesWriteRepository {
  const mode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE ?? 'backend';
  if (mode === 'local') {
    return localSalesReadRepository;
  }
  return backendSalesWriteRepository;
}
