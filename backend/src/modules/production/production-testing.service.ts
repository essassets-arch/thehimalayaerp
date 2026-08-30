import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductionTestingService {
  constructor(private readonly prisma: PrismaService) {}

  async listTestingRecords() {
    const records = await this.prisma.productionTestingRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => ({
      ...r,
      quantity: Number(r.quantity),
      uom: 'PCS',
    }));
  }

  async getTestingRecord(id: string) {
    const record = await this.prisma.productionTestingRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Testing record not found');
    return {
      ...record,
      quantity: Number(record.quantity),
      uom: 'PCS',
    };
  }

  async createTestingRecord(
    dto: {
      productName: string;
      quantity: number;
      status?: string;
      remarks?: string;
      testedBy?: string;
    },
    userId?: string,
  ) {
    if (!dto.productName || !dto.productName.trim()) {
      throw new BadRequestException('Product / Material Name is required');
    }
    const qty = Number(dto.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = randomUUID().slice(0, 4).toUpperCase();
    const referenceNo = `PQT-${dateStr}-${randomHex}`;

    const record = await this.prisma.productionTestingRecord.create({
      data: {
        referenceNo,
        productName: dto.productName.trim(),
        quantity: qty,
        status: dto.status || 'Pending',
        remarks: dto.remarks || null,
        reviewedBy: dto.testedBy || 'Production Supervisor',
      },
    });

    return {
      ...record,
      quantity: Number(record.quantity),
      uom: 'PCS',
    };
  }

  async updateTestingRecord(
    id: string,
    dto: {
      productName?: string;
      quantity?: number;
      status?: string;
      remarks?: string;
    },
  ) {
    const record = await this.getTestingRecord(id);
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id: record.id },
      data: {
        productName: dto.productName?.trim(),
        quantity: dto.quantity !== undefined ? Number(dto.quantity) : undefined,
        status: dto.status,
        remarks: dto.remarks,
      },
    });
    return {
      ...updated,
      quantity: Number(updated.quantity),
      uom: 'PCS',
    };
  }

  async updateStatus(
    id: string,
    dto: { status: string; remarks?: string; reviewedBy?: string },
  ) {
    const record = await this.getTestingRecord(id);
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id: record.id },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        reviewedBy: dto.reviewedBy || 'Plant Head',
        reviewedAt: new Date(),
      },
    });
    return {
      ...updated,
      quantity: Number(updated.quantity),
      uom: 'PCS',
    };
  }

  async deleteTestingRecord(id: string) {
    const record = await this.getTestingRecord(id);
    return this.prisma.productionTestingRecord.delete({
      where: { id: record.id },
    });
  }
}
