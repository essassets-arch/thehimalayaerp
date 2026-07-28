import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerComplaintDto } from './dto/create-customer-complaint.dto';

@Injectable()
export class CustomerComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerComplaintDto, userId: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.salesOrderId }
    });
    if (!order) {
      throw new NotFoundException('Sales Order not found');
    }

    // Usually complaints are on delivered or at least dispatched goods. We assume UI handles this.

    let seq;
    try {
      seq = await this.prisma.idSequence.update({
        where: { key: 'COMPLAINT_NO' },
        data: { nextValue: { increment: 1 } },
      });
    } catch {
      seq = await this.prisma.idSequence.create({
        data: { key: 'COMPLAINT_NO', nextValue: 2 }
      });
    }
    const nextVal = seq.nextValue - 1;
    const complaintNumber = `CMP-${new Date().getFullYear()}-${String(nextVal).padStart(4, '0')}`;

    return this.prisma.customerComplaint.create({
      data: {
        complaintNumber,
        customerId: dto.customerId,
        salesOrderId: dto.salesOrderId,
        invoiceId: dto.invoiceId,
        complaintType: dto.complaintType,
        description: dto.description,
        evidence: dto.evidence || {},
        complaintStatus: 'RAISED',
        raisedById: userId,
      }
    });
  }

  async findAll() {
    return this.prisma.customerComplaint.findMany({
      orderBy: { raisedAt: 'desc' }
    });
  }
}
