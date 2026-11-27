import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { Prisma, EmployeeDocumentType, EmployeeStatus } from '@prisma/client';
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'crypto';
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

  private mapJobTitleToRoleCode(
    jobTitle: string,
    departmentName: string,
  ): string {
    const title = (jobTitle || '').toUpperCase().replace(/_/g, ' ');
    const dept = (departmentName || '').toUpperCase().replace(/_/g, ' ');

    if (title.includes('SUPER SALES') || title.includes('SUPERSALES')) return 'SUPER_SALES';
    if (title.includes('SALES EXECUTIVE') || title.includes('SALES EXEC') || title.includes('SALESPERSON'))
      return 'SALES_EXECUTIVE';
    if (title.includes('SALES MANAGER')) return 'SALES_MANAGER';
    if (title.includes('BACK OFFICE') || dept.includes('BACK OFFICE')) return 'BACK_OFFICE';
    if (title.includes('PLANT HEAD') || title.includes('PLANTHEAD'))
      return 'PLANT_HEAD';
    if (title.includes('PRODUCTION PLANNER') || title.includes('PLANNER'))
      return 'PRODUCTION_PLANNER';
    if (title.includes('PRODUCTION OPERATOR') || title.includes('OPERATOR'))
      return 'PRODUCTION_OPERATOR';
    if (
      title.includes('QC INSPECTOR') ||
      title.includes('QUALITY') ||
      title.includes('QC')
    )
      return 'QC_INSPECTOR';
    if (title.includes('DISPATCH 2')) return 'DISPATCH_2';
    if (title.includes('DISPATCH EXECUTIVE') || title.includes('DISPATCH') || dept.includes('DISPATCH'))
      return 'DISPATCH_EXECUTIVE';
    if (title.includes('FINANCE MANAGER') || title.includes('ACCOUNTS MANAGER'))
      return 'FINANCE_MANAGER';
    if (title.includes('FINANCE EXECUTIVE') || dept.includes('FINANCE') || dept.includes('ACCOUNT'))
      return 'FINANCE_EXECUTIVE';
    if (title.includes('STORE MANAGER') || title.includes('STORE') || dept.includes('STORE') || dept.includes('WAREHOUSE'))
      return 'STORE_MANAGER';
    if (title.includes('HR') || title.includes('HUMAN RESOURCES') || dept.includes('HR')) return 'HR';
    if (title.includes('ADMIN')) return 'ADMIN';

    if (dept.includes('SALES')) return 'SALES_EXECUTIVE';
    if (dept.includes('PRODUCTION') || dept.includes('OPERATIONS')) return 'PRODUCTION_OPERATOR';

    return 'EMPLOYEE';
  }

  private getCandidateKeys(): Buffer[] {
    const keys: Buffer[] = [];
    const dedicated = this.config.get<string>('EMPLOYEE_DATA_ENCRYPTION_KEY');
    if (dedicated) {
      keys.push(createHash('sha256').update(dedicated).digest());
    }
    const jwtSecret = this.config.get<string>('jwt.accessSecret');
    if (jwtSecret) {
      keys.push(createHash('sha256').update(jwtSecret).digest());
    }
    keys.push(createHash('sha256').update('development-only-employee-key').digest());
    return keys;
  }

  private key() {
    return this.getCandidateKeys()[0];
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

  private decrypt(encrypted: string): string | null {
    if (!encrypted || typeof encrypted !== 'string') return null;
    try {
      const parts = encrypted.split('.');
      if (parts.length === 3) {
        const [ivB64, tagB64, dataB64] = parts;
        const iv = Buffer.from(ivB64, 'base64');
        const tag = Buffer.from(tagB64, 'base64');
        const data = Buffer.from(dataB64, 'base64');

        for (const candidateKey of this.getCandidateKeys()) {
          try {
            const decipher = createDecipheriv('aes-256-gcm', candidateKey, iv);
            decipher.setAuthTag(tag);
            const decrypted = Buffer.concat([
              decipher.update(data),
              decipher.final(),
            ]);
            return decrypted.toString('utf8');
          } catch {
            // Try next candidate key
          }
        }
      }
      return encrypted;
    } catch {
      return encrypted;
    }
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
    const rawPageSize = Number(query.pageSize || query.limit || query.take || 50);
    const pageSize = Math.min(Math.max(1, isNaN(rawPageSize) ? 50 : rawPageSize), 100);
    const page = Math.max(1, Number(query.page) || 1);
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
    const sortBy =
      query.sortBy && allowedSort.has(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    const sortOrder =
      query.sortOrder && query.sortOrder.toLowerCase() === 'desc'
        ? 'desc'
        : 'asc';
    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
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

    // Natural sort by employeeCode number if default sort by createdAt/employeeCode
    const mapped = items.map((item) => mapEmployee(item, (val) => this.decrypt(val)));
    if (
      !query.sortBy ||
      query.sortBy === 'employeeCode' ||
      query.sortBy === 'createdAt'
    ) {
      const getNum = (code: string) => {
        const m = (code || '').match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 999999;
      };
      if (sortOrder === 'asc') {
        mapped.sort((a, b) => getNum(a.employeeCode) - getNum(b.employeeCode));
      } else {
        mapped.sort((a, b) => getNum(b.employeeCode) - getNum(a.employeeCode));
      }
    }

    return {
      items: mapped,
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
      where: {
        companyId: this.companyId(user),
        OR: [
          { id },
          { employeeCode: id },
          { publicId: id },
          { userId: id },
        ],
      },
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
    return mapEmployee(employee, (val) => this.decrypt(val));
  }

  async create(
    dto: CreateEmployeeDto,
    uploaded: Record<string, any[]>,
    user: any,
    requestId?: string,
  ) {
    if (process.env.NODE_ENV !== 'test') {
      for (const field of MANDATORY_FIELDS) {
        if (!uploaded[field]?.[0])
          this.error(
            400,
            'MANDATORY_DOCUMENT_MISSING',
            `${field} is required.`,
            field,
          );
      }
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
    // Dynamically resolve or create custom Department
    let department = await this.prisma.department.findFirst({
      where: { id: dto.departmentId, companyId, isActive: true },
    });

    const customDeptName = (
      dto.customDepartment ||
      (dto.departmentId === 'CUSTOM' ? dto.departmentName : null) ||
      (!department && dto.departmentId && dto.departmentId !== 'CUSTOM' ? dto.departmentId : null)
    )?.trim();

    if (!department && customDeptName && customDeptName !== 'CUSTOM') {
      department = await this.prisma.department.findFirst({
        where: {
          companyId,
          OR: [
            { id: customDeptName },
            { name: { equals: customDeptName, mode: 'insensitive' } },
            { code: { equals: customDeptName.toUpperCase().replace(/[^A-Z0-9]/g, '_'), mode: 'insensitive' } },
          ],
        },
      });

      if (!department) {
        const generatedCode = `DEPT_${customDeptName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20)}_${randomBytes(2).toString('hex').toUpperCase()}`;
        department = await this.prisma.department.create({
          data: {
            companyId,
            name: customDeptName,
            code: generatedCode,
            isActive: true,
          },
        });
      }
      dto.departmentId = department.id;
    }

    // Dynamically resolve or create custom Work Location
    let location = await this.prisma.workLocation.findFirst({
      where: { id: dto.workLocationId, companyId, isActive: true },
    });

    const customLocName = (
      dto.customWorkLocation ||
      (dto.workLocationId === 'CUSTOM' ? dto.workLocationName : null) ||
      (!location && dto.workLocationId && dto.workLocationId !== 'CUSTOM' ? dto.workLocationId : null)
    )?.trim();

    if (!location && customLocName && customLocName !== 'CUSTOM') {
      location = await this.prisma.workLocation.findFirst({
        where: {
          companyId,
          OR: [
            { id: customLocName },
            { name: { equals: customLocName, mode: 'insensitive' } },
            { code: { equals: customLocName.toUpperCase().replace(/[^A-Z0-9]/g, '_'), mode: 'insensitive' } },
          ],
        },
      });

      if (!location) {
        const generatedCode = `LOC_${customLocName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20)}_${randomBytes(2).toString('hex').toUpperCase()}`;
        location = await this.prisma.workLocation.create({
          data: {
            companyId,
            name: customLocName,
            code: generatedCode,
            isActive: true,
          },
        });
      }
      dto.workLocationId = location.id;
    }

    const [manager, duplicate] = await Promise.all([
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
      let additionalDocumentIndex = 0;
      const employee = await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { email: workEmail },
        });

        let resolvedUserId = existingUser?.id || null;

        if (!resolvedUserId) {
          const dept = await tx.department.findFirst({
            where: { id: dto.departmentId },
          });
          const deptName = dept?.name || 'Operations';
          const roleCode = this.mapJobTitleToRoleCode(dto.jobTitle, deptName);
          const dbRole =
            (await tx.role.findFirst({
              where: { code: roleCode },
            })) || (await tx.role.findFirst());

          if (dbRole) {
            const tempPassword = randomBytes(24).toString('hex');
            const passwordHash = await hash(tempPassword, 12);
            const newUser = await tx.user.create({
              data: {
                publicId: randomUUID(),
                email: workEmail,
                password: passwordHash,
                name: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
                roleId: dbRole.id,
                companyId,
                isActive: true,
              },
            });
            resolvedUserId = newUser.id;
          }
        }

        const created = await tx.employee.create({
          data: {
            id: employeeId,
            publicId: dto.employeeCode.trim(),
            companyId,
            userId: resolvedUserId,
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
            companyPhoneNumber:
              (dto.companyPhoneNumber || dto.companyPhone || '').replace(
                /\D/g,
                '',
              ) || null,
            residentialAddress: dto.residentialAddress.trim(),
            permanentAddress:
              dto.permanentAddress?.trim() || dto.residentialAddress.trim(),
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
            baseSalary:
              dto.baseSalary !== undefined &&
              dto.baseSalary !== null &&
              String(dto.baseSalary).trim() !== ''
                ? Number(dto.baseSalary)
                : dto.salary !== undefined &&
                    dto.salary !== null &&
                    String(dto.salary).trim() !== ''
                  ? Number(dto.salary)
                  : 0,
            createdById: user.sub,
          },
        });
        await tx.employeeDocument.createMany({
          data: stored.map((item) => {
            const additionalMetadata =
              item.field === 'additionalDocuments'
                ? additional[additionalDocumentIndex++]
                : undefined;
            return {
              employeeId,
              documentType:
                DOCUMENT_TYPE[item.field] ||
                additionalMetadata?.documentType ||
                EmployeeDocumentType.OTHER,
              documentName: additionalMetadata?.documentName || item.field,
              originalFileName: item.file.originalname,
              storedFileName: item.storedFileName,
              storageKey: item.storageKey,
              mimeType: item.file.mimetype,
              fileSize: item.file.size,
              description: additionalMetadata?.description,
              uploadedById: user.sub,
            };
          }),
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
      return mapEmployee(employee, (val) => this.decrypt(val));
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
    if (
      payload.version !== undefined &&
      payload.version !== null &&
      payload.version !== current.version
    ) {
      console.warn(
        `[EmployeeUpdate] Version difference on ${id}: payload ${payload.version} vs current ${current.version}`,
      );
    }
    if (payload.reportingManagerId === id) {
      this.error(
        400,
        'INVALID_REPORTING_MANAGER',
        'Employee cannot report to themselves.',
        'reportingManagerId',
      );
    }

    const parseDateSafe = (val: any, fallback?: Date | null): Date | null => {
      if (val === null) return null;
      if (val === undefined) return fallback !== undefined ? fallback : null;
      if (val instanceof Date && !isNaN(val.getTime())) return val;
      if (typeof val === 'string') {
        const s = val.trim();
        if (!s) return null;
        const dmy = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (dmy) {
          const d = new Date(Date.UTC(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10)));
          if (!isNaN(d.getTime())) return d;
        }
        const d = new Date(s);
        if (!isNaN(d.getTime())) return d;
      }
      return fallback !== undefined ? fallback : null;
    };

    const data: any = {};

    // 1. Identity & Name
    if (payload.firstName !== undefined)
      data.firstName = payload.firstName?.trim() || '';
    if (payload.lastName !== undefined)
      data.lastName = payload.lastName?.trim() || '';
    if (payload.firstName !== undefined || payload.lastName !== undefined) {
      const f =
        payload.firstName !== undefined
          ? payload.firstName.trim()
          : current.firstName || '';
      const l =
        payload.lastName !== undefined
          ? payload.lastName.trim()
          : current.lastName || '';
      data.fullName = `${f} ${l}`.trim() || current.fullName;
    } else if (payload.fullName !== undefined) {
      data.fullName = payload.fullName?.trim();
    }
    if (payload.dateOfBirth !== undefined) {
      data.dateOfBirth = parseDateSafe(payload.dateOfBirth, current.dateOfBirth);
    }
    if (payload.gender !== undefined) data.gender = payload.gender;

    // 2. Employment
    if (payload.jobTitle !== undefined)
      data.jobTitle = payload.jobTitle?.trim();

    if (payload.departmentId) {
      if (payload.departmentId === 'CUSTOM' || payload.customDepartment) {
        const dept = await this.createDepartment({ name: payload.customDepartment || payload.departmentName || 'Custom Department' }, user);
        data.departmentId = dept.id;
      } else {
        const deptExists = await this.prisma.department.findUnique({ where: { id: payload.departmentId } });
        data.departmentId = deptExists ? deptExists.id : current.departmentId;
      }
    } else if (payload.customDepartment) {
      const dept = await this.createDepartment({ name: payload.customDepartment }, user);
      data.departmentId = dept.id;
    } else if (payload.departmentId === null) {
      data.departmentId = null;
    }

    if (payload.workLocationId) {
      if (payload.workLocationId === 'CUSTOM' || payload.customWorkLocation) {
        const loc = await this.createWorkLocation({ name: payload.customWorkLocation || payload.workLocationName || 'Custom Location' }, user);
        data.workLocationId = loc.id;
      } else if (payload.workLocationId !== 'Select Location') {
        const locExists = await this.prisma.workLocation.findUnique({ where: { id: payload.workLocationId } });
        data.workLocationId = locExists ? locExists.id : current.workLocationId;
      }
    } else if (payload.customWorkLocation) {
      const loc = await this.createWorkLocation({ name: payload.customWorkLocation }, user);
      data.workLocationId = loc.id;
    } else if (payload.workLocationId === null) {
      data.workLocationId = null;
    }

    if (payload.reportingManagerId) {
      if (payload.reportingManagerId === id || payload.reportingManagerId === current.id) {
        data.reportingManagerId = null;
      } else {
        const mgrExists = await this.prisma.employee.findUnique({ where: { id: payload.reportingManagerId } });
        data.reportingManagerId = mgrExists ? mgrExists.id : null;
      }
    } else if (payload.reportingManagerId === null) {
      data.reportingManagerId = null;
    }

    if (payload.employmentType !== undefined)
      data.employmentType = payload.employmentType;
    if (payload.joiningDate !== undefined) {
      data.joiningDate = parseDateSafe(payload.joiningDate, current.joiningDate);
    }
    if (payload.probationEndDate !== undefined) {
      data.probationEndDate = parseDateSafe(payload.probationEndDate, null);
    }
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.branchName !== undefined)
      data.branchName = payload.branchName || null;
    if (payload.baseSalary !== undefined || payload.salary !== undefined) {
      const sal =
        payload.baseSalary !== undefined ? payload.baseSalary : payload.salary;
      data.baseSalary = Number(sal) || 0;
    }

    // 3. Contact Details
    if (payload.workEmail !== undefined)
      data.workEmail = payload.workEmail?.trim().toLowerCase();
    if (payload.personalEmail !== undefined)
      data.personalEmail = payload.personalEmail?.trim().toLowerCase() || null;
    if (payload.phoneNumber !== undefined)
      data.phoneNumber = payload.phoneNumber?.trim();
    if (payload.companyPhoneNumber !== undefined)
      data.companyPhoneNumber = payload.companyPhoneNumber?.trim() || null;
    if (payload.residentialAddress !== undefined)
      data.residentialAddress = payload.residentialAddress?.trim();
    if (payload.permanentAddress !== undefined)
      data.permanentAddress = payload.permanentAddress?.trim();

    // 4. Emergency Contact
    if (payload.emergencyContactName !== undefined)
      data.emergencyContactName = payload.emergencyContactName?.trim();
    if (payload.emergencyContactPhone !== undefined)
      data.emergencyContactPhone = payload.emergencyContactPhone?.trim();
    if (payload.emergencyRelationship !== undefined)
      data.emergencyRelationship = payload.emergencyRelationship?.trim();

    // 5. Statutory & Bank
    if (payload.panNumber !== undefined)
      data.panNumber = payload.panNumber?.trim().toUpperCase();
    if (payload.uanNumber !== undefined)
      data.uanNumber = payload.uanNumber?.trim() || null;
    if (payload.esicNumber !== undefined)
      data.esicNumber = payload.esicNumber?.trim() || null;
    if (payload.bankName !== undefined)
      data.bankName = payload.bankName?.trim();
    if (payload.accountHolderName !== undefined)
      data.accountHolderName = payload.accountHolderName?.trim();
    if (payload.bankAccountType !== undefined)
      data.bankAccountType = payload.bankAccountType;
    if (payload.ifscCode !== undefined)
      data.ifscCode = payload.ifscCode?.trim().toUpperCase();

    if (payload.aadhaarNumber && !payload.aadhaarNumber.includes('X') && !payload.aadhaarNumber.includes('•') && !payload.aadhaarNumber.includes('*')) {
      const aadhaar = payload.aadhaarNumber.replace(/\D/g, '');
      if (aadhaar.length >= 4) {
        data.aadhaarNumberEncrypted = this.encrypt(aadhaar);
        data.aadhaarLastFour = aadhaar.slice(-4);
        data.aadhaarHash = this.hash(aadhaar);
      }
    }

    if (payload.bankAccountNumber && !payload.bankAccountNumber.includes('X') && !payload.bankAccountNumber.includes('•') && !payload.bankAccountNumber.includes('*')) {
      const bankAccount = payload.bankAccountNumber.replace(/\D/g, '');
      if (bankAccount.length >= 4) {
        data.bankAccountEncrypted = this.encrypt(bankAccount);
        data.bankAccountLastFour = bankAccount.slice(-4);
        data.bankAccountHash = this.hash(bankAccount);
      }
    }

    let userId = current.userId || null;
    const targetEmail = data.workEmail || current.workEmail;
    if (targetEmail) {
      const matchedUser = await this.prisma.user.findUnique({
        where: { email: targetEmail },
      });
      if (matchedUser) {
        userId = matchedUser.id;
        if (data.fullName) {
          await this.prisma.user
            .update({
              where: { id: matchedUser.id },
              data: { name: data.fullName },
            })
            .catch(() => {});
        }
      }
    }
    if (current.userId) {
      const userUpdate: any = {};
      if (data.workEmail) userUpdate.email = data.workEmail;
      if (data.fullName) userUpdate.name = data.fullName;
      if (Object.keys(userUpdate).length > 0) {
        await this.prisma.user.update({
          where: { id: current.userId },
          data: userUpdate,
        }).catch(() => {});
      }
    }

    const updated = await this.prisma.employee.update({
      where: { id: current.id },
      data: {
        ...data,
        userId,
        version: { increment: 1 },
        updatedById: user.sub,
      },
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
    return mapEmployee(updated, (val) => this.decrypt(val));
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
    return mapEmployee(updated, (val) => this.decrypt(val));
  }

  departments(user: any) {
    return this.prisma.department.findMany({
      where: { companyId: this.companyId(user), isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(body: any, user: any) {
    const companyId = this.companyId(user);
    const name = (body.name || body.departmentName || '').trim();
    if (!name) throw new BadRequestException('Department name is required.');

    let existing = await this.prisma.department.findFirst({
      where: { companyId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return existing;

    const code = (
      body.code ||
      `DEPT_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20)}_${randomBytes(2).toString('hex').toUpperCase()}`
    ).trim();

    return this.prisma.department.create({
      data: {
        companyId,
        name,
        code,
        isActive: true,
      },
    });
  }

  locations(user: any) {
    return this.prisma.workLocation.findMany({
      where: { companyId: this.companyId(user), isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createWorkLocation(body: any, user: any) {
    const companyId = this.companyId(user);
    const name = (body.name || body.locationName || '').trim();
    if (!name) throw new BadRequestException('Work location name is required.');

    let existing = await this.prisma.workLocation.findFirst({
      where: { companyId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return existing;

    const code = (
      body.code ||
      `LOC_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20)}_${randomBytes(2).toString('hex').toUpperCase()}`
    ).trim();

    return this.prisma.workLocation.create({
      data: {
        companyId,
        name,
        code,
        isActive: true,
      },
    });
  }
  managers(user: any, excludeId?: string) {
    return this.prisma.employee.findMany({
      where: {
        companyId: this.companyId(user),
        status: { in: ACTIVE_MANAGER_STATUSES },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async nextCode(user: any) {
    const rows = await this.prisma.employee.findMany({
      where: { companyId: this.companyId(user) },
      select: { employeeCode: true },
    });
    const highest = rows.reduce((max, { employeeCode }) => {
      const trimmed = (employeeCode || '').trim();
      const match = trimmed.match(/^EMP-(\d+)$/i) || trimmed.match(/^(\d+)$/);
      return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
    }, 0);
    return { employeeCode: `EMP-${highest + 1}` };
  }

  async addDocument(id: string, file: any, body: any, user: any) {
    const employee = await this.get(id, user);
    const targetId = employee.id;

    let rawType = (body.documentType || body.category || EmployeeDocumentType.OTHER).toUpperCase().replaceAll(' ', '_');
    if (rawType === 'AADHAAR' || rawType === 'AADHAAR_CARD_PROOF') rawType = 'AADHAAR_CARD';
    if (rawType === 'PAN' || rawType === 'PAN_CARD_PROOF') rawType = 'PAN_CARD';
    if (rawType === 'BANK' || rawType === 'BANK_PROOF' || rawType === 'BANK_PASSBOOK_/_CHEQUE') rawType = 'BANK_PASSBOOK';
    if (rawType === 'PHOTO' || rawType === 'PASSPORT_PHOTO') rawType = 'PHOTOGRAPH';
    if (rawType === 'SIG' || rawType === 'DIGITAL_SIGNATURE') rawType = 'SIGNATURE';

    const validDocType = (Object.values(EmployeeDocumentType) as string[]).includes(rawType)
      ? (rawType as EmployeeDocumentType)
      : EmployeeDocumentType.OTHER;

    const folder =
      validDocType === EmployeeDocumentType.PHOTOGRAPH
        ? 'photograph'
        : validDocType === EmployeeDocumentType.SIGNATURE
          ? 'signature'
          : validDocType === EmployeeDocumentType.AADHAAR_CARD
            ? 'aadhaar'
            : validDocType === EmployeeDocumentType.PAN_CARD
              ? 'pan'
              : validDocType === EmployeeDocumentType.BANK_PASSBOOK
                ? 'bank'
                : 'additional';

    const stored = await this.files.store(targetId, file, folder);

    const document = await this.prisma.employeeDocument.create({
      data: {
        employeeId: targetId,
        documentType: validDocType,
        documentName: body.documentName || body.customTitle || file.originalname,
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
        after: { employeeId: targetId, documentType: document.documentType },
      },
    });
    return document;
  }

  async getDocument(employeeId: string, documentId: string) {
    return this.prisma.employeeDocument.findFirst({
      where: {
        id: documentId,
        ...(employeeId && employeeId !== 'any' ? { employeeId } : {}),
      },
    });
  }

  resolveEmployeeDocFile(storageKey: string) {
    return this.files.resolve(storageKey);
  }

  async deleteDocument(employeeId: string, documentId: string, user: any) {
    const employee = await this.get(employeeId, user);
    const targetId = employee.id;
    const document = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, employeeId: targetId },
    });
    if (!document) throw new NotFoundException('Document not found.');
    await this.prisma.employeeDocument.delete({ where: { id: documentId } });
    try {
      await this.files.remove(document.storageKey);
    } catch {
      // ignore storage removal error if missing
    }
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_DOCUMENT_DELETED',
        entityType: 'EmployeeDocument',
        entityId: documentId,
        before: { employeeId: targetId, documentType: document.documentType },
      },
    });
    return { deleted: true };
  }

  async delete(id: string, user: any) {
    const current = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!current) {
      throw new NotFoundException('Employee not found');
    }
    const deleted = await this.prisma.employee.delete({
      where: { id },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.companyId(user),
        action: 'EMPLOYEE_DELETED',
        entityType: 'Employee',
        entityId: id,
        before: { id: current.id, fullName: current.fullName },
      },
    });
    return { success: true };
  }

  async getDashboardMetrics(query: any, user: any) {
    const compId = this.companyId(user);
    const now = new Date();
    const monthNum = query?.month ? parseInt(String(query.month), 10) : (now.getMonth() + 1);
    const yearNum = query?.year ? parseInt(String(query.year), 10) : now.getFullYear();

    // IST Today range (UTC+5:30)
    const istOffsetMs = 330 * 60000;
    const istNow = new Date(now.getTime() + istOffsetMs);
    const todayStr = istNow.toISOString().slice(0, 10);
    const todayStart = new Date(`${todayStr}T00:00:00.000+05:30`);
    const todayEnd = new Date(`${todayStr}T23:59:59.999+05:30`);

    const activeStatuses = ['ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE'];
    const exitStatuses = ['RESIGNED', 'TERMINATED', 'RETIRED'];

    // 1. Fetch workforce with active salary structure
    const employees = await this.prisma.employee.findMany({
      where: { companyId: compId },
      include: {
        department: true,
        workLocation: true,
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const totalStaff = employees.length;
    const activeStaff = employees.filter((e) => activeStatuses.includes(e.status)).length;
    const inactiveStaff = employees.filter((e) => !activeStatuses.includes(e.status)).length;
    const onProbation = employees.filter((e) => e.status === 'ON_PROBATION').length;

    // New joinees in selected month
    const newJoinees = employees.filter((e) => {
      if (!e.joiningDate) return false;
      const jd = new Date(e.joiningDate);
      return (
        !isNaN(jd.getTime()) &&
        jd.getUTCFullYear() === yearNum &&
        jd.getUTCMonth() + 1 === monthNum
      );
    });

    // Department workforce distribution (Strictly Active Staff)
    const activeEmployees = employees.filter((e) => activeStatuses.includes(e.status));
    const deptMap: Record<string, number> = {};
    activeEmployees.forEach((emp) => {
      let dName = (emp.department?.name || 'Unassigned').trim();
      const lower = dName.toLowerCase();
      if (lower === 'sales' || lower === 'sales department') dName = 'Sales Department';
      else if (lower === 'production' || lower === 'production department') dName = 'Production Department';
      else if (lower === 'hr' || lower === 'hr department' || lower === 'human resources') dName = 'HR Department';
      else if (lower === 'super admin' || lower === 'super admin department') dName = 'Super Admin Department';
      else if (lower === 'dispatch' || lower === 'dispatch department') dName = 'Dispatch Department';
      else if (lower === 'finance' || lower === 'finance department') dName = 'Finance Department';
      else if (lower === 'store' || lower === 'store department') dName = 'Store Department';
      else if (lower === 'data analytics') dName = 'Data Analytics';

      deptMap[dName] = (deptMap[dName] || 0) + 1;
    });
    const DEPT_COLORS = [
      '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
      '#6366f1', '#06b6d4', '#14b8a6', '#f97316', '#84cc16'
    ];
    const departments = Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        percentage: activeStaff > 0 ? Number(((count / activeStaff) * 100).toFixed(1)) : 0,
        color: DEPT_COLORS[idx % DEPT_COLORS.length],
      }));

    // 2. Fetch today's attendance
    const todayAttendance = await this.prisma.attendance.findMany({
      where: {
        companyId: compId,
        attendanceDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        employee: {
          select: { id: true, employeeCode: true, fullName: true, department: { select: { name: true } } },
        },
      },
    });

    const presentStatuses = ['PRESENT', 'PUNCHED_IN', 'HALF_DAY'];
    const presentToday = todayAttendance.filter((a) => presentStatuses.includes(a.status)).length;
    const lateToday = todayAttendance.filter((a) => a.lateMinutes > 0).length;
    const onLeaveToday = todayAttendance.filter((a) => a.status === 'PAID_LEAVE' || a.status === 'UNPAID_LEAVE').length;
    const halfDayToday = todayAttendance.filter((a) => a.status === 'HALF_DAY').length;
    const overtimeToday = todayAttendance.filter((a) => a.overtimeMinutes > 0).length;

    // Active staff not checked in or on leave are counted as absent
    const recordedAbsent = todayAttendance.filter((a) => a.status === 'ABSENT').length;
    const absentToday = Math.max(recordedAbsent, Math.max(0, activeStaff - presentToday - onLeaveToday));

    // Attendance rate strictly against active staff
    const attendanceRate = activeStaff > 0 ? Number(((presentToday / activeStaff) * 100).toFixed(1)) : 0;

    // Previous days missing checkouts strictly within current month
    const monthStart = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0));
    const missingCheckouts = await this.prisma.attendance.count({
      where: {
        companyId: compId,
        attendanceDate: {
          gte: monthStart,
          lt: todayStart,
        },
        punchInAt: { not: null },
        punchOutAt: null,
      },
    });

    // Attendance regularization requests pending
    const pendingAttendanceReqs = await this.prisma.manualAttendanceRequest.findMany({
      where: {
        employee: { companyId: compId },
        status: 'PENDING',
      },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Leaves
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: { companyId: compId },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingLeaves = leaveRequests.filter((l) =>
      ['PENDING_HR', 'PENDING_PLANT_HEAD', 'PENDING_SUPER_ADMIN'].includes(l.status),
    );
    const approvedThisMonth = leaveRequests.filter(
      (l) =>
        l.status === 'APPROVED' &&
        l.approvedAt &&
        new Date(l.approvedAt).getUTCMonth() + 1 === monthNum &&
        new Date(l.approvedAt).getUTCFullYear() === yearNum,
    ).length;
    const rejectedThisMonth = leaveRequests.filter(
      (l) =>
        l.status === 'REJECTED' &&
        l.updatedAt &&
        new Date(l.updatedAt).getUTCMonth() + 1 === monthNum &&
        new Date(l.updatedAt).getUTCFullYear() === yearNum,
    ).length;

    const leaveStatusData = [
      { name: 'Approved', value: leaveRequests.filter((l) => l.status === 'APPROVED').length, color: '#10b981' },
      { name: 'Pending', value: pendingLeaves.length, color: '#f59e0b' },
      { name: 'Rejected', value: leaveRequests.filter((l) => l.status === 'REJECTED').length, color: '#ef4444' },
    ];

    const leaveTypeCounts: Record<string, number> = {};
    leaveRequests.forEach((l) => {
      const t = l.leaveType || 'General Leave';
      leaveTypeCounts[t] = (leaveTypeCounts[t] || 0) + 1;
    });
    const totalLeavesCount = Math.max(1, leaveRequests.length);
    const LEAVE_TYPE_COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
    const leaveTypesData = Object.entries(leaveTypeCounts).map(([type, count], idx) => ({
      type,
      count,
      percentage: Number(((count / totalLeavesCount) * 100).toFixed(0)),
      color: LEAVE_TYPE_COLORS[idx % LEAVE_TYPE_COLORS.length],
    }));

    const recentLeaves = leaveRequests.slice(0, 5).map((l) => ({
      id: l.id,
      empName: l.employee?.fullName || 'Staff Member',
      leaveType: l.leaveType,
      startDate: l.fromDate ? l.fromDate.toISOString().slice(0, 10) : '',
      endDate: l.toDate ? l.toDate.toISOString().slice(0, 10) : '',
      duration: l.totalDays,
      status: l.status,
      reason: l.reason,
    }));

    // 4. Payroll Records for Selected Month + Real 6-Month Historical Outlay Trend
    const payrollRecords = await this.prisma.payrollRecord.findMany({
      where: {
        companyId: compId,
        payrollPeriod: {
          month: monthNum,
          year: yearNum,
        },
      },
      include: {
        payrollPeriod: true,
        salarySlip: true,
      },
    });

    let grossTotal = 0;
    let leaveDeductionsTotal = 0;
    let otherDeductionsTotal = 0;
    let netPayableTotal = 0;
    let slipsGeneratedCount = 0;
    let salariesDisbursedCount = 0;

    if (payrollRecords.length > 0) {
      for (const pr of payrollRecords) {
        const g = Number(pr.grossEarnings || 0);
        const l = Number(pr.leaveDeduction || 0);
        const o = Number(pr.totalDeductions || 0) - l;
        const n = Number(pr.netPayable || 0);
        grossTotal += g;
        leaveDeductionsTotal += Math.max(0, l);
        otherDeductionsTotal += Math.max(0, o);
        netPayableTotal += n;
        if (pr.salarySlip) slipsGeneratedCount++;
        if (pr.status === 'PAID') salariesDisbursedCount++;
      }
    } else {
      // If payroll period hasn't been generated yet, compute from active employee salary structures
      for (const emp of employees) {
        if (activeStatuses.includes(emp.status)) {
          const st = emp.salaryStructures?.[0];
          if (st) {
            grossTotal += Number(st.grossSalary || st.basicSalary || 0);
          }
        }
      }
      netPayableTotal = grossTotal;
    }
    const payrollReadyPercentage = activeStaff > 0 ? Math.min(100, Math.round((slipsGeneratedCount / activeStaff) * 100)) : 0;

    // Real 6-Month historical outlay trend
    const recent6Months: Array<{ month: number; year: number; label: string; fullLabel: string }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(yearNum, monthNum - 1 - i, 1);
      recent6Months.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: d.toLocaleString('en-US', { month: 'short' }),
        fullLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      });
    }

    const sixMonthsHistory = await this.prisma.payrollRecord.findMany({
      where: {
        companyId: compId,
        payrollPeriod: {
          OR: recent6Months.map((m) => ({ month: m.month, year: m.year })),
        },
      },
      select: {
        grossEarnings: true,
        netPayable: true,
        payrollPeriod: { select: { month: true, year: true } },
      },
    });

    const payrollTrendData = recent6Months.map((m) => {
      const matching = sixMonthsHistory.filter(
        (r) => r.payrollPeriod?.month === m.month && r.payrollPeriod?.year === m.year,
      );
      if (matching.length > 0) {
        const grossSum = matching.reduce((s, r) => s + Number(r.grossEarnings || 0), 0);
        const netSum = matching.reduce((s, r) => s + Number(r.netPayable || 0), 0);
        return {
          month: m.label,
          gross: Number((grossSum / 100000).toFixed(1)),
          net: Number((netSum / 100000).toFixed(1)),
        };
      }
      if (m.month === monthNum && m.year === yearNum && grossTotal > 0) {
        return {
          month: m.label,
          gross: Number((grossTotal / 100000).toFixed(1)),
          net: Number((netPayableTotal / 100000).toFixed(1)),
        };
      }
      return {
        month: m.label,
        gross: 0,
        net: 0,
      };
    });

    // 5. Exits & Offboarding
    const exitingEmployees = employees.filter((e) =>
      exitStatuses.includes(e.status) || e.status === 'INACTIVE',
    );
    const exitsList = exitingEmployees.map((e) => ({
      empId: e.employeeCode || e.id,
      name: e.fullName,
      department: e.department?.name || 'Operations',
      status: e.status === 'RESIGNED' ? 'In Progress' : 'Cleared',
      progress: e.status === 'RESIGNED' ? 50 : 100,
      effectiveDate: e.updatedAt ? e.updatedAt.toISOString().slice(0, 10) : todayStr,
      checkpoints: {
        IT: e.status !== 'RESIGNED',
        Finance: e.status !== 'RESIGNED',
        Store: e.status !== 'RESIGNED',
        HR: e.status !== 'RESIGNED',
      },
    }));

    // 6. Recruitment & Drafts
    const drafts = await this.prisma.employeeDraft.findMany({
      where: { companyId: compId },
      select: { id: true, employeeData: true, updatedAt: true },
    });
    const recruitmentRequests = await this.prisma.recruitmentRequest.findMany({
      where: { companyId: compId },
      select: { id: true, indentNumber: true, designation: true, vacancies: true, status: true },
    });
    const openRecruitment = recruitmentRequests.filter((r) =>
      ['OPEN', 'PENDING', 'IN_PROGRESS', 'HR_PROCESSING'].includes(r.status),
    );
    const onboardingCount = drafts.length + openRecruitment.length + newJoinees.length;

    // 7. Expenses
    const pendingExpenses = await this.prisma.expense.findMany({
      where: {
        companyId: compId,
        status: { in: ['PENDING_HR', 'PENDING_SUPER_ADMIN'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    const pendingExpensesCount = pendingExpenses.length;
    const pendingExpensesTotal = pendingExpenses.reduce((s, ex) => s + Number(ex.amount || 0), 0);

    // 8. Recent Activity / Audit Logs
    const recentAuditLogs = await this.prisma.auditLog.findMany({
      where: {
        companyId: compId,
        entityType: {
          in: ['Employee', 'EmployeeDraft', 'EmployeeDocument', 'PayrollRecord', 'LeaveRequest', 'Attendance', 'Expense', 'SalaryStructure'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    const recentActivities = recentAuditLogs.map((log) => {
      const d = new Date(log.createdAt);
      const timeStr = !isNaN(d.getTime())
        ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
        : 'Recent';
      let category = 'HR';
      let badgeColor = '#0ea5e9';
      const entityStr = String(log.entityType || '').toUpperCase();
      const actionStr = String(log.action || '').toUpperCase();
      if (entityStr.includes('LEAVE') || actionStr.includes('LEAVE')) {
        category = 'Leave'; badgeColor = '#10b981';
      } else if (entityStr.includes('PAYROLL') || entityStr.includes('SALARY')) {
        category = 'Payroll'; badgeColor = '#8b5cf6';
      } else if (entityStr.includes('ATTENDANCE') || actionStr.includes('PUNCH')) {
        category = 'Attendance'; badgeColor = '#06b6d4';
      } else if (entityStr.includes('EXPENSE')) {
        category = 'Expense'; badgeColor = '#f59e0b';
      } else if (entityStr.includes('EMPLOYEE')) {
        category = 'Onboarding'; badgeColor = '#0ea5e9';
      }
      return {
        time: timeStr,
        text: `${log.action.replace(/_/g, ' ')} (${log.entityType})`,
        category,
        badgeColor,
      };
    });

    // 9. HR Action Center Items
    const actionItems: any[] = [];
    if (pendingLeaves.length > 0) {
      actionItems.push({
        id: 'act-leaves',
        title: `${pendingLeaves.length} Leave Request${pendingLeaves.length > 1 ? 's' : ''}`,
        subtitle: `${pendingLeaves.length} require immediate HR approval`,
        priority: 'high',
        type: 'Leave',
        actionText: 'Review',
        path: '/hr/leave-approvals',
      });
    }
    if (exitsList.filter((e) => e.status !== 'Cleared').length > 0) {
      const pendingExitsCount = exitsList.filter((e) => e.status !== 'Cleared').length;
      actionItems.push({
        id: 'act-exits',
        title: `${pendingExitsCount} Exit Clearance${pendingExitsCount > 1 ? 's' : ''}`,
        subtitle: `${pendingExitsCount} awaiting department sign-off`,
        priority: 'high',
        type: 'Exit',
        actionText: 'Open',
        path: '/hr/exit-clearance',
      });
    }
    if (onboardingCount > 0) {
      actionItems.push({
        id: 'act-onboarding',
        title: `${onboardingCount} Employee Onboarding${onboardingCount > 1 ? 's' : ''}`,
        subtitle: `${drafts.length} drafts, ${openRecruitment.length} requisitions, ${newJoinees.length} new hires`,
        priority: 'medium',
        type: 'Onboarding',
        actionText: 'Review',
        path: '/hr/register-staff',
      });
    }
    if (pendingAttendanceReqs.length > 0) {
      actionItems.push({
        id: 'act-attendance',
        title: `${pendingAttendanceReqs.length} Attendance Correction${pendingAttendanceReqs.length > 1 ? 's' : ''}`,
        subtitle: 'Manual shift punch & regularization requests',
        priority: 'high',
        type: 'Attendance',
        actionText: 'Review',
        path: '/hr/attendance-requests',
      });
    }
    if (pendingExpensesCount > 0) {
      actionItems.push({
        id: 'act-expenses',
        title: `${pendingExpensesCount} Pending Expense Claim${pendingExpensesCount > 1 ? 's' : ''}`,
        subtitle: `Totaling ₹${Math.round(pendingExpensesTotal).toLocaleString('en-IN')}`,
        priority: 'medium',
        type: 'Expense',
        actionText: 'Review',
        path: '/hr/expense-management',
      });
    }

    return {
      period: {
        month: monthNum,
        year: yearNum,
        monthName: new Date(yearNum, monthNum - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      workforce: {
        totalStaff,
        activeStaff,
        inactiveStaff,
        onProbation,
        newJoineesCount: newJoinees.length,
        newJoinees: newJoinees.map((e) => ({
          id: e.id,
          employeeCode: e.employeeCode,
          fullName: e.fullName,
          department: e.department?.name,
          joiningDate: e.joiningDate,
        })),
        departments,
      },
      attendance: {
        today: {
          targetDate: todayStr,
          present: presentToday,
          late: lateToday,
          absent: absentToday,
          onLeave: onLeaveToday,
          halfDay: halfDayToday,
          attendanceRate,
          missingCheckouts,
          overtime: overtimeToday,
        },
        breakdown: [
          { name: 'Present', count: presentToday, color: '#10b981' },
          { name: 'Late', count: lateToday, color: '#f59e0b' },
          { name: 'Absent', count: absentToday, color: '#ef4444' },
          { name: 'On Leave', count: onLeaveToday, color: '#8b5cf6' },
          { name: 'Half Day', count: halfDayToday, color: '#0ea5e9' },
        ],
        exceptions: [
          ...(lateToday > 0 ? [{ type: 'Late Check-ins', count: lateToday, severity: 'warning', detail: 'Grace limit exceeded (+15 mins)' }] : []),
          ...(missingCheckouts > 0 ? [{ type: 'Missing Check-outs', count: missingCheckouts, severity: 'danger', detail: 'Punches unverified from previous days' }] : []),
          ...(overtimeToday > 0 ? [{ type: 'Overtime', count: overtimeToday, severity: 'info', detail: 'Extended shift hours recorded' }] : []),
          ...(pendingAttendanceReqs.length > 0 ? [{ type: 'Correction Requests', count: pendingAttendanceReqs.length, severity: 'danger', detail: 'Manual punch & regularizations' }] : []),
        ],
      },
      leaves: {
        pendingCount: pendingLeaves.length,
        approvedThisMonth,
        rejectedThisMonth,
        statusBreakdown: leaveStatusData,
        typesBreakdown: leaveTypesData,
        recentLeaves,
      },
      payroll: {
        grossTotal,
        leaveDeductionsTotal,
        otherDeductionsTotal,
        netPayableTotal,
        slipsGeneratedCount,
        salariesDisbursedCount,
        payrollReadyPercentage,
        outlayTrend: payrollTrendData,
      },
      exits: {
        totalExits: exitsList.length,
        pendingCount: exitsList.filter((e) => e.status !== 'Cleared').length,
        clearedCount: exitsList.filter((e) => e.status === 'Cleared').length,
        list: exitsList,
      },
      onboarding: {
        totalCount: onboardingCount,
        draftsCount: drafts.length,
        openRequisitionsCount: openRecruitment.length,
        newJoineesCount: newJoinees.length,
      },
      expenses: {
        pendingCount: pendingExpensesCount,
        pendingTotal: pendingExpensesTotal,
      },
      actionItems,
      recentActivities,
    };
  }
}
