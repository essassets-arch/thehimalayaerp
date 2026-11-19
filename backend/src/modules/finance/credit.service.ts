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

    if ((customer as any).status === 'CREDIT_HOLD' || (customer as any).isCreditHold) {
      throw new BadRequestException(
        `Customer '${customer.companyName}' is placed on strict CREDIT HOLD. Transactions blocked.`,
      );
    }

    if (!customer.creditLimit) {
      // If no credit limit is set, assume infinite or no restriction
      return { allowed: true, currentBalance: 0, creditLimit: 0, newAmount };
    }

    const ledger = await this.ledgerService.getCustomerLedger(customerId);
    const currentBalance = ledger.balance; // > 0 means they owe us money

    // For Sales Order or Dispatch: Outstanding + New Amount
    const projectedBalance = currentBalance + newAmount;

    if (projectedBalance > Number(customer.creditLimit)) {
      if (stage === 'DISPATCH') {
        throw new BadRequestException(
          `Credit limit exceeded. Limit: ${String(customer.creditLimit)}, Projected: ${projectedBalance}. Dispatch blocked.`,
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
