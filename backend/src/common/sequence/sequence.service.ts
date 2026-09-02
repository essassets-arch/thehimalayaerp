import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the 4-digit Indian Financial Year code (e.g. '2627' for FY 2026-27).
   * April 1 to March 31 cycle.
   */
  getFinancialYearCode(date: Date = new Date()): string {
    const d =
      date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    const month = d.getMonth(); // 0 = Jan, 3 = Apr, 11 = Dec
    const fullYear = d.getFullYear();
    const startYear = month >= 3 ? fullYear : fullYear - 1;
    const endYear = startYear + 1;
    const yy = String(startYear).substring(2);
    const ny = String(endYear).substring(2);
    return `${yy}${ny}`;
  }

  /**
   * Concurrency-safe atomic sequence generator using Prisma transaction locks.
   */
  async generateNext(
    key: string,
    prefix: string,
    padTo: number = 4,
  ): Promise<string> {
    return this.prisma.$transaction((tx) =>
      this.generateNextWithTx(tx, key, prefix, padTo),
    );
  }

  async generateNextWithTx(
    tx: Prisma.TransactionClient,
    key: string,
    prefix: string,
    padTo: number = 4,
  ): Promise<string> {
    const seq = await tx.idSequence.upsert({
      where: { key },
      update: { nextValue: { increment: 1 } },
      create: { key, nextValue: 2 }, // 2 means next call gets 2, this call gets 1
    });
    const issued = seq.nextValue - 1;
    return `${prefix}${String(issued).padStart(padTo, '0')}`;
  }

  /**
   * Generates next Lead number (e.g. LEAD/2627/0001).
   * Independent sequence per financial year, collision-safe.
   */
  async generateLeadNumber(
    date: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const fy = this.getFinancialYearCode(date);
    const key = `lead_number_${fy}`;
    const prefix = `LEAD/${fy}/`;

    const runner = async (client: Prisma.TransactionClient) => {
      let candidate = await this.generateNextWithTx(client, key, prefix, 4);
      let exists = await client.lead.findFirst({
        where: { leadNumber: candidate },
        select: { id: true },
      });

      while (exists) {
        candidate = await this.generateNextWithTx(client, key, prefix, 4);
        exists = await client.lead.findFirst({
          where: { leadNumber: candidate },
          select: { id: true },
        });
      }
      return candidate;
    };

    return tx ? runner(tx) : this.prisma.$transaction(runner);
  }

  /**
   * Generates next Quotation number (e.g. QU/2627/0001).
   * Independent sequence per financial year, collision-safe.
   */
  async generateQuotationNumber(
    date: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const fy = this.getFinancialYearCode(date);
    const key = `quotation_number_${fy}`;
    const prefix = `QU/${fy}/`;

    const runner = async (client: Prisma.TransactionClient) => {
      let candidate = await this.generateNextWithTx(client, key, prefix, 4);
      let exists = await client.quotation.findFirst({
        where: { quotationNumber: candidate },
        select: { id: true },
      });

      while (exists) {
        candidate = await this.generateNextWithTx(client, key, prefix, 4);
        exists = await client.quotation.findFirst({
          where: { quotationNumber: candidate },
          select: { id: true },
        });
      }
      return candidate;
    };

    return tx ? runner(tx) : this.prisma.$transaction(runner);
  }

  /**
   * Generates next Sales Order number (e.g. HCPPL/2627/0001).
   * Independent sequence per financial year, collision-safe.
   */
  async generateSalesOrderNumber(
    date: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const fy = this.getFinancialYearCode(date);
    const key = `sales_order_number_${fy}`;
    const prefix = `HCPPL/${fy}/`;

    const runner = async (client: Prisma.TransactionClient) => {
      let candidate = await this.generateNextWithTx(client, key, prefix, 4);
      let exists = await client.salesOrder.findFirst({
        where: { orderNumber: candidate },
        select: { id: true },
      });

      while (exists) {
        candidate = await this.generateNextWithTx(client, key, prefix, 4);
        exists = await client.salesOrder.findFirst({
          where: { orderNumber: candidate },
          select: { id: true },
        });
      }
      return candidate;
    };

    return tx ? runner(tx) : this.prisma.$transaction(runner);
  }

  /**
   * Generates next Customer Complaint number (e.g. CC/2627/0001).
   * Independent sequence per financial year, collision-safe.
   */
  async generateCustomerComplaintNumber(
    date: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const fy = this.getFinancialYearCode(date);
    const key = `customer_complaint_number_${fy}`;
    const prefix = `CC/${fy}/`;

    const runner = async (client: Prisma.TransactionClient) => {
      let candidate = await this.generateNextWithTx(client, key, prefix, 4);
      let exists = await client.customerComplaint.findFirst({
        where: { complaintNo: candidate },
        select: { id: true },
      });

      while (exists) {
        candidate = await this.generateNextWithTx(client, key, prefix, 4);
        exists = await client.customerComplaint.findFirst({
          where: { complaintNo: candidate },
          select: { id: true },
        });
      }
      return candidate;
    };

    return tx ? runner(tx) : this.prisma.$transaction(runner);
  }

  /**
   * Generates next Work Order number (e.g. WO-2026-00001).
   * Concurrency-safe and collision-checked against existing DB records.
   */
  async generateWorkOrderNumber(
    date: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const year = date.getFullYear();
    const key = `work_order_number_${year}`;
    const prefix = `WO-${year}-`;

    const runner = async (client: Prisma.TransactionClient) => {
      let candidate = await this.generateNextWithTx(client, key, prefix, 5);
      let exists = await client.workOrder.findUnique({
        where: { workOrderNumber: candidate },
        select: { id: true },
      });

      while (exists) {
        candidate = await this.generateNextWithTx(client, key, prefix, 5);
        exists = await client.workOrder.findUnique({
          where: { workOrderNumber: candidate },
          select: { id: true },
        });
      }
      return candidate;
    };

    return tx ? runner(tx) : this.prisma.$transaction(runner);
  }
}
