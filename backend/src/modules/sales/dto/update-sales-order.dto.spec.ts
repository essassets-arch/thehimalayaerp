import { ValidationPipe } from '@nestjs/common';
import { UpdateSalesOrderDto } from './update-sales-order.dto';

describe('UpdateSalesOrderDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
  });

  const metadata = {
    type: 'body' as const,
    metatype: UpdateSalesOrderDto,
    data: '',
  };

  it('validates header fields and line items cleanly', async () => {
    const result = await pipe.transform(
      {
        customerPurchaseOrderNo: 'PO-2026-999',
        paymentTermsDays: '30',
        freightAmount: '1500.5',
        deliveryAddress: 'Sanand GIDC, Ahmedabad',
        remarks: 'Urgent dispatch',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            orderedQuantity: '10',
            unit: 'SET',
            unitPrice: '2500',
            discountAmount: '500',
            taxRate: '18',
            specifications: { description: '600x600 Gray' },
          },
        ],
      },
      metadata,
    );

    expect(result.customerPurchaseOrderNo).toBe('PO-2026-999');
    expect(result.paymentTermsDays).toBe(30);
    expect(result.freightAmount).toBe(1500.5);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].orderedQuantity).toBe(10);
    expect(result.items[0].unitPrice).toBe(2500);
  });

  it('rejects zero or negative quantity on items', async () => {
    await expect(
      pipe.transform(
        {
          items: [
            {
              productId: 'prod-1',
              orderedQuantity: 0,
              unitPrice: 100,
            },
          ],
        },
        metadata,
      ),
    ).rejects.toThrow();
  });
});
