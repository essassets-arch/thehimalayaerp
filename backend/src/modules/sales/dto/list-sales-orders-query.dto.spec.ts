import { ValidationPipe } from '@nestjs/common';
import {
  ListSalesOrdersQueryDto,
  MAX_SALES_ORDERS_PAGE_SIZE,
} from './list-sales-orders-query.dto';

describe('ListSalesOrdersQueryDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
  });

  const metadata = {
    type: 'query' as const,
    metatype: ListSalesOrdersQueryDto,
    data: '',
  };

  it('accepts pageSize=500 and preserves includeDeleted=true', async () => {
    const result = await pipe.transform(
      { page: '1', pageSize: '500', includeDeleted: 'true' },
      metadata,
    );

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(500);
    expect(result.limit).toBeUndefined();
    expect(result.includeDeleted).toBe('true');
  });

  it('preserves limit=300 without overwriting via default pageSize', async () => {
    const result = await pipe.transform(
      { limit: '300', status: 'CONFIRMED,IN_PRODUCTION' },
      metadata,
    );

    expect(result.pageSize).toBeUndefined();
    expect(result.limit).toBe(300);
    expect(result.status).toBe('CONFIRMED,IN_PRODUCTION');
  });

  it('clamps oversized pageSize and limit safely instead of throwing 400', async () => {
    const result = await pipe.transform(
      { page: '0', pageSize: '50000', limit: '99999' },
      metadata,
    );

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(MAX_SALES_ORDERS_PAGE_SIZE);
    expect(result.limit).toBe(MAX_SALES_ORDERS_PAGE_SIZE);
  });

  it('rejects non-numeric garbage pageSize with validation error', async () => {
    await expect(
      pipe.transform({ pageSize: 'not-a-number' }, metadata),
    ).rejects.toThrow();
  });
});
