import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandAnalysisDto, ApproveBrandAnalysisDto, RejectBrandAnalysisDto, StartBrandAnalysisDto, CompleteBrandAnalysisDto } from './dto/brand-analysis.dto';
import { BrandAnalysisRequestStatus } from '@prisma/client';

@Injectable()
export class BrandAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateRequestNumber(companyId: string = 'COMP-000001'): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.prisma.$transaction(async (tx) => {
      const sequence = await tx.documentSequence.upsert({
        where: {
          companyId_documentType_year: {
            companyId,
            documentType: 'BAR',
            year
          }
        },
        update: {
          currentNumber: { increment: 1 }
        },
        create: {
          companyId,
          documentType: 'BAR',
          prefix: 'BAR',
          year,
          currentNumber: 1
        }
      });
      return sequence;
    });

    const number = result.currentNumber.toString().padStart(5, '0');
    return `BAR-${year}-${number}`;
  }

  async create(dto: CreateBrandAnalysisDto, userId: string) {
    const requestNo = await this.generateRequestNumber();

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.brandAnalysisRequest.create({
        data: {
          requestNo,
          productName: dto.productName,
          brandName: dto.brandName,
          quantity: dto.quantity,
          quantityUnit: dto.quantityUnit,
          imageUrl: dto.imageUrl,
          imageOriginalName: dto.imageOriginalName,
          reason: dto.reason,
          orderDetails: dto.orderDetails,
          requiredByDate: dto.requiredByDate ? new Date(dto.requiredByDate) : null,
          remarks: dto.remarks,
          requestedById: userId,
          status: 'PENDING_SUPER_ADMIN_APPROVAL',
        },
      });

      await tx.brandAnalysisHistory.create({
        data: {
          requestId: request.id,
          toStatus: 'PENDING_SUPER_ADMIN_APPROVAL',
          action: 'CREATED',
          performedById: userId,
        },
      });

      return request;
    });
  }

  async findAllForStore(userId: string) {
    return this.prisma.brandAnalysisRequest.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForSuperAdmin() {
    return this.prisma.brandAnalysisRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, name: true } },
      }
    });
  }

  async findAllForFinance() {
    return this.prisma.brandAnalysisRequest.findMany({
      where: {
        status: {
          in: ['SUPER_ADMIN_APPROVED', 'FINANCE_ANALYSIS_IN_PROGRESS', 'FINANCE_ANALYSIS_COMPLETED']
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      }
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.brandAnalysisRequest.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          include: { performedBy: { select: { name: true } } },
        },
        requestedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        rejectedBy: { select: { name: true } },
        financeStartedBy: { select: { name: true } },
        financeCompletedBy: { select: { name: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Brand Analysis Request not found');
    }

    return request;
  }

  async approve(id: string, dto: ApproveBrandAnalysisDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.brandAnalysisRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Request not found');
      if (request.version !== dto.version) throw new ConflictException('Data has been modified by another user. Please refresh and try again.');
      if (request.status !== 'PENDING_SUPER_ADMIN_APPROVAL') throw new BadRequestException('Request is not in pending state');

      const updated = await tx.brandAnalysisRequest.update({
        where: { id },
        data: {
          status: 'SUPER_ADMIN_APPROVED',
          version: { increment: 1 },
          approvedById: userId,
          approvedAt: new Date(),
          approvalRemarks: dto.remarks,
        },
      });

      await tx.brandAnalysisHistory.create({
        data: {
          requestId: id,
          fromStatus: request.status,
          toStatus: 'SUPER_ADMIN_APPROVED',
          action: 'APPROVED',
          remarks: dto.remarks,
          performedById: userId,
        },
      });

      return updated;
    });
  }

  async reject(id: string, dto: RejectBrandAnalysisDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.brandAnalysisRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Request not found');
      if (request.version !== dto.version) throw new ConflictException('Data has been modified by another user. Please refresh and try again.');
      if (request.status !== 'PENDING_SUPER_ADMIN_APPROVAL') throw new BadRequestException('Request is not in pending state');

      const updated = await tx.brandAnalysisRequest.update({
        where: { id },
        data: {
          status: 'SUPER_ADMIN_REJECTED',
          version: { increment: 1 },
          rejectedById: userId,
          rejectedAt: new Date(),
          rejectionReason: dto.reason,
        },
      });

      await tx.brandAnalysisHistory.create({
        data: {
          requestId: id,
          fromStatus: request.status,
          toStatus: 'SUPER_ADMIN_REJECTED',
          action: 'REJECTED',
          remarks: dto.reason,
          performedById: userId,
        },
      });

      return updated;
    });
  }

  async startAnalysis(id: string, dto: StartBrandAnalysisDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.brandAnalysisRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Request not found');
      if (request.version !== dto.version) throw new ConflictException('Data has been modified by another user. Please refresh and try again.');
      if (request.status !== 'SUPER_ADMIN_APPROVED') throw new BadRequestException('Request is not approved by super admin');

      const updated = await tx.brandAnalysisRequest.update({
        where: { id },
        data: {
          status: 'FINANCE_ANALYSIS_IN_PROGRESS',
          version: { increment: 1 },
          financeStartedById: userId,
          financeStartedAt: new Date(),
          financeInitialRemarks: dto.remarks,
        },
      });

      await tx.brandAnalysisHistory.create({
        data: {
          requestId: id,
          fromStatus: request.status,
          toStatus: 'FINANCE_ANALYSIS_IN_PROGRESS',
          action: 'ANALYSIS_STARTED',
          remarks: dto.remarks,
          performedById: userId,
        },
      });

      return updated;
    });
  }

  async completeAnalysis(id: string, dto: CompleteBrandAnalysisDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.brandAnalysisRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Request not found');
      if (request.version !== dto.version) throw new ConflictException('Data has been modified by another user. Please refresh and try again.');
      if (request.status !== 'FINANCE_ANALYSIS_IN_PROGRESS') throw new BadRequestException('Request is not in progress');

      const updated = await tx.brandAnalysisRequest.update({
        where: { id },
        data: {
          status: 'FINANCE_ANALYSIS_COMPLETED',
          version: { increment: 1 },
          financeCompletedById: userId,
          financeCompletedAt: new Date(),
          analysisResult: dto.analysisResult,
          recommendedBrand: dto.recommendedBrand,
          estimatedUnitCost: dto.estimatedUnitCost,
          estimatedTotalCost: dto.estimatedTotalCost,
          supplierName: dto.supplierName,
          financeRemarks: dto.financeRemarks,
          recommendation: dto.recommendation,
          analysisDocumentUrl: dto.analysisDocumentUrl,
        },
      });

      await tx.brandAnalysisHistory.create({
        data: {
          requestId: id,
          fromStatus: request.status,
          toStatus: 'FINANCE_ANALYSIS_COMPLETED',
          action: 'ANALYSIS_COMPLETED',
          remarks: dto.financeRemarks,
          performedById: userId,
        },
      });

      return updated;
    });
  }
}
