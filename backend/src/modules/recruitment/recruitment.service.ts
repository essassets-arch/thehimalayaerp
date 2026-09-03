import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EmploymentType,
  InterviewResult,
  InterviewStatus,
  Prisma,
  RecruitmentCandidateStatus,
  RecruitmentPriority,
  RecruitmentRequestStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

type Actor = {
  sub: string;
  companyId: string;
  name?: string;
  email?: string;
  role: string;
};
const CLOSED = new Set<RecruitmentRequestStatus>([
  'FULFILLED',
  'REJECTED',
  'WITHDRAWN',
]);
const EDITABLE = new Set<RecruitmentRequestStatus>([
  'DRAFT',
  'OPEN',
  'RETURNED_FOR_CORRECTION',
]);

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  private actorName(actor: Actor) {
    return actor.name || actor.email || actor.role;
  }
  private clean(value: string | number | boolean | null | undefined) {
    const v = String(value ?? '').trim();
    return v || null;
  }
  private include() {
    return {
      candidates: { orderBy: { createdAt: 'desc' as const } },
      interviews: { orderBy: { interviewDate: 'desc' as const } },
      timeline: { orderBy: { createdAt: 'desc' as const } },
    };
  }
  private map(row: any) {
    return {
      ...row,
      candidatesSourced: row.candidates?.length ?? row._count?.candidates ?? 0,
    };
  }
  private validateRequest(dto: any) {
    if (!this.clean(dto.designation))
      throw new BadRequestException('Designation is required.');
    if (!this.clean(dto.department))
      throw new BadRequestException('Department is required.');
    if (!Number.isInteger(Number(dto.vacancies)) || Number(dto.vacancies) < 1) {
      throw new BadRequestException('Vacancies must be greater than zero.');
    }
    if (!this.clean(dto.reasonForHiring))
      throw new BadRequestException('Reason for hiring is required.');
  }
  private requestData(dto: any) {
    return {
      designation: this.clean(dto.designation)!,
      department: this.clean(dto.department)!,
      vacancies: Number(dto.vacancies),
      priority: String(
        dto.priority || 'MEDIUM',
      ).toUpperCase() as RecruitmentPriority,
      employmentType: dto.employmentType
        ? (String(dto.employmentType).toUpperCase() as EmploymentType)
        : null,
      requiredExperience: this.clean(dto.requiredExperience),
      requiredSkills: this.clean(dto.requiredSkills),
      reasonForHiring: this.clean(dto.reasonForHiring)!,
      jobDescription: this.clean(dto.jobDescription),
      requiredByDate: dto.requiredByDate ? new Date(dto.requiredByDate) : null,
    };
  }
  private async getCompanyId(actor: Actor): Promise<string> {
    if (actor?.companyId) return actor.companyId;
    if (actor?.sub) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: actor.sub },
        select: { companyId: true },
      });
      if (dbUser?.companyId) return dbUser.companyId;
    }
    const defaultCompany = await this.prisma.company.findFirst({
      select: { id: true },
    });
    return defaultCompany?.id || 'default-company';
  }

  private async find(id: string, companyId: string) {
    const row = await this.prisma.recruitmentRequest.findFirst({
      where: {
        ...(companyId ? { companyId } : {}),
        OR: [{ id }, { indentNumber: id }],
      },
      include: this.include(),
    });
    if (!row) throw new NotFoundException('Recruitment request not found.');
    return row;
  }
  private ensureOwn(row: any, actor: Actor) {
    if (actor.role !== 'SUPER_ADMIN' && row.requestedById !== actor.sub) {
      throw new ForbiddenException(
        'This recruitment request belongs to another requester.',
      );
    }
  }
  private ensureVersion(row: any, body: any) {
    if (body.version !== undefined && Number(body.version) !== row.version) {
      throw new ConflictException(
        'This request was updated by another user. Refresh and try again.',
      );
    }
  }
  private timeline(
    actor: Actor,
    action: string,
    fromStatus?: RecruitmentRequestStatus,
    toStatus?: RecruitmentRequestStatus,
    remarks?: string,
    metadata?: any,
  ) {
    return {
      action,
      fromStatus,
      toStatus,
      performedById: actor.sub,
      performedByName: this.actorName(actor),
      performedByRole: actor.role,
      remarks: this.clean(remarks),
      metadata: metadata ?? undefined,
    };
  }

  async create(dto: any, actor: Actor) {
    this.validateRequest(dto);
    const resolvedCompanyId = await this.getCompanyId(actor);
    const row = await this.prisma.$transaction(async (db) => {
      const year = new Date().getFullYear();

      // Scan existing requests globally to ensure we start above any pre-seeded indents
      const existingRequests = await db.recruitmentRequest.findMany({
        select: { indentNumber: true },
      });
      let maxNum = 100;
      for (const r of existingRequests) {
        const match = r.indentNumber?.match(/RR-(\d+)/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }

      const seq = await db.documentSequence.upsert({
        where: {
          companyId_documentType_year: {
            companyId: resolvedCompanyId,
            documentType: 'RECRUITMENT',
            year,
          },
        },
        create: {
          companyId: resolvedCompanyId,
          documentType: 'RECRUITMENT',
          prefix: 'RR',
          year,
          currentNumber: maxNum + 1,
        },
        update: { currentNumber: { increment: 1 } },
      });

      let nextNumber = Math.max(seq.currentNumber, maxNum + 1);

      // Guarantee unique indent number globally
      let indentNumber = `RR-${nextNumber}`;
      while (
        await db.recruitmentRequest.findFirst({
          where: { indentNumber },
        })
      ) {
        nextNumber++;
        indentNumber = `RR-${nextNumber}`;
      }

      await db.documentSequence.update({
        where: { id: seq.id },
        data: { currentNumber: nextNumber },
      });

      return db.recruitmentRequest.create({
        data: {
          ...this.requestData(dto),
          companyId: resolvedCompanyId,
          indentNumber,
          requestedById: actor.sub,
          requestedByName: this.actorName(actor),
          requestedByRole: actor.role || 'PLANT_HEAD',
          status: 'OPEN',
          timeline: {
            create: this.timeline(
              actor,
              'Recruitment indent submitted by Plant Head',
              undefined,
              'OPEN',
            ),
          },
        },
        include: this.include(),
      });
    });
    return this.map(row);
  }

  async list(actor: Actor, own: boolean, query: any = {}) {
    const companyId = await this.getCompanyId(actor);
    const where: Prisma.RecruitmentRequestWhereInput = {
      ...(companyId ? { companyId } : {}),
      ...(own ? { requestedById: actor.sub } : {}),
      ...(query.status
        ? {
            status: String(
              query.status,
            ).toUpperCase() as RecruitmentRequestStatus,
          }
        : {}),
    };
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        'indentNumber',
        'designation',
        'department',
        'requestedByName',
      ].map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }
    const rows = await this.prisma.recruitmentRequest.findMany({
      where,
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.map(row));
  }

  async get(id: string, actor: Actor) {
    const companyId = await this.getCompanyId(actor);
    const row = await this.find(id, companyId);
    if (actor.role === 'PLANT_HEAD') this.ensureOwn(row, actor);
    return this.map(row);
  }

  async updateOwn(id: string, dto: any, actor: Actor) {
    const companyId = await this.getCompanyId(actor);
    const current = await this.find(id, companyId);
    this.ensureOwn(current, actor);
    this.ensureVersion(current, dto);
    if (!EDITABLE.has(current.status))
      throw new BadRequestException('This request can no longer be edited.');
    const merged = { ...current, ...dto };
    this.validateRequest(merged);
    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id },
      data: { ...this.requestData(merged), version: { increment: 1 } },
      include: this.include(),
    });
    return this.map(row);
  }

  async resubmit(id: string, dto: any, actor: Actor) {
    const companyId = await this.getCompanyId(actor);
    const current = await this.find(id, companyId);
    this.ensureOwn(current, actor);
    this.ensureVersion(current, dto);
    if (current.status !== 'RETURNED_FOR_CORRECTION')
      throw new BadRequestException(
        'Only returned requests can be resubmitted.',
      );
    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id },
      data: {
        status: 'OPEN',
        correctionReason: null,
        version: { increment: 1 },
        timeline: {
          create: this.timeline(
            actor,
            'Corrected recruitment indent resubmitted',
            current.status,
            'OPEN',
            dto.remarks,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async withdraw(id: string, body: any, actor: Actor) {
    const companyId = await this.getCompanyId(actor);
    const current = await this.find(id, companyId);
    this.ensureOwn(current, actor);
    this.ensureVersion(current, body);
    if (!['OPEN', 'RETURNED_FOR_CORRECTION'].includes(current.status))
      throw new BadRequestException('This request cannot be withdrawn.');
    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
        version: { increment: 1 },
        timeline: {
          create: this.timeline(
            actor,
            'Recruitment indent withdrawn',
            current.status,
            'WITHDRAWN',
            body.remarks,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async transition(
    id: string,
    target: RecruitmentRequestStatus,
    body: any,
    actor: Actor,
  ) {
    const current = await this.find(id, actor.companyId);
    this.ensureVersion(current, body);
    if (CLOSED.has(current.status))
      throw new BadRequestException('A closed request cannot be processed.');
    const allowed: Record<string, RecruitmentRequestStatus[]> = {
      HR_PROCESSING: ['OPEN'],
      RETURNED_FOR_CORRECTION: ['OPEN', 'HR_PROCESSING', 'ON_HOLD'],
      ON_HOLD: [
        'OPEN',
        'HR_PROCESSING',
        'CANDIDATES_SOURCED',
        'INTERVIEWS_SCHEDULED',
        'CANDIDATES_SELECTED',
        'OFFER_IN_PROGRESS',
      ],
      REJECTED: [
        'OPEN',
        'HR_PROCESSING',
        'ON_HOLD',
        'CANDIDATES_SOURCED',
        'INTERVIEWS_SCHEDULED',
      ],
    };
    if (!allowed[target]?.includes(current.status))
      throw new BadRequestException(
        `Cannot move ${current.status} to ${target}.`,
      );
    if (
      ['RETURNED_FOR_CORRECTION', 'ON_HOLD', 'REJECTED'].includes(target) &&
      !this.clean(body.hrRemarks)
    ) {
      throw new BadRequestException('HR remarks are required.');
    }
    if (
      target === 'RETURNED_FOR_CORRECTION' &&
      !this.clean(body.correctionReason)
    )
      throw new BadRequestException('Correction reason is required.');
    if (target === 'REJECTED' && !this.clean(body.rejectionReason))
      throw new BadRequestException('Rejection reason is required.');
    const action = {
      HR_PROCESSING: 'HR started processing recruitment indent',
      RETURNED_FOR_CORRECTION: 'Recruitment indent returned for correction',
      ON_HOLD: 'Recruitment indent put on hold',
      REJECTED: 'Recruitment indent rejected by HR',
    }[target]!;
    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id, version: current.version },
      data: {
        status: target,
        version: { increment: 1 },
        assignedHrUserId: target === 'HR_PROCESSING' ? actor.sub : undefined,
        assignedHrUserName:
          target === 'HR_PROCESSING' ? this.actorName(actor) : undefined,
        processingStartedAt:
          target === 'HR_PROCESSING' ? new Date() : undefined,
        rejectedAt: target === 'REJECTED' ? new Date() : undefined,
        hrRemarks: this.clean(body.hrRemarks),
        correctionReason:
          target === 'RETURNED_FOR_CORRECTION'
            ? this.clean(body.correctionReason)
            : undefined,
        rejectionReason:
          target === 'REJECTED' ? this.clean(body.rejectionReason) : undefined,
        timeline: {
          create: this.timeline(
            actor,
            action,
            current.status,
            target,
            body.hrRemarks,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async addCandidate(id: string, body: any, actor: Actor) {
    if (!this.clean(body.name))
      throw new BadRequestException('Candidate name is required.');
    const request = await this.find(id, actor.companyId);
    if (CLOSED.has(request.status))
      throw new BadRequestException(
        'Candidates cannot be added to a closed request.',
      );
    return this.prisma.$transaction(async (db) => {
      const count = await db.recruitmentCandidate.count();
      const candidate = await db.recruitmentCandidate.create({
        data: {
          recruitmentRequestId: request.id,
          candidateNumber: `RC-${Date.now()}-${count + 1}`,
          name: this.clean(body.name)!,
          phone: this.clean(body.phone),
          email: this.clean(body.email),
          experience: this.clean(body.experience),
          currentCompany: this.clean(body.currentCompany),
          expectedSalary: body.expectedSalary
            ? Number(body.expectedSalary)
            : null,
          resumeUrl: this.clean(body.resumeUrl),
          source: this.clean(body.source),
          remarks: this.clean(body.remarks),
        },
      });
      await db.recruitmentRequest.update({
        where: { id: request.id },
        data: {
          status:
            request.status === 'HR_PROCESSING'
              ? 'CANDIDATES_SOURCED'
              : undefined,
          version: { increment: 1 },
          timeline: {
            create: this.timeline(
              actor,
              `Candidate ${candidate.name} sourced`,
              request.status,
              request.status === 'HR_PROCESSING'
                ? 'CANDIDATES_SOURCED'
                : request.status,
            ),
          },
        },
      });
      return candidate;
    });
  }

  async updateCandidate(id: string, body: any, actor: Actor) {
    const current = await this.prisma.recruitmentCandidate.findFirst({
      where: { id, recruitmentRequest: { companyId: actor.companyId } },
    });
    if (!current) throw new NotFoundException('Candidate not found.');
    const allowed = [
      'name',
      'phone',
      'email',
      'experience',
      'currentCompany',
      'expectedSalary',
      'resumeUrl',
      'source',
      'remarks',
      'joiningDate',
      'status',
    ];
    const data: any = {};
    for (const key of allowed)
      if (body[key] !== undefined)
        data[key] = key === 'joiningDate' ? new Date(body[key]) : body[key];
    return this.prisma.recruitmentCandidate.update({ where: { id }, data });
  }

  async candidateDecision(
    id: string,
    status: RecruitmentCandidateStatus,
    body: any,
    actor: Actor,
  ) {
    const current = await this.prisma.recruitmentCandidate.findFirst({
      where: { id, recruitmentRequest: { companyId: actor.companyId } },
      include: { recruitmentRequest: true },
    });
    if (!current) throw new NotFoundException('Candidate not found.');
    return this.prisma.$transaction(async (db) => {
      const candidate = await db.recruitmentCandidate.update({
        where: { id },
        data: {
          status,
          selectedAt: status === 'SELECTED' ? new Date() : undefined,
          joiningDate: body.joiningDate
            ? new Date(body.joiningDate)
            : undefined,
          remarks: this.clean(body.remarks),
        },
      });
      await db.recruitmentRequest.update({
        where: { id: current.recruitmentRequestId },
        data: {
          status: status === 'SELECTED' ? 'CANDIDATES_SELECTED' : undefined,
          version: { increment: 1 },
          timeline: {
            create: this.timeline(
              actor,
              `Candidate ${current.name} ${status.toLowerCase()}`,
              current.recruitmentRequest.status,
              status === 'SELECTED'
                ? 'CANDIDATES_SELECTED'
                : current.recruitmentRequest.status,
            ),
          },
        },
      });
      return candidate;
    });
  }

  async addInterview(id: string, body: any, actor: Actor) {
    const request = await this.find(id, actor.companyId);
    if (CLOSED.has(request.status))
      throw new BadRequestException(
        'Interviews cannot be scheduled for a closed request.',
      );
    if (
      !body.candidateId ||
      !body.interviewDate ||
      !this.clean(body.interviewMode)
    )
      throw new BadRequestException(
        'Candidate, interview date and mode are required.',
      );
    const candidate = request.candidates.find(
      (item: any) => item.id === body.candidateId,
    );
    if (!candidate)
      throw new BadRequestException(
        'Candidate does not belong to this request.',
      );
    return this.prisma.$transaction(async (db) => {
      const interview = await db.recruitmentInterview.create({
        data: {
          recruitmentRequestId: request.id,
          candidateId: candidate.id,
          interviewDate: new Date(body.interviewDate),
          interviewMode: this.clean(body.interviewMode)!,
          interviewLocation: this.clean(body.interviewLocation),
          meetingLink: this.clean(body.meetingLink),
          interviewRound: this.clean(body.interviewRound),
          panelMembers: body.panelMembers || undefined,
          instructions: this.clean(body.instructions),
        },
      });
      await db.recruitmentCandidate.update({
        where: { id: candidate.id },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });
      await db.recruitmentRequest.update({
        where: { id: request.id },
        data: {
          status: 'INTERVIEWS_SCHEDULED',
          version: { increment: 1 },
          timeline: {
            create: this.timeline(
              actor,
              `Interview scheduled for ${candidate.name}`,
              request.status,
              'INTERVIEWS_SCHEDULED',
            ),
          },
        },
      });
      return interview;
    });
  }

  async updateInterview(id: string, body: any, actor: Actor) {
    const row = await this.prisma.recruitmentInterview.findFirst({
      where: { id, recruitmentRequest: { companyId: actor.companyId } },
    });
    if (!row) throw new NotFoundException('Interview not found.');
    return this.prisma.recruitmentInterview.update({
      where: { id },
      data: {
        ...body,
        interviewDate: body.interviewDate
          ? new Date(body.interviewDate)
          : undefined,
      },
    });
  }

  async interviewAction(id: string, action: string, body: any, actor: Actor) {
    const row = await this.prisma.recruitmentInterview.findFirst({
      where: { id, recruitmentRequest: { companyId: actor.companyId } },
    });
    if (!row) throw new NotFoundException('Interview not found.');
    const statuses: Record<string, InterviewStatus> = {
      complete: 'COMPLETED',
      reschedule: 'RESCHEDULED',
      cancel: 'CANCELLED',
    };
    if (!statuses[action])
      throw new BadRequestException('Unsupported interview action.');
    return this.prisma.recruitmentInterview.update({
      where: { id },
      data: {
        status: statuses[action],
        interviewDate: body.interviewDate
          ? new Date(body.interviewDate)
          : undefined,
        feedback: this.clean(body.feedback),
        rating: body.rating ? Number(body.rating) : undefined,
        result: body.result
          ? (String(body.result).toUpperCase() as InterviewResult)
          : undefined,
      },
    });
  }

  async pending(id: string, body: any, actor: Actor) {
    const current = await this.find(id, actor.companyId);
    this.ensureVersion(current, body);
    if (CLOSED.has(current.status))
      throw new BadRequestException(
        'A closed request cannot be marked as pending.',
      );
    if (current.status !== 'OPEN')
      throw new BadRequestException(
        `Cannot mark request in status ${current.status} as pending.`,
      );

    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id },
      data: {
        status: 'PENDING',
        version: { increment: 1 },
        timeline: {
          create: this.timeline(
            actor,
            'Recruitment request marked as pending',
            current.status,
            'PENDING',
            body.remarks,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async reject(id: string, body: any, actor: Actor) {
    const current = await this.find(id, actor.companyId);
    this.ensureVersion(current, body);
    if (CLOSED.has(current.status))
      throw new BadRequestException('A closed request cannot be rejected.');
    if (!['OPEN', 'PENDING'].includes(current.status))
      throw new BadRequestException(
        `Cannot reject request in status ${current.status}.`,
      );
    if (!this.clean(body.rejectionReason))
      throw new BadRequestException('Rejection Reason is required.');

    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id },
      data: {
        status: 'REJECTED',
        rejectionReason: this.clean(body.rejectionReason),
        rejectedAt: new Date(),
        rejectedBy: this.actorName(actor),
        version: { increment: 1 },
        timeline: {
          create: this.timeline(
            actor,
            'Recruitment request rejected by HR',
            current.status,
            'REJECTED',
            body.rejectionReason,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async fulfil(id: string, body: any, actor: Actor, overrideSod?: boolean) {
    const current = await this.find(id, actor.companyId);
    this.ensureVersion(current, body);

    if (current.requestedById === actor.sub) {
      if (overrideSod) {
        if (!body.hrRemarks?.trim()) {
          throw new BadRequestException(
            'Remarks are mandatory when overriding Segregation of Duties',
          );
        }
      } else {
        throw new ConflictException(
          'Segregation of Duties: You cannot fulfill your own recruitment request. Override permission required.',
        );
      }
    }
    if (CLOSED.has(current.status))
      throw new BadRequestException('A closed request cannot be fulfilled.');
    if (!['OPEN', 'PENDING'].includes(current.status))
      throw new BadRequestException(
        `Cannot fulfill request in status ${current.status}.`,
      );

    const positionsFilledInput = Number(body.positionsFilled);
    if (!Number.isInteger(positionsFilledInput) || positionsFilledInput <= 0) {
      throw new BadRequestException('Positions Filled must be greater than 0.');
    }
    if (positionsFilledInput > current.vacancies) {
      throw new BadRequestException(
        'Positions Filled cannot exceed requested vacancies.',
      );
    }

    const row = await this.prisma.recruitmentRequest.update({
      where: { id: current.id, version: current.version },
      data: {
        status: 'FULFILLED',
        positionsFilled: current.vacancies,
        fulfilledAt: new Date(),
        fulfilledBy: this.actorName(actor),
        hrRemarks: this.clean(body.remarks),
        version: { increment: 1 },
        timeline: {
          create: this.timeline(
            actor,
            'Recruitment request fulfilled by HR',
            current.status,
            'FULFILLED',
            body.remarks,
          ),
        },
      },
      include: this.include(),
    });
    return this.map(row);
  }

  async getChildren(
    id: string,
    actor: Actor,
    key: 'candidates' | 'interviews' | 'timeline',
  ) {
    const row = await this.find(id, actor.companyId);
    if (actor.role === 'PLANT_HEAD') this.ensureOwn(row, actor);
    return row[key];
  }
}
