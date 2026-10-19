import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { InventoryService } from '../inventory/inventory.service';
import { ProductionWorkflowService } from './production-workflow.service';
import { isCatalogProduct } from '../products/catalog-product.filter';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateTestingRecord {
  @IsString()
  @IsNotEmpty()
  productId!: string;
  @IsInt()
  @Min(1)
  @Max(999999999999)
  quantity!: number;
  @IsOptional()
  @IsString()
  remarks?: string;
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{16,128}$/)
  requestId!: string;
}
const relations = {
  product: true,
  createdBy: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ProductionTestingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly workflow: ProductionWorkflowService,
  ) {}

  private serialize(record: any) {
    return {
      ...record,
      productName: record.product?.name || record.productName,
      quantity: Number(record.quantity),
      uom: 'PCS',
      stockDeducted: record.requestId ? Number(record.quantity) : null,
    };
  }

  async listTestingRecords(companyId: string) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const records = await this.prisma.productionTestingRecord.findMany({
      where: { companyId },
      include: relations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.serialize(record));
  }

  async getTestingRecord(id: string, companyId: string) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const record = await this.prisma.productionTestingRecord.findFirst({
      where: { id, companyId },
      include: relations,
    });
    if (!record) throw new NotFoundException('Testing record not found');
    return this.serialize(record);
  }

  private response(record: any) {
    return {
      testingRecord: this.serialize(record),
      stock: {
        productId: record.productId,
        previousQuantity: Number(record.previousQuantity),
        deductedQuantity: Number(record.quantity),
        remainingQuantity: Number(record.remainingQuantity),
      },
    };
  }

  async createTestingRecord(
    dto: CreateTestingRecord,
    userId: string,
    companyId: string,
  ) {
    if (!userId || !companyId)
      throw new UnauthorizedException('Authentication required');
    if (typeof dto.productId !== 'string' || !dto.productId.trim()) {
      throw new BadRequestException('Selected product is no longer available.');
    }
    if (
      !Number.isSafeInteger(dto.quantity) ||
      dto.quantity <= 0 ||
      dto.quantity > 999999999999
    ) {
      throw new BadRequestException(
        'Quantity must be a positive whole number.',
      );
    }
    if (
      typeof dto.requestId !== 'string' ||
      !/^[a-zA-Z0-9_-]{16,128}$/.test(dto.requestId)
    ) {
      throw new BadRequestException('A valid requestId is required.');
    }
    if (dto.remarks !== undefined && typeof dto.remarks !== 'string') {
      throw new BadRequestException('Remarks must be text.');
    }
    const remarks = dto.remarks?.trim() || null;
    // Retry the complete serializable transaction, never a partial stock write.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.productionTestingRecord.findUnique({
              where: {
                companyId_requestId: { companyId, requestId: dto.requestId },
              },
              include: relations,
            });
            if (existing) {
              if (
                existing.productId !== dto.productId ||
                Number(existing.quantity) !== dto.quantity ||
                existing.remarks !== remarks ||
                existing.createdById !== userId
              ) {
                throw new ConflictException(
                  'This request ID has already been used for a different testing record.',
                );
              }
              return this.response(existing);
            }
            const product = await tx.product.findFirst({
              where: { id: dto.productId, companyId, isActive: true },
            });
            if (!product || !isCatalogProduct(product))
              throw new BadRequestException(
                'Selected product is no longer available.',
              );
            await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${product.id} FOR UPDATE`;
            const stock = await this.workflow.getAllStock(
              companyId,
              userId,
              undefined,
              tx,
              product.id,
            );
            const available = stock.items[0]?.availableStock || 0;
            if (dto.quantity > available) {
              throw new BadRequestException(
                `Insufficient stock. Available: ${available} PCS. Requested: ${dto.quantity} PCS.`,
              );
            }
            const record = await tx.productionTestingRecord.create({
              data: {
                companyId,
                productId: product.id,
                quantity: dto.quantity,
                remarks,
                createdById: userId,
                requestId: dto.requestId,
                referenceNo: `PQT-${randomUUID()}`,
                previousQuantity: available,
                remainingQuantity: available - dto.quantity,
              },
              include: relations,
            });
            await this.inventory.stockOutFinishedGoods(
              tx,
              companyId,
              product.id,
              dto.quantity,
              'TESTING',
              record.id,
              null,
              record.referenceNo,
              userId,
              remarks || 'Testing sample',
              'TESTING',
            );
            return this.response(record);
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 20000,
          },
        );
      } catch (error) {
        if (attempt < 4 && ['P2034', 'P2002'].includes((error as any)?.code))
          continue;
        if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException(
          'Unable to add testing record. No stock was deducted.',
        );
      }
    }
    throw new ConflictException(
      'Stock changed during submission. Please retry with the same request ID.',
    );
  }

  async updateTestingRecord(
    id: string,
    dto: {
      productName?: string;
      productId?: string;
      quantity?: number;
      status?: string;
      remarks?: string;
    },
    companyId: string,
  ) {
    const record = await this.getTestingRecord(id, companyId);
    if (
      record.requestId &&
      (dto.productId !== undefined ||
        dto.productName !== undefined ||
        dto.quantity !== undefined)
    ) {
      throw new BadRequestException(
        'Product and quantity cannot be changed after stock has been deducted.',
      );
    }
    if (
      dto.quantity !== undefined &&
      (!Number.isSafeInteger(dto.quantity) || dto.quantity <= 0)
    ) {
      throw new BadRequestException(
        'Quantity must be a positive whole number.',
      );
    }
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id },
      data: {
        productName: dto.productName?.trim(),
        quantity: dto.quantity,
        status: dto.status,
        remarks: dto.remarks,
      },
      include: relations,
    });
    return this.serialize(updated);
  }

  async updateStatus(
    id: string,
    dto: { status: string; remarks?: string },
    companyId: string,
    userId: string,
  ) {
    await this.getTestingRecord(id, companyId);
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
      include: relations,
    });
    return this.serialize(updated);
  }

  async deleteTestingRecord(id: string, companyId: string, userId?: string) {
    const record = await this.prisma.productionTestingRecord.findFirst({
      where: {
        OR: [{ id }, { referenceNo: id }],
        ...(companyId ? { companyId } : {}),
      },
      include: relations,
    });

    const targetRecord = record || (await this.prisma.productionTestingRecord.findFirst({
      where: {
        OR: [{ id }, { referenceNo: id }],
      },
      include: relations,
    }));

    if (!targetRecord) {
      throw new NotFoundException('Testing record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Unlink any test certificates that point to this testing record
      await tx.productionTestReport.updateMany({
        where: { testingRecordId: targetRecord.id },
        data: { testingRecordId: null },
      });

      // 2. If stock was deducted, reverse it back to finished goods inventory
      if (targetRecord.productId && Number(targetRecord.quantity) > 0 && targetRecord.requestId) {
        try {
          await this.inventory.stockInFinishedGoods(
            tx,
            targetRecord.companyId || companyId,
            targetRecord.productId,
            Number(targetRecord.quantity),
            'TESTING_REVERSAL',
            targetRecord.id,
            null,
            targetRecord.referenceNo,
            userId || targetRecord.createdById || 'SYSTEM',
            'Testing record deleted - stock returned',
            'PRODUCTION_IN',
          );
        } catch (stockErr: any) {
          console.warn(`[deleteTestingRecord] Notice reversing stock for ${targetRecord.referenceNo}:`, stockErr?.message);
        }
      }

      // 3. Delete the testing record
      return tx.productionTestingRecord.delete({ where: { id: targetRecord.id } });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     TESTING REPORTS & CERTIFICATES (ISO / EN 124 COMPLIANT)
     ══════════════════════════════════════════════════════════════════ */

  getDefaultTemplate() {
    return {
      specifications: [
        { srNo: 1, specification: 'MOC of Material', description: 'FRP' },
        { srNo: 2, specification: 'Load Bearing', description: '12.5 Ton' },
        { srNo: 3, specification: 'Colour', description: 'Black' },
        { srNo: 4, specification: 'RESIN', description: 'Isophthalic Resin' },
        { srNo: 5, specification: 'Filler Content', description: 'NIL' },
        { srNo: 6, specification: 'Outdoor Use', description: 'YES' },
        { srNo: 7, specification: 'Load Testing', description: 'As Per EN 124-5:2015' },
        { srNo: 8, specification: 'UV Resistant', description: 'UV Stabilized' },
        { srNo: 9, specification: 'Testing Code', description: 'EN 124-5:2015' },
        { srNo: 10, specification: 'Testing Code', description: 'EN 124' },
      ],
      loadTestingRows: [
        { no: 1, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
        { no: 2, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
        { no: 3, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
        { no: 4, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
        { no: 5, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
        { no: 6, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
      ],
      cycleLoadsTon: '',
      finalLoadTon: '',
      cycleStatement: 'Five cycles of ___ tons were applied & released, followed by the final ___ tons load maintained for 30secs.',
      resultStatement: 'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.',
      testedByName: 'Sana Konda Reddy',
      testedByTitle: 'Plant Head',
      testedByStamp: true,
      testedBySignature: true,
    };
  }

  async listReports(
    companyId: string,
    query?: { search?: string; status?: string; allRevisions?: boolean },
  ) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const where: any = { companyId };
    if (!query?.allRevisions) {
      where.isLatest = true;
    }
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { reportNumber: { contains: s, mode: 'insensitive' } },
        { clientName: { contains: s, mode: 'insensitive' } },
        { productName: { contains: s, mode: 'insensitive' } },
        { poNumber: { contains: s, mode: 'insensitive' } },
        { projectName: { contains: s, mode: 'insensitive' } },
      ];
    }

    return this.prisma.productionTestReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(id: string, companyId: string) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const report = await this.prisma.productionTestReport.findFirst({
      where: { id, companyId },
    });
    if (!report) throw new NotFoundException('Test report not found');

    const revisions = await this.prisma.productionTestReport.findMany({
      where: { companyId, reportNumber: report.reportNumber },
      select: {
        id: true,
        revision: true,
        isLatest: true,
        status: true,
        createdAt: true,
        approvedByName: true,
      },
      orderBy: { revision: 'desc' },
    });

    return { ...report, revisions };
  }

  async createReport(dto: any, userId: string, companyId: string) {
    if (!userId || !companyId)
      throw new UnauthorizedException('Authentication required');
    if (!dto.clientName || typeof dto.clientName !== 'string' || !dto.clientName.trim()) {
      throw new BadRequestException('Client Name is required.');
    }
    if (!dto.productName || typeof dto.productName !== 'string' || !dto.productName.trim()) {
      throw new BadRequestException('Product Name is required.');
    }

    // Generate unique reportNumber if not provided
    const year = new Date().getFullYear();
    let reportNumber = dto.reportNumber?.trim();
    if (!reportNumber) {
      const count = await this.prisma.productionTestReport.count({
        where: { companyId },
      });
      reportNumber = `TC-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    // Verify uniqueness of (companyId, reportNumber, revision: 0)
    const existing = await this.prisma.productionTestReport.findUnique({
      where: {
        companyId_reportNumber_revision: {
          companyId,
          reportNumber,
          revision: 0,
        },
      },
    });
    if (existing) {
      // Append random suffix or next counter to avoid conflict
      const count = await this.prisma.productionTestReport.count({
        where: { companyId },
      });
      reportNumber = `TC-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    const defaultTpl = this.getDefaultTemplate();
    const specs = Array.isArray(dto.specifications) && dto.specifications.length > 0
      ? dto.specifications
      : defaultTpl.specifications;

    const loadRows = Array.isArray(dto.loadTestingRows) && dto.loadTestingRows.length > 0
      ? dto.loadTestingRows
      : defaultTpl.loadTestingRows;

    const cycleLoadsTon = dto.cycleLoadsTon?.trim() || '';
    const finalLoadTon = dto.finalLoadTon?.trim() || '';
    const cycleStatement = dto.cycleStatement ||
      (cycleLoadsTon || finalLoadTon
        ? `Five cycles of ${cycleLoadsTon || '___'} tons were applied & released, followed by the final ${finalLoadTon || '___'} tons load maintained for 30secs.`
        : defaultTpl.cycleStatement);

    const resultStatement = dto.resultStatement || defaultTpl.resultStatement;

    // Never auto-approve: status can only be Draft or Pending Approval
    const status = dto.status === 'Pending Approval' ? 'Pending Approval' : 'Draft';

    const report = await this.prisma.productionTestReport.create({
      data: {
        companyId,
        reportNumber,
        revision: 0,
        isLatest: true,
        reportDate: dto.reportDate ? new Date(dto.reportDate) : new Date(),
        clientName: dto.clientName.trim(),
        poNumber: dto.poNumber?.trim() || null,
        productName: dto.productName.trim(),
        productId: dto.productId || null,
        clearOpening: dto.clearOpening?.trim() || null,
        quantitySupply: dto.quantitySupply?.trim() || null,
        projectName: dto.projectName?.trim() || null,
        specifications: specs,
        loadTestingRows: loadRows,
        cycleLoadsTon: cycleLoadsTon || null,
        finalLoadTon: finalLoadTon || null,
        cycleStatement,
        resultStatement,
        testedByName: dto.testedByName?.trim() || 'Sana Konda Reddy',
        testedByTitle: dto.testedByTitle?.trim() || 'Plant Head',
        testedByStamp: dto.testedByStamp !== false,
        testedBySignature: dto.testedBySignature !== false,
        status,
        remarks: dto.remarks?.trim() || null,
        testingRecordId: dto.testingRecordId || null,
        createdById: userId,
      },
    });

    return report;
  }

  async updateReport(id: string, dto: any, userId: string, companyId: string) {
    const existing = await this.getReport(id, companyId);
    if (existing.status === 'Approved') {
      throw new BadRequestException(
        'Approved test certificates are revision-controlled and cannot be directly modified. Create a new revision instead.',
      );
    }

    const cycleLoadsTon = dto.cycleLoadsTon !== undefined ? dto.cycleLoadsTon?.trim() : existing.cycleLoadsTon;
    const finalLoadTon = dto.finalLoadTon !== undefined ? dto.finalLoadTon?.trim() : existing.finalLoadTon;
    let cycleStatement = dto.cycleStatement;
    if (!cycleStatement && (dto.cycleLoadsTon !== undefined || dto.finalLoadTon !== undefined)) {
      cycleStatement = `Five cycles of ${cycleLoadsTon || '___'} tons were applied & released, followed by the final ${finalLoadTon || '___'} tons load maintained for 30secs.`;
    }

    const updated = await this.prisma.productionTestReport.update({
      where: { id },
      data: {
        clientName: dto.clientName !== undefined ? dto.clientName.trim() : existing.clientName,
        poNumber: dto.poNumber !== undefined ? dto.poNumber?.trim() || null : existing.poNumber,
        productName: dto.productName !== undefined ? dto.productName.trim() : existing.productName,
        productId: dto.productId !== undefined ? dto.productId : existing.productId,
        clearOpening: dto.clearOpening !== undefined ? dto.clearOpening?.trim() || null : existing.clearOpening,
        quantitySupply: dto.quantitySupply !== undefined ? dto.quantitySupply?.trim() || null : existing.quantitySupply,
        projectName: dto.projectName !== undefined ? dto.projectName?.trim() || null : existing.projectName,
        reportDate: dto.reportDate ? new Date(dto.reportDate) : existing.reportDate,
        specifications: dto.specifications !== undefined ? dto.specifications : existing.specifications,
        loadTestingRows: dto.loadTestingRows !== undefined ? dto.loadTestingRows : existing.loadTestingRows,
        cycleLoadsTon: cycleLoadsTon || null,
        finalLoadTon: finalLoadTon || null,
        cycleStatement: cycleStatement || existing.cycleStatement,
        resultStatement: dto.resultStatement !== undefined ? dto.resultStatement : existing.resultStatement,
        testedByName: dto.testedByName !== undefined ? dto.testedByName : existing.testedByName,
        testedByTitle: dto.testedByTitle !== undefined ? dto.testedByTitle : existing.testedByTitle,
        testedByStamp: dto.testedByStamp !== undefined ? dto.testedByStamp : existing.testedByStamp,
        testedBySignature: dto.testedBySignature !== undefined ? dto.testedBySignature : existing.testedBySignature,
        status: dto.status && ['Draft', 'Pending Approval'].includes(dto.status) ? dto.status : existing.status,
        remarks: dto.remarks !== undefined ? dto.remarks : existing.remarks,
        updatedById: userId,
      },
    });

    return updated;
  }

  async updateReportStatus(
    id: string,
    dto: { status: 'Approved' | 'Rejected'; rejectionReason?: string; remarks?: string },
    userId: string,
    companyId: string,
  ) {
    const report = await this.getReport(id, companyId);

    if (dto.status === 'Approved') {
      // Validate that actual load measurements exist and are non-empty
      const loadRows = (report.loadTestingRows as any[]) || [];
      const hasEmpty = loadRows.some(
        (r) => !r.load || String(r.load).trim() === '' || !r.remark || String(r.remark).trim() === '',
      );
      if (hasEmpty) {
        throw new BadRequestException(
          'Cannot approve test certificate without verified load test measurements and remarks for all test stages.',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: { select: { name: true } } },
      });

      return this.prisma.productionTestReport.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedByName: user?.name || 'Plant Head',
          approvedByTitle: user?.role?.name || 'Authorized Approver',
          approvedAt: new Date(),
          approvedById: userId,
          approvedBySignature: true,
          remarks: dto.remarks ?? report.remarks,
        },
      });
    }

    if (dto.status === 'Rejected') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: { select: { name: true } } },
      });

      return this.prisma.productionTestReport.update({
        where: { id },
        data: {
          status: 'Rejected',
          rejectionReason: dto.rejectionReason || 'Failed load test parameters.',
          approvedByName: user?.name || 'Plant Head',
          approvedAt: new Date(),
          approvedById: userId,
          remarks: dto.remarks ?? report.remarks,
        },
      });
    }

    throw new BadRequestException('Invalid status update request.');
  }

  async createRevision(id: string, userId: string, companyId: string) {
    const original = await this.getReport(id, companyId);

    const maxRevRecord = await this.prisma.productionTestReport.findFirst({
      where: { companyId, reportNumber: original.reportNumber },
      orderBy: { revision: 'desc' },
    });
    const newRevisionNumber = (maxRevRecord?.revision ?? original.revision) + 1;

    // Mark previous revisions as not latest
    await this.prisma.productionTestReport.updateMany({
      where: { companyId, reportNumber: original.reportNumber },
      data: { isLatest: false },
    });

    // Create new revision in Draft status
    const newReport = await this.prisma.productionTestReport.create({
      data: {
        companyId,
        reportNumber: original.reportNumber,
        revision: newRevisionNumber,
        isLatest: true,
        parentReportId: original.id,
        reportDate: new Date(),
        clientName: original.clientName,
        poNumber: original.poNumber,
        productName: original.productName,
        productId: original.productId,
        clearOpening: original.clearOpening,
        quantitySupply: original.quantitySupply,
        projectName: original.projectName,
        specifications: original.specifications as any,
        loadTestingRows: original.loadTestingRows as any,
        cycleLoadsTon: original.cycleLoadsTon,
        finalLoadTon: original.finalLoadTon,
        cycleStatement: original.cycleStatement,
        resultStatement: original.resultStatement,
        testedByName: original.testedByName,
        testedByTitle: original.testedByTitle,
        testedByStamp: original.testedByStamp,
        testedBySignature: original.testedBySignature,
        status: 'Draft',
        approvedByName: null,
        approvedByTitle: null,
        approvedAt: null,
        approvedById: null,
        approvedBySignature: false,
        rejectionReason: null,
        remarks: `Revision ${newRevisionNumber} created from Revision ${original.revision}.`,
        testingRecordId: original.testingRecordId,
        createdById: userId,
      },
    });

    return newReport;
  }

  async deleteReport(id: string, companyId: string) {
    const report = await this.prisma.productionTestReport.findFirst({
      where: {
        OR: [{ id }, { reportNumber: id }],
        ...(companyId ? { companyId } : {}),
      },
    });

    const targetReport = report || (await this.prisma.productionTestReport.findFirst({
      where: {
        OR: [{ id }, { reportNumber: id }],
      },
    }));

    if (!targetReport) {
      throw new NotFoundException('Test certificate not found');
    }

    // Unlink any parent revisions pointing to this report
    await this.prisma.productionTestReport.updateMany({
      where: { parentReportId: targetReport.id },
      data: { parentReportId: null },
    });

    return this.prisma.productionTestReport.delete({
      where: { id: targetReport.id },
    });
  }
}

