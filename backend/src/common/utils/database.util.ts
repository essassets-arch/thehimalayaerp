import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export async function withOptimisticUpdate<T>(
  prisma: PrismaService,
  modelName: string, // e.g., 'customer', 'lead'
  id: string,
  expectedVersion: number | undefined,
  updateData: any,
): Promise<T> {
  const result = await (prisma[modelName] as any).updateMany({
    where: {
      id,
      version: expectedVersion,
      deletedAt: null,
    },
    data: {
      ...updateData,
      version: {
        increment: 1,
      },
    },
  });

  if (result.count === 0) {
    throw new ConflictException({
      code: 'VERSION_CONFLICT',
      message: 'This record was modified by another user.',
    });
  }

  return (prisma[modelName] as any).findUniqueOrThrow({
    where: { id },
  });
}

export async function generatePublicId(
  tx: any, // Prisma Transaction Client
  sequenceKey: string,
  prefix: string,
): Promise<string> {
  const sequence = await tx.idSequence.upsert({
    where: { key: sequenceKey },
    create: {
      key: sequenceKey,
      nextValue: 2,
    },
    update: {
      nextValue: {
        increment: 1,
      },
    },
  });

  const number = sequence.nextValue === 2 ? 1 : sequence.nextValue - 1;
  return `${prefix}-${String(number).padStart(6, '0')}`;
}
