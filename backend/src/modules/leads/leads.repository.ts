import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, Lead } from '@prisma/client';

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return this.prisma.lead.create({ data });
  }

  async findUnique(where: Prisma.LeadWhereUniqueInput): Promise<Lead | null> {
    return this.prisma.lead.findUnique({ where, include: { followups: true, reminders: true } });
  }

  async findFirst(where: Prisma.LeadWhereInput): Promise<Lead | null> {
    return this.prisma.lead.findFirst({ where, include: { followups: true, reminders: true } });
  }

  async update(where: Prisma.LeadWhereUniqueInput, data: Prisma.LeadUpdateInput): Promise<Lead> {
    return this.prisma.lead.update({ where, data, include: { followups: true, reminders: true } });
  }
}
