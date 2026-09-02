import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
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

  private mapJobTitleToRoleCode(
    jobTitle: string,
    departmentName: string,
  ): string {
    const title = (jobTitle || '').toUpperCase().replace(/_/g, ' ');
    if (title.includes('SUPER SALES')) return 'SUPER_SALES';
    if (title.includes('SALES EXECUTIVE') || title.includes('SALES EXEC'))
      return 'SALES_EXECUTIVE';
    if (title.includes('SALES MANAGER')) return 'SALES_MANAGER';
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
    if (title.includes('DISPATCH EXECUTIVE')) return 'DISPATCH_EXECUTIVE';
    if (title.includes('DISPATCH 2')) return 'DISPATCH_2';
    if (title.includes('FINANCE EXECUTIVE')) return 'FINANCE_EXECUTIVE';
    if (title.includes('FINANCE MANAGER')) return 'FINANCE_MANAGER';
    if (title.includes('STORE MANAGER') || title.includes('STORE'))
      return 'STORE_MANAGER';
    if (title.includes('HR') || title.includes('HUMAN RESOURCES')) return 'HR';
    if (title.includes('ADMIN')) return 'ADMIN';

    const dept = (departmentName || '').toUpperCase();
    if (dept.includes('SALES')) return 'SALES_EXECUTIVE';
    if (dept.includes('PRODUCTION')) return 'PRODUCTION_OPERATOR';
    if (dept.includes('FINANCE')) return 'FINANCE_EXECUTIVE';
    if (dept.includes('HR')) return 'HR';

    return 'SALES_EXECUTIVE';
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
    const rawPageSize = query.pageSize || query.limit || query.take || 20;
    const pageSize = Math.min(rawPageSize, 1000);
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
    const mapped = items.map(mapEmployee);
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
    return mapEmployee(employee);
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
      data.dateOfBirth = payload.dateOfBirth
        ? new Date(payload.dateOfBirth)
        : current.dateOfBirth;
    }
    if (payload.gender !== undefined) data.gender = payload.gender;

    // 2. Employment
    if (payload.jobTitle !== undefined)
      data.jobTitle = payload.jobTitle?.trim();
    if (payload.departmentId !== undefined)
      data.departmentId = payload.departmentId || null;
    if (payload.reportingManagerId !== undefined)
      data.reportingManagerId = payload.reportingManagerId || null;
    if (payload.workLocationId !== undefined)
      data.workLocationId = payload.workLocationId || null;
    if (payload.employmentType !== undefined)
      data.employmentType = payload.employmentType;
    if (payload.joiningDate !== undefined) {
      data.joiningDate = payload.joiningDate
        ? new Date(payload.joiningDate)
        : current.joiningDate;
    }
    if (payload.probationEndDate !== undefined) {
      data.probationEndDate = payload.probationEndDate
        ? new Date(payload.probationEndDate)
        : null;
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

    if (payload.aadhaarNumber && !payload.aadhaarNumber.includes('X')) {
      const aadhaar = payload.aadhaarNumber.replace(/\D/g, '');
      if (aadhaar.length >= 4) {
        data.aadhaarNumberEncrypted = this.encrypt(aadhaar);
        data.aadhaarLastFour = aadhaar.slice(-4);
        data.aadhaarHash = this.hash(aadhaar);
      }
    }

    if (payload.bankAccountNumber && !payload.bankAccountNumber.includes('X')) {
      const bankAccount = payload.bankAccountNumber.replace(/\D/g, '');
      if (bankAccount.length >= 4) {
        data.bankAccountEncrypted = this.encrypt(bankAccount);
        data.bankAccountLastFour = bankAccount.slice(-4);
        data.bankAccountHash = this.hash(bankAccount);
      }
    }

    if (payload.selfieUrl !== undefined) data.selfieUrl = payload.selfieUrl;
    if (payload.signatureUrl !== undefined)
      data.signatureUrl = payload.signatureUrl;

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

    const updated = await this.prisma.employee.update({
      where: { id },
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
    const stored = await this.files.store(targetId, file, 'additional');

    const rawType = (body.documentType || body.category || EmployeeDocumentType.OTHER).toUpperCase().replaceAll(' ', '_');
    const validDocType = (Object.values(EmployeeDocumentType) as string[]).includes(rawType)
      ? (rawType as EmployeeDocumentType)
      : EmployeeDocumentType.OTHER;

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
}
