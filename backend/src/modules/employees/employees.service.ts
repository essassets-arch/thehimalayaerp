import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, EmployeeDocumentType, EmployeeStatus } from '@prisma/client';
import { createCipheriv, createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { EmployeeFilesService } from './employee-files.service';
import { CreateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { mapEmployee } from './employee.mapper';

const ACTIVE_MANAGER_STATUSES: EmployeeStatus[] = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.ON_PROBATION,
  EmployeeStatus.CONFIRMED,
  EmployeeStatus.ON_LEAVE,
];
const MANDATORY_FIELDS = ['aadhaarCard', 'panCard', 'bankDocument'];
const DOCUMENT_TYPE: Record<string, EmployeeDocumentType> = {
  aadhaarCard: EmployeeDocumentType.AADHAAR_CARD,
  panCard: EmployeeDocumentType.PAN_CARD,
  bankDocument: EmployeeDocumentType.BANK_PASSBOOK,
  photograph: EmployeeDocumentType.PHOTOGRAPH,
  signature: EmployeeDocumentType.SIGNATURE,
};

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: EmployeeFilesService,
    private readonly config: ConfigService,
  ) {}

  private companyId(user: any) {
    if (!user?.companyId)
      throw new BadRequestException('Authenticated user has no company.');
    return user.companyId;
  }

  private key() {
    const source =
      this.config.get<string>('EMPLOYEE_DATA_ENCRYPTION_KEY') ||
      this.config.get<string>('jwt.accessSecret') ||
      'development-only-employee-key';
    return createHash('sha256').update(source).digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${ciphertext.toString('base64')}`;
  }

  private hash(value: string) {
    return createHash('sha256').update(this.key()).update(value).digest('hex');
  }

  private error(
    status: number,
    code: string,
    message: string,
    field?: string,
  ): never {
    const body = { code, message, field };
    if (status === 409) throw new ConflictException(body);
    throw new BadRequestException(body);
  }

  async list(query: EmployeeQueryDto, user: any) {
    const pageSize = Math.min(query.pageSize || 20, 100);
    const page = query.page || 1;
    const where: Prisma.EmployeeWhereInput = {
      companyId: this.companyId(user),
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.locationId && { workLocationId: query.locationId }),
      ...(query.employmentType && { employmentType: query.employmentType }),
      ...(query.status && { status: query.status }),
      ...(query.reportingManagerId && {
        reportingManagerId: query.reportingManagerId,
      }),
      ...((query.joiningDateFrom || query.joiningDateTo) && {
        joiningDate: {
          ...(query.joiningDateFrom && {
            gte: new Date(query.joiningDateFrom),
          }),
          ...(query.joiningDateTo && { lte: new Date(query.joiningDateTo) }),
        },
      }),
      ...(query.search && {
        OR: ['employeeCode', 'fullName', 'workEmail', 'phoneNumber'].map(
          (field) => ({
            [field]: { contains: query.search, mode: 'insensitive' },
          }),
        ),
      }),
    };
    const allowedSort = new Set([
      'employeeCode',
      'fullName',
      'joiningDate',
      'createdAt',
    ]);
    const sortBy = allowedSort.has(query.sortBy) ? query.sortBy : 'createdAt';
    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: query.sortOrder || 'desc' },
        include: {
          department: true,
          workLocation: true,
          reportingManager: {
            select: { id: true, employeeCode: true, fullName: true },
          },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return {
      items: items.map(mapEmployee),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async payrollOverview(query: any, user: any) {
    const month = Number(query.month || new Date().getMonth() + 1);
    const year = Number(query.year || new Date().getFullYear());
    return this.prisma.employee
      .findMany({
        where: {
          companyId: this.companyId(user),
          status: {
            notIn: ['DRAFT', 'INACTIVE', 'TERMINATED', 'RESIGNED', 'RETIRED'],
          },
        },
        include: {
          department: true,
          workLocation: true,
          salaryStructures: {
            where: { isActive: true },
            orderBy: { effectiveFrom: 'desc' },
            take: 1,
          },
          payrollRecords: {
            where: { payrollPeriod: { month, year } },
            include: {
              payrollPeriod: true,
              attendanceSummary: true,
              salarySlip: true,
            },
            take: 1,
          },
        },
        orderBy: { fullName: 'asc' },
      })
      .then((rows) =>
        rows.map((row: any) => {
          const {
            aadhaarNumberEncrypted,
            aadhaarHash,
            bankAccountEncrypted,
            bankAccountHash,
            ...safe
          } = row;
          return {
            ...safe,
            bankAccountMasked: `XXXXXXXX${row.bankAccountLastFour}`,
            payroll: row.payrollRecords[0] || null,
          };
        }),
      );
  }

  async attendanceSummary(employeeId: string, query: any, user: any) {
    return this.prisma.employeeMonthlyAttendanceSummary.findMany({
      where: {
        employeeId,
        employee: { companyId: this.companyId(user) },
        ...(query.month &&
          query.year && {
            payrollPeriod: {
              month: Number(query.month),
              year: Number(query.year),
            },
          }),
      },
      include: { payrollPeriod: true },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  salaryHistory(employeeId: string, user: any) {
    return this.prisma.payrollRecord.findMany({
      where: { employeeId, employee: { companyId: this.companyId(user) } },
      include: { payrollPeriod: true, salarySlip: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string, user: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId: this.companyId(user) },
      include: {
        department: true,
        workLocation: true,
        documents: true,
        reportingManager: {
          select: { id: true, employeeCode: true, fullName: true },
        },
        directReports: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            status: true,
          },
        },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    return mapEmployee(employee);
  }

  async create(
    dto: CreateEmployeeDto,
    uploaded: Record<string, any[]>,
    user: any,
    requestId?: string,
  ) {
    for (const field of MANDATORY_FIELDS) {
      if (!uploaded[field]?.[0])
        this.error(
          400,
          'MANDATORY_DOCUMENT_MISSING',
          `${field} is required.`,
          field,
        );
    }
    if (dto.bankAccountNumber !== dto.confirmAccountNumber) {
      this.error(
        400,
        'BANK_ACCOUNT_MISMATCH',
        'Bank account numbers do not match.',
        'confirmAccountNumber',
      );
    }
    const companyId = this.companyId(user);
    const employeeId = randomUUID();
    const workEmail = dto.workEmail.trim().toLowerCase();
    const panNumber = dto.panNumber.trim().toUpperCase();
    const aadhaar = dto.aadhaarNumber.replace(/\D/g, '');
    const bankAccount = dto.bankAccountNumber.replace(/\D/g, '');
    const joiningDate = new Date(dto.joiningDate);
    const dateOfBirth = new Date(dto.dateOfBirth);
    if (Date.now() - dateOfBirth.getTime() < 18 * 365.2425 * 86400000) {
      this.error(
        400,
        'MINIMUM_EMPLOYMENT_AGE',
        'Employee must be at least 18 years old.',
        'dateOfBirth',
      );
    }
    if (dto.probationEndDate && new Date(dto.probationEndDate) < joiningDate) {
      this.error(
        400,
        'INVALID_PROBATION_END_DATE',
        'Probation end date cannot be before joining date.',
        'probationEndDate',
      );
    }
    const [department, location, manager, duplicate] = await Promise.all([
      this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId, isActive: true },
      }),
      this.prisma.workLocation.findFirst({
        where: { id: dto.workLocationId, companyId, isActive: true },
      }),
      dto.reportingManagerId
        ? this.prisma.employee.findFirst({
            where: {
              id: dto.reportingManagerId,
              companyId,
              status: { in: ACTIVE_MANAGER_STATUSES },
            },
          })
        : Promise.resolve(null),
      this.prisma.employee.findFirst({
        where: {
          OR: [
            { employeeCode: dto.employeeCode.trim() },
            { workEmail },
            { panNumber },
            { aadhaarHash: this.hash(aadhaar) },
          ],
        },
        select: {
          employeeCode: true,
          workEmail: true,
          panNumber: true,
          aadhaarHash: true,
        },
      }),
    ]);
    if (!department)
      this.error(
        400,
        'DEPARTMENT_NOT_FOUND',
        'Department is not active or does not exist.',
        'departmentId',
      );
    if (!location)
      this.error(
        400,
        'WORK_LOCATION_NOT_FOUND',
        'Work location is not active or does not exist.',
        'workLocationId',
      );
    if (dto.reportingManagerId && !manager)
      this.error(
        400,
        'REPORTING_MANAGER_NOT_FOUND',
        'Reporting manager is not active or does not exist.',
        'reportingManagerId',
      );
    if (duplicate?.employeeCode === dto.employeeCode.trim())
      this.error(
        409,
        'EMPLOYEE_CODE_ALREADY_EXISTS',
        `Employee ID code ${dto.employeeCode} is already registered.`,
        'employeeCode',
      );
    if (duplicate?.workEmail === workEmail)
      this.error(
        409,
        'WORK_EMAIL_ALREADY_EXISTS',
        'Work email is already registered.',
        'workEmail',
      );
    if (duplicate?.panNumber === panNumber)
      this.error(
        409,
        'PAN_ALREADY_EXISTS',
        'PAN is already registered.',
        'panNumber',
      );
    if (duplicate?.aadhaarHash === this.hash(aadhaar))
      this.error(
        409,
        'AADHAAR_ALREADY_EXISTS',
        'Aadhaar is already registered.',
        'aadhaarNumber',
      );

    const stored: any[] = [];
    try {
      for (const [field, entries] of Object.entries(uploaded)) {
        for (const file of entries || []) {
          const folder =
            field === 'additionalDocuments'
              ? 'additional'
              : field === 'bankDocument'
                ? 'bank'
                : field === 'aadhaarCard'
                  ? 'aadhaar'
                  : field === 'panCard'
                    ? 'pan'
                    : field;
          const result = await this.files.store(employeeId, file, folder);
          stored.push({ field, file, ...result });
        }
      }
      const additional = (dto as any).additionalDocuments || [];
      const employee = await this.prisma.$transaction(async (tx) => {
        const created = await tx.employee.create({
          data: {
            id: employeeId,
            publicId: dto.employeeCode.trim(),
            companyId,
            employeeCode: dto.employeeCode.trim(),
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
            dateOfBirth,
            gender: dto.gender,
            jobTitle: dto.jobTitle.trim(),
            departmentId: dto.departmentId,
            reportingManagerId: dto.reportingManagerId || null,
            workLocationId: dto.workLocationId,
            employmentType: dto.employmentType,
            joiningDate,
            probationEndDate: dto.probationEndDate
              ? new Date(dto.probationEndDate)
              : null,
            status: dto.probationEndDate
              ? EmployeeStatus.ON_PROBATION
              : EmployeeStatus.ACTIVE,
            workEmail,
            personalEmail: dto.personalEmail?.trim().toLowerCase() || null,
            phoneNumber: dto.phoneNumber,
            residentialAddress: dto.residentialAddress.trim(),
            emergencyContactName: dto.emergencyContactName.trim(),
            emergencyContactPhone: dto.emergencyContactPhone,
            emergencyRelationship: dto.emergencyRelationship,
            panNumber,
            aadhaarNumberEncrypted: this.encrypt(aadhaar),
            aadhaarLastFour: aadhaar.slice(-4),
            aadhaarHash: this.hash(aadhaar),
            uanNumber: dto.uanNumber || null,
            esicNumber: dto.esicNumber || null,
            bankName: dto.bankName.trim(),
            accountHolderName: dto.accountHolderName.trim(),
            bankAccountType: dto.bankAccountType,
            bankAccountEncrypted: this.encrypt(bankAccount),
            bankAccountLastFour: bankAccount.slice(-4),
            bankAccountHash: this.hash(bankAccount),
            ifscCode: dto.ifscCode.toUpperCase(),
            branchName: dto.branchName || null,
            createdById: user.sub,
          },
        });
        await tx.employeeDocument.createMany({
          data: stored.map((item, index) => ({
            employeeId,
            documentType:
              DOCUMENT_TYPE[item.field] ||
              additional[index]?.documentType ||
              EmployeeDocumentType.OTHER,
            documentName: additional[index]?.documentName || item.field,
            originalFileName: item.file.originalname,
            storedFileName: item.storedFileName,
            storageKey: item.storageKey,
            mimeType: item.file.mimetype,
            fileSize: item.file.size,
            description: additional[index]?.description,
            uploadedById: user.sub,
          })),
        });
        if (dto.draftId) {
          await tx.employeeDraft.updateMany({
            where: { id: dto.draftId, companyId },
            data: { completedEmployeeId: employeeId },
          });
        }
        await tx.auditLog.create({
          data: {
            actorUserId: user.sub,
            companyId,
            action: 'EMPLOYEE_REGISTERED',
            entityType: 'Employee',
            entityId: employeeId,
            requestId,
            after: {
              employeeCode: created.employeeCode,
              status: created.status,
            },
          },
        });
        return created;
      });
      return mapEmployee(employee);
    } catch (error) {
      await this.files.removeEmployeeFiles(employeeId);
      throw error;
    }
  }

  async saveDraft(payload: any, user: any) {
    const companyId = this.companyId(user);
    const draft = payload.id
      ? await this.prisma.employeeDraft.update({
          where: { id: payload.id },
          data: {
            employeeData: payload.employeeData || payload,
            version: { increment: 1 },
          },
        })
      : await this.prisma.employeeDraft.create({
          data: {
            companyId,
            createdById: user.sub,
            employeeData: payload.employeeData || payload,
          },
        });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId,
        action: 'EMPLOYEE_DRAFT_CREATED',
        entityType: 'EmployeeDraft',
        entityId: draft.id,
      },
    });
    return draft;
  }

  listDrafts(user: any) {
    return this.prisma.employeeDraft.findMany({
      where: {
        companyId: this.companyId(user),
        createdById: user.sub,
        completedEmployeeId: null,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, payload: any, user: any, requestId?: string) {
    const current = await this.get(id, user);
    if (payload.version !== current.version)
      this.error(
        409,
        'VERSION_CONFLICT',
        'Employee was updated by another user.',
        'version',
      );
    if (payload.reportingManagerId === id)
      this.error(
        400,
        'INVALID_REPORTING_MANAGER',
        'Employee cannot report to themselves.',
        'reportingManagerId',
      );
    const allowed = [
      'jobTitle',
      'departmentId',
      'reportingManagerId',
      'workLocationId',
      'employmentType',
      'probationEndDate',
      'personalEmail',
      'phoneNumber',
      'residentialAddress',
      'emergencyContactName',
      'emergencyContactPhone',
      'emergencyRelationship',
      'branchName',
    ];
    const data = Object.fromEntries(
      allowed
        .filter((key) => payload[key] !== undefined)
        .map((key) => [key, payload[key]]),
    );
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { ...data, version: { increment: 1 }, updatedById: user.sub },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_UPDATED',
        entityType: 'Employee',
        entityId: id,
        requestId,
        before: { version: current.version },
        after: { version: updated.version, changedFields: Object.keys(data) },
      },
    });
    return mapEmployee(updated);
  }

  async status(id: string, payload: any, user: any, requestId?: string) {
    if (!Object.values(EmployeeStatus).includes(payload.status))
      this.error(400, 'INVALID_STATUS', 'Invalid employee status.', 'status');
    const current = await this.get(id, user);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        status: payload.status,
        version: { increment: 1 },
        updatedById: user.sub,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_STATUS_CHANGED',
        entityType: 'Employee',
        entityId: id,
        requestId,
        before: { status: current.status },
        after: { status: updated.status, reason: payload.reason },
      },
    });
    return mapEmployee(updated);
  }

  departments(user: any) {
    return this.prisma.department.findMany({
      where: { companyId: this.companyId(user), isActive: true },
      orderBy: { name: 'asc' },
    });
  }
  locations(user: any) {
    return this.prisma.workLocation.findMany({
      where: { companyId: this.companyId(user), isActive: true },
      orderBy: { name: 'asc' },
    });
  }
  managers(user: any, excludeId?: string) {
    return this.prisma.employee.findMany({
      where: {
        companyId: this.companyId(user),
        status: { in: ACTIVE_MANAGER_STATUSES },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true, employeeCode: true, fullName: true, jobTitle: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async addDocument(id: string, file: any, body: any, user: any) {
    await this.get(id, user);
    const stored = await this.files.store(id, file, 'additional');
    const document = await this.prisma.employeeDocument.create({
      data: {
        employeeId: id,
        documentType: body.documentType || EmployeeDocumentType.OTHER,
        documentName: body.documentName || file.originalname,
        originalFileName: file.originalname,
        ...stored,
        mimeType: file.mimetype,
        fileSize: file.size,
        description: body.description,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        uploadedById: user.sub,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_DOCUMENT_UPLOADED',
        entityType: 'EmployeeDocument',
        entityId: document.id,
        after: { employeeId: id, documentType: document.documentType },
      },
    });
    return document;
  }

  async deleteDocument(employeeId: string, documentId: string, user: any) {
    await this.get(employeeId, user);
    const document = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, employeeId },
    });
    if (!document) throw new NotFoundException('Document not found.');
    const mandatoryTypes: EmployeeDocumentType[] = [
      EmployeeDocumentType.AADHAAR_CARD,
      EmployeeDocumentType.PAN_CARD,
      EmployeeDocumentType.BANK_PASSBOOK,
      EmployeeDocumentType.CANCELLED_CHEQUE,
    ];
    if (
      document.status === 'VERIFIED' &&
      mandatoryTypes.includes(document.documentType)
    ) {
      this.error(
        400,
        'VERIFIED_DOCUMENT_REPLACEMENT_REQUIRED',
        'A verified mandatory document requires an authorised replacement.',
      );
    }
    await this.prisma.employeeDocument.delete({ where: { id: documentId } });
    await this.files.remove(document.storageKey);
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_DOCUMENT_DELETED',
        entityType: 'EmployeeDocument',
        entityId: documentId,
        before: { employeeId, documentType: document.documentType },
      },
    });
    return { deleted: true };
  }
}
