import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductionTestingService {
  constructor(private readonly prisma: PrismaService) {}

  async listTestingRecords() {
    return this.prisma.productionTestingRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTestingRecord(id: string) {
    const record = await this.prisma.productionTestingRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Testing record not found');
    return record;
  }

  async createTestingRecord(dto: {
    productName: string;
    quantity: number;
    status?: string;
  }) {
    // Generate simple sequence for referenceNo
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = randomUUID().slice(0, 4).toUpperCase();
    const referenceNo = `PQT-${dateStr}-${randomHex}`;

    return this.prisma.productionTestingRecord.create({
      data: {
        referenceNo,
        productName: dto.productName,
        quantity: dto.quantity,
        status: dto.status || 'Pending',
      },
    });
  }

  async updateTestingRecord(
    id: string,
    dto: { productName?: string; quantity?: number; status?: string },
  ) {
    const record = await this.getTestingRecord(id);
    return this.prisma.productionTestingRecord.update({
      where: { id: record.id },
      data: {
        productName: dto.productName,
        quantity: dto.quantity,
        status: dto.status,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: { status: string; remarks?: string; reviewedBy?: string },
  ) {
    const record = await this.getTestingRecord(id);
    return this.prisma.productionTestingRecord.update({
      where: { id: record.id },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        reviewedBy: dto.reviewedBy || 'Plant Head',
        reviewedAt: new Date(),
      },
    });
  }

  async deleteTestingRecord(id: string) {
    const record = await this.getTestingRecord(id);
    return this.prisma.productionTestingRecord.delete({
      where: { id: record.id },
    });
  }
}
