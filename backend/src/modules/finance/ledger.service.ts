import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerLedger(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { customer: null, entries: [], balance: 0 };

    const entries = await this.prisma.customerLedger.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' }
    });

    let balance = 0;
    const entriesWithBalance = entries.map(entry => {
      balance += Number(entry.debit);
      balance -= Number(entry.credit);
      return { ...entry, balance };
    });

    return {
      customer,
      entries: entriesWithBalance,
      balance
    };
  }
}
