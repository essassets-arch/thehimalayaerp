import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import {
  CreateDispatchDailyReportDto,
  UpdateDispatchDailyReportDto,
  QueryDispatchDailyReportDto,
  CreateDispatchDailyReportItemDto,
} from './dto/dispatch-daily-report.dto';
import { Prisma } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class DispatchDailyReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly inventoryService: InventoryService,
  ) {}

  private getSequencePrefix(date: Date, dispatchType: string): { key: string; prefix: string } {
    const yyyy = date.getFullYear();
    const isD1 = dispatchType === 'DISPATCH_1';
    const base = isD1 ? 'DR' : 'DR2';
    return {
      key: `${base}-${yyyy}`,
      prefix: `${base}-${yyyy}-`,
    };
  }

  private async processItemsData(
    items: CreateDispatchDailyReportItemDto[],
    companyId: string,
  ) {
    if (!items || items.length === 0) {
      return {
        processedItems: [],
        totalCovers: 0,
        totalFrames: 0,
        totalSets: 0,
        totalCoverWeight: new Prisma.Decimal(0),
        totalFrameWeight: new Prisma.Decimal(0),
        totalWeight: new Prisma.Decimal(0),
      };
    }

    const productIds = Array.from(new Set(items.map((i) => i.productId).filter(Boolean)));
    const products = productIds.length > 0
      ? await this.prisma.product.findMany({
          where: {
            id: { in: productIds as string[] },
            companyId,
          },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalCovers = 0;
    let totalFrames = 0;
    let totalSets = 0;
    let totalCoverWeightNum = 0;
    let totalFrameWeightNum = 0;
    let totalWeightNum = 0;

    const processedItems = items.map((item, index) => {
      const product = item.productId ? productMap.get(item.productId) : null;
      const customProductName = item.customProductName || (!product ? item.productId : null);

      const srNo = item.srNo || index + 1;
      const size = item.size || product?.size || product?.variantDetails || '';
      const type = item.type || product?.type || product?.brand || '';
      const capacity = item.capacity || product?.capacity || '';

      const coverQty = Math.max(0, Math.floor(Number(item.coverQty || 0)));
      const frameQty = Math.max(0, Math.floor(Number(item.frameQty || 0)));

      const coverUnitWeight =
        item.coverUnitWeight !== undefined && item.coverUnitWeight !== null
          ? Number(item.coverUnitWeight)
          : Number(product?.coverUnitWeight || product?.weight || 0);

      const frameUnitWeight =
        item.frameUnitWeight !== undefined && item.frameUnitWeight !== null
          ? Number(item.frameUnitWeight)
          : Number(product?.frameUnitWeight || 0);

      const calculatedCoverWeight = coverQty * coverUnitWeight;
      const actualCoverWeight =
        item.actualCoverWeight !== undefined && item.actualCoverWeight !== null
          ? Number(item.actualCoverWeight)
          : null;
      const coverWeight = actualCoverWeight !== null ? actualCoverWeight : calculatedCoverWeight;

      const calculatedFrameWeight = frameQty * frameUnitWeight;
      const actualFrameWeight =
        item.actualFrameWeight !== undefined && item.actualFrameWeight !== null
          ? Number(item.actualFrameWeight)
          : null;
      const frameWeight = actualFrameWeight !== null ? actualFrameWeight : calculatedFrameWeight;

      const totalWeight = coverWeight + frameWeight;

      const coversPerSet = Math.max(1, product?.coversPerSet || 1);
      const framesPerSet = Math.max(1, product?.framesPerSet || 1);

      const setsFromCovers = Math.floor(coverQty / coversPerSet);
      const setsFromFrames = frameQty > 0 ? Math.floor(frameQty / framesPerSet) : 0;
      const setQty =
        item.setQty !== undefined && item.setQty !== null
          ? Math.max(0, Math.floor(Number(item.setQty)))
          : Math.min(setsFromCovers, setsFromFrames);

      totalCovers += coverQty;
      totalFrames += frameQty;
      totalSets += setQty;
      totalCoverWeightNum += coverWeight;
      totalFrameWeightNum += frameWeight;
      totalWeightNum += totalWeight;

      return {
        srNo,
        productId: product ? product.id : null,
        customProductName: customProductName || null,
        size,
        type,
        capacity,
        coverQty,
        coverUnitWeight: new Prisma.Decimal(coverUnitWeight),
        coverWeight: new Prisma.Decimal(coverWeight),
        actualCoverWeight: actualCoverWeight !== null ? new Prisma.Decimal(actualCoverWeight) : null,
        frameQty,
        frameUnitWeight: new Prisma.Decimal(frameUnitWeight),
        frameWeight: new Prisma.Decimal(frameWeight),
        actualFrameWeight: actualFrameWeight !== null ? new Prisma.Decimal(actualFrameWeight) : null,
        weightOverrideReason: item.weightOverrideReason || null,
        setQty,
        totalWeight: new Prisma.Decimal(totalWeight),
        remarks: item.remarks || null,
      };
    });

    return {
      processedItems,
      totalCovers,
      totalFrames,
      totalSets,
      totalCoverWeight: new Prisma.Decimal(totalCoverWeightNum),
      totalFrameWeight: new Prisma.Decimal(totalFrameWeightNum),
      totalWeight: new Prisma.Decimal(totalWeightNum),
    };
  }

  async listReports(companyId: string, dispatchType: string, query: QueryDispatchDailyReportDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const skip = (page - 1) * limit;

    const where: Prisma.DispatchDailyReportWhereInput = {
      companyId,
      dispatchType,
    };

    if (query.shift) {
      where.shift = query.shift;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.createdById) {
      where.createdById = query.createdById;
    }

    let start: Date | null = null;
    let end: Date | null = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (query.preset) {
      const presetLower = query.preset.toLowerCase();
      if (presetLower === 'today') {
        start = new Date(today);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
      } else if (presetLower === 'yesterday') {
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
      } else if (presetLower === 'this week' || presetLower === 'this_week') {
        start = new Date(today);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
      } else if (presetLower === 'this month' || presetLower === 'this_month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      }
    } else {
      if (query.startDate) {
        start = new Date(query.startDate);
      }
      if (query.endDate) {
        end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (start || end) {
      where.reportDate = {};
      if (start) where.reportDate.gte = start;
      if (end) where.reportDate.lte = end;
    }

    if (query.search || query.product || query.type || query.capacity) {
      const searchItemConditions: Prisma.DispatchDailyReportItemWhereInput[] = [];

      if (query.product) {
        searchItemConditions.push({
          product: {
            OR: [
              { name: { contains: query.product, mode: 'insensitive' } },
              { sku: { contains: query.product, mode: 'insensitive' } },
            ],
          },
        });
      }

      if (query.type) {
        searchItemConditions.push({ type: { contains: query.type, mode: 'insensitive' } });
      }

      if (query.capacity) {
        searchItemConditions.push({ capacity: { contains: query.capacity, mode: 'insensitive' } });
      }

      if (query.search) {
        const s = query.search.trim();
        where.OR = [
          { reportNo: { contains: s, mode: 'insensitive' } },
          { dispatchExecutive: { contains: s, mode: 'insensitive' } },
          {
            items: {
              some: {
                OR: [
                  { size: { contains: s, mode: 'insensitive' } },
                  { type: { contains: s, mode: 'insensitive' } },
                  { capacity: { contains: s, mode: 'insensitive' } },
                  { product: { name: { contains: s, mode: 'insensitive' } } },
                  { product: { sku: { contains: s, mode: 'insensitive' } } },
                ],
              },
            },
          },
        ];
      }

      if (searchItemConditions.length > 0) {
        where.items = {
          some: {
            AND: searchItemConditions,
          },
        };
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.dispatchDailyReport.count({ where }),
      this.prisma.dispatchDailyReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportDate: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: items.map((r) => ({
        ...r,
        rowCount: r._count.items,
      })),
    };
  }

  async checkDuplicate(companyId: string, dateStr: string, shift: string, dispatchType: string) {
    const reportDate = new Date(dateStr);
    reportDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dispatchDailyReport.findFirst({
      where: {
        companyId,
        reportDate,
        shift,
        dispatchType,
      },
      select: {
        id: true,
        reportNo: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      exists: !!existing,
      report: existing,
    };
  }

  async getReport(companyId: string, idOrReportNo: string, dispatchType: string) {
    const report = await this.prisma.dispatchDailyReport.findFirst({
      where: {
        companyId,
        dispatchType,
        OR: [{ id: idOrReportNo }, { reportNo: idOrReportNo }],
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          orderBy: { srNo: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                unit: true,
                coverUnitWeight: true,
                frameUnitWeight: true,
                coversPerSet: true,
                framesPerSet: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Daily Dispatch Report '${idOrReportNo}' not found`);
    }

    return report;
  }

  async createReport(companyId: string, userId: string, dto: CreateDispatchDailyReportDto, dispatchType: string) {
    const reportDate = new Date(dto.reportDate);
    reportDate.setHours(0, 0, 0, 0);

    const { key, prefix } = this.getSequencePrefix(reportDate, dispatchType);

    return this.prisma.$transaction(async (tx) => {
      const reportNo = await this.sequenceService.generateNextWithTx(tx, key, prefix, 6);
      const {
        processedItems,
        totalCovers,
        totalFrames,
        totalSets,
        totalCoverWeight,
        totalFrameWeight,
        totalWeight,
      } = await this.processItemsData(dto.items || [], companyId);

      const report = await tx.dispatchDailyReport.create({
        data: {
          reportNo,
          reportDate,
          shift: dto.shift || 'Morning',
          dispatchExecutive: dto.dispatchExecutive || null,
          dispatchType,
          status: 'DRAFT',
          totalCovers,
          totalFrames,
          totalSets,
          totalCoverWeight,
          totalFrameWeight,
          totalWeight,
          companyId,
          createdById: userId,
          items: {
            create: processedItems,
          },
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          items: {
            orderBy: { srNo: 'asc' },
            include: {
              product: true,
            },
          },
        },
      });

      return report;
    });
  }

  async updateReport(
    companyId: string,
    userId: string,
    id: string,
    dto: UpdateDispatchDailyReportDto,
    dispatchType: string,
  ) {
    const report = await this.prisma.dispatchDailyReport.findFirst({
      where: { id, companyId, dispatchType },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (report.status === 'APPROVED') {
      throw new ForbiddenException(`Cannot edit an APPROVED dispatch report`);
    }

    const reportDate = dto.reportDate ? new Date(dto.reportDate) : report.reportDate;
    reportDate.setHours(0, 0, 0, 0);

    return this.prisma.$transaction(async (tx) => {
      let itemsUpdate: any = {};

      let totalCovers = report.totalCovers;
      let totalFrames = report.totalFrames;
      let totalSets = report.totalSets;
      let totalCoverWeight = report.totalCoverWeight;
      let totalFrameWeight = report.totalFrameWeight;
      let totalWeight = report.totalWeight;

      if (dto.items !== undefined) {
        const processed = await this.processItemsData(dto.items, companyId);
        totalCovers = processed.totalCovers;
        totalFrames = processed.totalFrames;
        totalSets = processed.totalSets;
        totalCoverWeight = processed.totalCoverWeight;
        totalFrameWeight = processed.totalFrameWeight;
        totalWeight = processed.totalWeight;

        await tx.dispatchDailyReportItem.deleteMany({
          where: { reportId: id },
        });

        itemsUpdate = {
          create: processed.processedItems,
        };
      }

      const updated = await tx.dispatchDailyReport.update({
        where: { id },
        data: {
          reportDate,
          shift: dto.shift !== undefined ? dto.shift : report.shift,
          dispatchExecutive:
            dto.dispatchExecutive !== undefined ? dto.dispatchExecutive : report.dispatchExecutive,
          totalCovers,
          totalFrames,
          totalSets,
          totalCoverWeight,
          totalFrameWeight,
          totalWeight,
          updatedById: userId,
          items: itemsUpdate,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          items: {
            orderBy: { srNo: 'asc' },
            include: {
              product: true,
            },
          },
        },
      });

      return updated;
    });
  }

  async deleteReport(companyId: string, userId: string, id: string, dispatchType: string) {
    const report = await this.prisma.dispatchDailyReport.findFirst({
      where: { id, companyId, dispatchType },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (report.status !== 'DRAFT') {
      throw new ForbiddenException(`Only DRAFT reports can be deleted`);
    }

    await this.prisma.dispatchDailyReport.delete({
      where: { id },
    });

    return { success: true, message: `Report ${report.reportNo} deleted successfully` };
  }

  async submitReport(companyId: string, userId: string, id: string, dispatchType: string) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.dispatchDailyReport.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!report || report.companyId !== companyId || report.dispatchType !== dispatchType) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      if (report.items.length === 0) {
        throw new BadRequestException(`Cannot submit an empty report with no dispatch rows`);
      }

      if (report.status !== 'DRAFT') {
        throw new BadRequestException(`Only DRAFT reports can be submitted (current status: ${report.status})`);
      }

      if (report.stockPostedAt) {
        throw new BadRequestException(`Stock has already been deducted for this report`);
      }

      for (const item of report.items) {
        if (item.coverQty < 0 || item.frameQty < 0 || item.setQty < 0) {
          throw new BadRequestException(`Invalid negative quantity found in line item Sr #${item.srNo}`);
        }
        if (Number(item.totalWeight) < 0) {
          throw new BadRequestException(`Invalid negative weight found in line item Sr #${item.srNo}`);
        }
      }

      // Deduct stock for each product row
      for (const item of report.items) {
        if (item.productId && item.setQty > 0) {
          await this.inventoryService.stockOutFinishedGoods(
            tx,
            companyId,
            item.productId,
            item.setQty,
            'DISPATCH_REPORT',
            report.id,
            item.id,
            report.reportNo,
            userId,
            `Dispatch Report submission ${report.reportNo}`
          );
        }
      }

      const updated = await tx.dispatchDailyReport.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedById: userId,
          submittedAt: new Date(),
          stockPostedAt: new Date(),
          stockPostedBy: userId,
          stockTransactionId: report.reportNo,
          updatedById: userId,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          items: {
            orderBy: { srNo: 'asc' },
            include: { product: true },
          },
        },
      });

      return updated;
    });
  }

  async cancelReport(companyId: string, userId: string, id: string, dispatchType: string) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.dispatchDailyReport.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!report || report.companyId !== companyId || report.dispatchType !== dispatchType) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      if (report.status !== 'SUBMITTED' && report.status !== 'APPROVED') {
        throw new BadRequestException(`Only SUBMITTED or APPROVED reports can be cancelled`);
      }

      // Re-add stock back since dispatch was cancelled
      if (report.stockPostedAt) {
        for (const item of report.items) {
          if (item.productId && item.setQty > 0) {
            await this.inventoryService.stockInFinishedGoods(
              tx,
              companyId,
              item.productId,
              item.setQty,
              'DISPATCH_REPORT_CANCEL',
              report.id,
              item.id,
              report.reportNo,
              userId,
              `Cancellation reversal of Dispatch Report ${report.reportNo}`,
              'DISPATCH_REVERSAL'
            );
          }
        }
      }

      const updated = await tx.dispatchDailyReport.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          stockPostedAt: null,
          stockPostedBy: null,
          stockTransactionId: null,
          updatedById: userId,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          items: {
            orderBy: { srNo: 'asc' },
            include: { product: true },
          },
        },
      });

      return updated;
    });
  }
}
