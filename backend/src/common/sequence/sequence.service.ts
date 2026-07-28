import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically increment a named sequence and return the formatted key.
   * Uses an upsert: on create, nextValue starts at 1 and we return 1.
   * On update, nextValue is incremented by 1 and we return nextValue - 1.
   * Wait — upsert returns the resulting record:
   *   - If created with nextValue = 2, the "used" value is 1.
   *   - If updated from N to N+1, the "used" value is N.
   * Strategy: store "nextValue" as the NEXT value to hand out.
   *   On create: set nextValue = 2, hand out 1.
   *   On update: increment by 1, returned value is old+1; hand out old = returned-1.
   */
  async generateNext(
    key: string,
    prefix: string,
    padTo: number = 5,
  ): Promise<string> {
    return this.prisma.$transaction((tx) =>
      this.generateNextWithTx(tx, key, prefix, padTo),
    );
  }

  async generateNextWithTx(
    tx: Prisma.TransactionClient,
    key: string,
    prefix: string,
    padTo: number = 5,
  ): Promise<string> {
    const seq = await tx.idSequence.upsert({
      where: { key },
      update: { nextValue: { increment: 1 } },
      create: { key, nextValue: 2 }, // 2 means next call gets 2, this call gets 1
    });
    // seq.nextValue is the value AFTER the operation.
    // The value handed out is seq.nextValue - 1 (the one we just consumed).
    const issued = seq.nextValue - 1;
    return `${prefix}${String(issued).padStart(padTo, '0')}`;
  }
}
