import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { DomainErrorCodes } from '../../common/errors/domain-errors';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TransitionLeadDto } from './dto/transition-lead.dto';
import { AddFollowupDto } from './dto/add-followup.dto';
import { AddReminderDto } from './dto/add-reminder.dto';
import { MarkLeadLostDto } from './dto/mark-lead-lost.dto';
import { ListLeadsQueryDto } from './dto/list-leads-query.dto';
import { LeadMapper } from './mappers/lead.mapper';
import { LeadResponseDto } from './dto/lead-response.dto';
import { LeadListResponseDto } from './dto/lead-list-response.dto';
import { LeadTransitionPolicy } from './policies/lead-transition.policy';
import { Prisma, LeadStatus, LeadQualificationStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  private checkVersion(currentVersion: number, expectedVersion: number) {
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({
        statusCode: 409,
        code: DomainErrorCodes.VERSION_CONFLICT || 'VERSION_CONFLICT',
        message: 'This Lead was modified by another user.',
        details: { expectedVersion, currentVersion },
      });
    }
  }

  async createLead(dto: CreateLeadDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // Duplicate prevention
      let normalizedPhone = dto.phone?.trim();
      let normalizedEmail = dto.email?.trim().toLowerCase();

      if (!normalizedPhone && !normalizedEmail) {
        throw new BadRequestException('At least one of email or phone is required.');
      }

      const duplicateWhere: Prisma.LeadWhereInput = {
        companyName: { equals: dto.companyName, mode: 'insensitive' },
        leadStatus: { notIn: [LeadStatus.LOST, LeadStatus.CANCELLED, LeadStatus.CONVERTED] },
        OR: [],
      };
      if (normalizedEmail) duplicateWhere.OR.push({ email: normalizedEmail });
      if (normalizedPhone) duplicateWhere.OR.push({ phone: normalizedPhone });

      const existing = await tx.lead.findFirst({ where: duplicateWhere });
      if (existing) {
        throw new ConflictException({
          statusCode: 409,
          code: 'LEAD_ALREADY_EXISTS',
          message: 'An active Lead already exists for this contact.',
          details: { leadId: existing.id, leadNumber: existing.leadNumber },
        });
      }

      const leadNumber = await this.sequenceService.generateNextWithTx(tx, 'lead_number', 'LEAD-');

      const lead = await tx.lead.create({
        data: {
          leadNumber,
          companyName: dto.companyName,
          contactPerson: dto.contactPerson,
          email: normalizedEmail,
          phone: normalizedPhone,
          source: dto.source,
          productInterest: dto.productInterest,
          estimatedQuantity: dto.estimatedQuantity,
          unit: dto.unit,
          remarks: dto.remarks,
          assignedToId: dto.assignedToId,
          leadStatus: LeadStatus.NEW,
          qualificationStatus: LeadQualificationStatus.NOT_REVIEWED,
          createdById: userId,
        },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_CREATED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          toStatus: lead.leadStatus,
          after: JSON.parse(JSON.stringify(lead)),
        },
      });

      return LeadMapper.toDto(lead);
    });
  }

  async getLead(id: string): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findUnique({ id });
    if (!lead) throw new NotFoundException('Lead not found');
    return LeadMapper.toDto(lead);
  }

  async listLeads(query: ListLeadsQueryDto): Promise<LeadListResponseDto> {
    const { page = 1, pageSize = 25, search, leadStatus, qualificationStatus, assignedToId, createdFrom, createdTo } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LeadWhereInput = {};
    if (leadStatus) where.leadStatus = leadStatus;
    if (qualificationStatus) where.qualificationStatus = qualificationStatus;
    if (assignedToId) where.assignedToId = assignedToId;
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }
    if (search) {
      where.OR = [
        { leadNumber: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({ where, skip, take: pageSize, include: { followups: true, reminders: true }, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      data: data.map(LeadMapper.toDto),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async updateLead(id: string, dto: UpdateLeadDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      
      this.checkVersion(lead.version, dto.expectedVersion);

      const updateData: any = { ...dto, version: { increment: 1 }, updatedById: userId };
      delete updateData.expectedVersion;

      const updated = await tx.lead.update({
        where: { id },
        data: updateData,
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_UPDATED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          before: JSON.parse(JSON.stringify(lead)),
          after: JSON.parse(JSON.stringify(updated)),
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async qualifyLead(id: string, dto: TransitionLeadDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      this.checkVersion(lead.version, dto.expectedVersion);

      LeadTransitionPolicy.assertCanTransition(lead.leadStatus, LeadStatus.QUALIFIED);

      const updated = await tx.lead.update({
        where: { id },
        data: {
          leadStatus: LeadStatus.QUALIFIED,
          qualificationStatus: dto.qualificationStatus || LeadQualificationStatus.QUALIFIED,
          remarks: dto.remarks || lead.remarks,
          version: { increment: 1 },
          updatedById: userId,
        },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_QUALIFIED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          fromStatus: lead.leadStatus,
          toStatus: updated.leadStatus,
          remarks: dto.remarks,
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async addFollowup(id: string, dto: AddFollowupDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      this.checkVersion(lead.version, dto.expectedVersion);

      await tx.leadFollowup.create({
        data: {
          leadId: id,
          followupType: dto.followupType,
          notes: dto.notes,
          nextActionAt: dto.nextActionAt ? new Date(dto.nextActionAt) : null,
          createdById: userId,
        },
      });

      const updated = await tx.lead.update({
        where: { id },
        data: { version: { increment: 1 }, updatedById: userId },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_FOLLOWUP_ADDED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          remarks: dto.notes,
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async addReminder(id: string, dto: AddReminderDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      this.checkVersion(lead.version, dto.expectedVersion);

      await tx.leadReminder.create({
        data: {
          leadId: id,
          reminderAt: new Date(dto.reminderAt),
          message: dto.message,
          createdById: userId,
        },
      });

      const updated = await tx.lead.update({
        where: { id },
        data: { nextReminderAt: new Date(dto.reminderAt), version: { increment: 1 }, updatedById: userId },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_REMINDER_CREATED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          remarks: dto.message,
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async markLost(id: string, dto: MarkLeadLostDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      this.checkVersion(lead.version, dto.expectedVersion);

      LeadTransitionPolicy.assertCanTransition(lead.leadStatus, LeadStatus.LOST);

      const updated = await tx.lead.update({
        where: { id },
        data: {
          leadStatus: LeadStatus.LOST,
          lostReason: dto.lostReason,
          version: { increment: 1 },
          updatedById: userId,
        },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_MARKED_LOST',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          fromStatus: lead.leadStatus,
          toStatus: updated.leadStatus,
          remarks: dto.lostReason,
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async restoreLead(id: string, dto: TransitionLeadDto, userId: string): Promise<LeadResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) throw new NotFoundException('Lead not found');
      this.checkVersion(lead.version, dto.expectedVersion);

      LeadTransitionPolicy.assertCanTransition(lead.leadStatus, LeadStatus.NEW); // Restore defaults to NEW for now

      const updated = await tx.lead.update({
        where: { id },
        data: {
          leadStatus: LeadStatus.NEW,
          lostReason: null,
          remarks: dto.remarks || lead.remarks,
          version: { increment: 1 },
          updatedById: userId,
        },
        include: { followups: true, reminders: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'LEAD_RESTORED',
          entityType: 'Lead',
          entityId: lead.id,
          actorUserId: userId,
          fromStatus: lead.leadStatus,
          toStatus: updated.leadStatus,
          remarks: dto.remarks,
        },
      });

      return LeadMapper.toDto(updated);
    });
  }

  async getTimeline(id: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType: 'Lead', entityId: id },
      orderBy: { createdAt: 'asc' },
    });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      fromStatus: log.fromStatus,
      toStatus: log.toStatus,
      remarks: log.remarks,
      performedBy: log.actorUserId,
      createdAt: log.createdAt.toISOString(),
    }));
  }
}
