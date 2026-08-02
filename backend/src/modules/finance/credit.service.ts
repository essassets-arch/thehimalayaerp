import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class CreditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  async checkCreditLimit(
    customerId: string,
    newAmount: number,
    stage: 'SALES_ORDER' | 'DISPATCH',
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new BadRequestException('Customer not found');

    if (!customer.creditLimit) {
      // If no credit limit is set, assume infinite or no restriction
      return { allowed: true, currentBalance: 0, creditLimit: 0, newAmount };
    }

    const ledger = await this.ledgerService.getCustomerLedger(customerId);
    const currentBalance = ledger.balance; // > 0 means they owe us money

    // For Sales Order, they might have pending UNPOSTED invoices, or unfulfilled sales orders.
    // For simplicity as requested, we just check Outstanding + New Amount
    const projectedBalance = currentBalance + newAmount;

    if (projectedBalance > Number(customer.creditLimit)) {
      if (stage === 'DISPATCH') {
        throw new BadRequestException(
          `Credit limit exceeded. Limit: ${customer.creditLimit}, Projected: ${projectedBalance}. Dispatch blocked.`,
        );
      }
      return {
        allowed: false,
        requiresApproval: true,
        currentBalance,
        creditLimit: Number(customer.creditLimit),
        projectedBalance,
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      currentBalance,
      creditLimit: Number(customer.creditLimit),
      projectedBalance,
    };
  }
}
