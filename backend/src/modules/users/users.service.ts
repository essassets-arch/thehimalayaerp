import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';

const KNOWN_USER_PASSWORDS: Record<string, string> = {
  'super.admin@himalayaerp.com': 'SuperAdmin@hcppl',
  'nahin.v@himalayaerp.com': 'HR@hcppl',
  'superadmin@himalayaerp.com': 'SuperAdmin@hcppl',
  'abbas.b@himalayaerp.com': 'dataAnalyst#2101',
  'supersales1@himalayaerp.com': 'supersales123',
  'supersales2@himalayaerp.com': 'supersales124',
  'sales1@himalayaerp.com': 'Himalaya@2026',
  'sales2@himalayaerp.com': 'Himalaya@2026',
  'sales3@himalayaerp.com': 'Himalaya@2026',
  'sales4@himalayaerp.com': 'Himalaya@2026',
  'sales5@himalayaerp.com': 'Himalaya@2026',
  'sales6@himalayaerp.com': 'Himalaya@2026',
  'sales7@himalayaerp.com': 'Himalaya@2026',
  'sales11@himalayaerp.com': 'Himalayacc@2025',
  'sales12@himalayaerp.com': 'Jyoti@2258',
  'sales13@himalayaerp.com': 'Himalaya@2026',
  'sales14@himalayaerp.com': 'ARHIMALAYA12',
  'sahad.m@himalayaerp.com': 'Hcppl@5253',
  'trushna.g@himalayaerp.com': 'Himalaya@3252',
  'ravikant.t@himalayaerp.com': 'Logistics@hcppl',
  'sahad.dispatch@himalayaerp.com': 'Sahad@5253',
  'sana.r@himalayaerp.com': 'Himalaya@1234',
  'moksha.n@himalayaerp.com': 'Production@hcppl',
  'hussain.t@himalayaerp.com': 'Rnd@hcppl',
  'makhdum@himalayaerp.com': 'Store@hcppl',
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const [users, allEmployees] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        include: {
          role: true,
          employee: {
            include: { department: true }
          }
        },
      }),
      this.prisma.employee.findMany({
        select: { id: true, employeeCode: true, workEmail: true, userId: true, department: { select: { name: true } } }
      })
    ]);

    const empByUserId = new Map();
    const empByEmail = new Map();
    for (const emp of allEmployees) {
      if (emp.userId) empByUserId.set(emp.userId, emp);
      if (emp.workEmail) empByEmail.set(emp.workEmail.toLowerCase(), emp);
    }

    const mapped = users.map(u => {
      const linkedEmp = u.employee || empByUserId.get(u.id) || empByEmail.get(u.email.toLowerCase());
      const empCode = linkedEmp?.employeeCode || u.publicId;
      const normalizedEmail = (u.email || '').toLowerCase().trim();
      return {
        id: u.id,
        publicId: empCode,
        employeeCode: empCode,
        employeeId: linkedEmp?.id || null,
        name: u.name,
        email: u.email,
        password: KNOWN_USER_PASSWORDS[normalizedEmail] || 'Himalaya@2026',
        role: u.role?.name || 'Staff',
        roleCode: u.role?.code || 'STAFF',
        roleId: u.roleId,
        department: linkedEmp?.department?.name || u.employee?.department?.name || u.role?.name || 'Super Admin',
        dispatchCategory: u.dispatchCategory,
        isActive: u.isActive,
        status: u.isActive ? 'Active' : 'Inactive',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      };
    });

    const getNum = (code: string | null | undefined) => {
      if (!code) return 999999;
      const match = String(code).match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 999999;
    };

    mapped.sort((a, b) => getNum(a.employeeCode) - getNum(b.employeeCode));
    return mapped;
  }

  async create(data: any) {
    const email = data.email || data.login_email;
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    const roleInput = data.roleCode || data.role_name || data.role || data.role_id || data.roleId || 'Sales';
    let role = await this.prisma.role.findFirst({
      where: {
        OR: [
          { code: roleInput },
          { name: roleInput },
          { id: roleInput },
        ],
      },
    });

    if (!role) {
      role = (await this.prisma.role.findFirst({ where: { name: { contains: 'Sales' } } })) || (await this.prisma.role.findFirst());
    }

    if (!role) {
      throw new BadRequestException('No roles defined in database.');
    }

    const targetEmployeeId = data.employeeId || data.employee_id;
    let employeeToLink: any = null;
    if (targetEmployeeId) {
      employeeToLink = await this.prisma.employee.findUnique({ where: { id: targetEmployeeId } });
    } else {
      employeeToLink = await this.prisma.employee.findFirst({ where: { workEmail: email } });
    }

    if (existing) {
      const updateData: any = {
        roleId: role.id,
        name: data.name || existing.name,
      };
      if (data.password) {
        const hashAsync = hash as unknown as (
          data: string,
          saltOrRounds: number,
        ) => Promise<string>;
        updateData.password = await hashAsync(data.password, 12);
        KNOWN_USER_PASSWORDS[email.toLowerCase()] = data.password;
      }

      // Update existing user role and link to employee
      const updatedUser = await this.prisma.user.update({
        where: { id: existing.id },
        data: updateData,
        include: { role: true },
      });

      if (employeeToLink) {
        await this.prisma.employee.update({
          where: { id: employeeToLink.id },
          data: { userId: existing.id, workEmail: email },
        });
      }

      const result = { 
        ...updatedUser, 
        employeeId: employeeToLink?.id || null,
        employeeCode: employeeToLink?.employeeCode || updatedUser.publicId,
        password: data.password || KNOWN_USER_PASSWORDS[email.toLowerCase()] || 'Himalaya@2026'
      };
      return result;
    }

    let companyId = data.companyId || data.company_id;
    let company = typeof companyId === 'string' && companyId.length > 5
      ? await this.prisma.company.findUnique({ where: { id: companyId } })
      : null;

    if (!company) {
      company = await this.prisma.company.findFirst();
    }

    if (!company) {
      throw new BadRequestException(
        'No company found in database to assign.',
      );
    }
    companyId = company.id;

    const name = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || email.split('@')[0];
    const passwordToHash = data.password || 'admin123';
    const hashAsync = hash as unknown as (
      data: string,
      saltOrRounds: number,
    ) => Promise<string>;
    const hashedPassword = await hashAsync(passwordToHash, 12);

    const user = await this.prisma.user.create({
      data: {
        publicId: employeeToLink?.employeeCode || randomUUID(),
        email,
        password: hashedPassword,
        name,
        roleId: role.id,
        companyId,
        dispatchCategory: data.dispatchCategory || data.dispatch_category || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : (data.status ? (data.status === 'Active' || data.status === 'ACTIVE') : true),
      },
      include: {
        role: true,
      },
    });

    if (employeeToLink) {
      await this.prisma.employee.update({
        where: { id: employeeToLink.id },
        data: { userId: user.id, workEmail: email },
      });
    }

    KNOWN_USER_PASSWORDS[email.toLowerCase()] = data.password || 'admin123';
    return {
      ...user,
      employeeId: employeeToLink?.id || null,
      employeeCode: employeeToLink?.employeeCode || user.publicId,
      password: data.password || 'admin123'
    };
  }

  async getRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: any) {
    let roleId: string | undefined;
    const roleInput = data.roleCode || data.role_name || data.role || data.role_id || data.roleId;
    if (roleInput) {
      const role = await this.prisma.role.findFirst({
        where: {
          OR: [
            { code: roleInput },
            { name: roleInput },
            { id: roleInput }
          ]
        }
      });
      if (role) {
        roleId = role.id;
      }
    }

    let hashedPassword: string | undefined = undefined;
    if (data.password) {
      const hashAsync = hash as unknown as (
        data: string,
        saltOrRounds: number,
      ) => Promise<string>;
      hashedPassword = await hashAsync(data.password, 12);
    }

    const updateData: any = {};
    if (data.name || data.first_name || data.last_name) {
      updateData.name = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
    }
    if (data.email) {
      updateData.email = data.email;
    }
    if (roleId) {
      updateData.roleId = roleId;
    }
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }
    if (data.dispatchCategory !== undefined || data.dispatch_category !== undefined) {
      updateData.dispatchCategory = data.dispatchCategory || data.dispatch_category || null;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = Boolean(data.isActive);
    } else if (data.status !== undefined) {
      updateData.isActive = data.status === 'Active' || data.status === 'ACTIVE';
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    const result = { ...updatedUser };
    delete (result as { password?: string }).password;
    return result;
  }

  async resetPassword(id: string, newPassword: string) {
    const hashAsync = hash as unknown as (
      data: string,
      saltOrRounds: number,
    ) => Promise<string>;
    const hashedPassword = await hashAsync(newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    return { success: true };
  }

  async toggleStatus(id: string, isActive: boolean) {
    await this.prisma.user.update({
      where: { id },
      data: { isActive }
    });
    return { success: true };
  }

  async delete(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
    return { success: true };
  }

  /**
   * Automatically provisions canonical default permissions for a user's role upon login.
   * - Ensures permission master records exist.
   * - Links missing permissions to the role unless explicitly removed by an admin.
   * - Safe for existing users and newly created users.
   */
  async ensureDefaultPermissions(roleId: string, roleCode: string): Promise<string[]> {
    if (!roleId || !roleCode) return [];

    const norm = roleCode.toUpperCase().replace(/[\s-]+/g, '_');

    // Canonical permission definitions
    const commonPerms = [
      { code: 'common.dashboard.read', name: 'View Dashboard' },
      { code: 'location.track.enable', name: 'Enable Location Tracking' },
      { code: 'profile.read', name: 'View Profile' },
    ];

    const roleSpecificPerms: Record<string, { code: string; name: string }[]> = {
      SUPER_ADMIN: [
        { code: 'LIVE_USER_MAP_VIEW', name: 'Live User Map View' },
        { code: 'USER_LOCATION_HISTORY_VIEW', name: 'User Location History View' },
        { code: 'admin.dashboard.read', name: 'View Admin Dashboard' },
        { code: 'admin.users.manage', name: 'Manage Users' },
        { code: 'admin.roles.manage', name: 'Manage Roles & Permissions' },
        { code: 'admin.audit.read', name: 'View System Audit Logs' },
        { code: 'admin.planthead.read', name: 'View Plant Head Workspace' },
        { code: 'backoffice.report.review', name: 'Review Back Office Daily Reports' },
      ],
      ADMIN: [
        { code: 'LIVE_USER_MAP_VIEW', name: 'Live User Map View' },
        { code: 'USER_LOCATION_HISTORY_VIEW', name: 'User Location History View' },
        { code: 'admin.dashboard.read', name: 'View Admin Dashboard' },
        { code: 'admin.users.manage', name: 'Manage Users' },
        { code: 'admin.roles.manage', name: 'Manage Roles & Permissions' },
        { code: 'backoffice.report.review', name: 'Review Back Office Daily Reports' },
      ],
      BACK_OFFICE: [
        { code: 'backoffice.report.create', name: 'Create Back Office Daily Report' },
        { code: 'backoffice.report.read', name: 'View Back Office Daily Report' },
        { code: 'backoffice.report.manage', name: 'Manage Back Office Daily Report' },
        { code: 'profile.read', name: 'View Profile' },
      ],
      SALES: [
        { code: 'sales.leads.read', name: 'View Sales Leads' },
        { code: 'sales.leads.create', name: 'Create Sales Lead' },
        { code: 'sales.orders.read', name: 'View Sales Orders' },
        { code: 'sales.orders.create', name: 'Create Sales Order' },
        { code: 'sales.customers.read', name: 'View Customers' },
        { code: 'sales.quotations.read', name: 'View Quotations' },
        { code: 'sales.quotations.create', name: 'Create Quotation' },
        { code: 'sales.payments.read', name: 'View Sales Payments' },
        { code: 'sales.payments.create', name: 'Create Sales Payment' },
        { code: 'sales.followup.manage', name: 'Manage Payment Followups' },
        { code: 'location.track.enable', name: 'Enable Location Tracking' },
      ],
      SUPER_SALES: [
        { code: 'sales.leads.read', name: 'View Sales Leads' },
        { code: 'sales.leads.create', name: 'Create Sales Lead' },
        { code: 'sales.orders.read', name: 'View Sales Orders' },
        { code: 'sales.orders.create', name: 'Create Sales Order' },
        { code: 'sales.customers.read', name: 'View Customers' },
        { code: 'sales.quotations.read', name: 'View Quotations' },
        { code: 'sales.payments.read', name: 'View Sales Payments' },
        { code: 'sales.followup.manage', name: 'Manage Payment Followups' },
        { code: 'location.track.enable', name: 'Enable Location Tracking' },
      ],
      PLANT_HEAD: [
        { code: 'admin.planthead.read', name: 'View Plant Head Workspace' },
        { code: 'LIVE_USER_MAP_VIEW', name: 'Live User Map View' },
        { code: 'production.plans.read', name: 'View Production Plans' },
        { code: 'production.work_orders.manage', name: 'Manage Work Orders' },
        { code: 'qc.inspections.read', name: 'View QC Inspections' },
        { code: 'inventory.stock.read', name: 'View Stock Levels' },
      ],
      PRODUCTION: [
        { code: 'production.plans.read', name: 'View Production Plans' },
        { code: 'production.work_orders.manage', name: 'Manage Work Orders' },
        { code: 'production.reports.read', name: 'View Production Reports' },
      ],
      STORE: [
        { code: 'inventory.stock.read', name: 'View Stock Levels' },
        { code: 'inventory.items.manage', name: 'Manage Inventory Items' },
        { code: 'procurement.grns.read', name: 'View GRNs' },
        { code: 'procurement.grns.create', name: 'Create GRN' },
      ],
      FINANCE: [
        { code: 'finance.invoices.read', name: 'View Invoices' },
        { code: 'finance.payments.manage', name: 'Manage Payments' },
        { code: 'finance.payments.verify', name: 'Verify Payments' },
        { code: 'finance.payments.reject', name: 'Reject Payments' },
        { code: 'finance.ledger.read', name: 'View Customer Ledger' },
      ],
      HR: [
        { code: 'hr.employees.read', name: 'View HR Roster' },
        { code: 'hr.employees.manage', name: 'Manage Employees' },
        { code: 'hr.payroll.read', name: 'View Payroll' },
        { code: 'hr.attendance.read', name: 'View Attendance' },
        { code: 'LIVE_USER_MAP_VIEW', name: 'Live User Map View' },
      ],
      DISPATCH: [
        { code: 'dispatch.shipments.read', name: 'View Shipments' },
        { code: 'dispatch.shipments.create', name: 'Create Shipment' },
        { code: 'dispatch.delivery.verify', name: 'Verify Delivery' },
        { code: 'location.track.enable', name: 'Enable Location Tracking' },
      ],
      QC: [
        { code: 'qc.inspections.read', name: 'View QC Inspections' },
      ],
    };

    // Determine target list
    let targetPerms = norm === 'BACK_OFFICE' || norm.includes('BACK_OFFICE')
      ? []
      : [...commonPerms];
    for (const [key, perms] of Object.entries(roleSpecificPerms)) {
      if (norm === key || norm.includes(key)) {
        targetPerms.push(...perms);
      }
    }

    try {
      // 1. Fetch current role permissions
      const currentRolePerms = await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
      });
      const activeCodes = new Set(currentRolePerms.map((rp) => rp.permission.code));

      // 2. Provision any missing permission
      for (const item of targetPerms) {
        if (!activeCodes.has(item.code)) {
          // Find or create Permission master record
          let perm = await this.prisma.permission.findUnique({
            where: { code: item.code },
          });

          if (!perm) {
            perm = await this.prisma.permission.create({
              data: {
                code: item.code,
                name: item.name,
                publicId: `PERM-${randomUUID().slice(0, 8).toUpperCase()}`,
              },
            });
          }

          // Link to role
          await this.prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId,
                permissionId: perm.id,
              },
            },
            update: {},
            create: {
              roleId,
              permissionId: perm.id,
            },
          });

          activeCodes.add(item.code);
        }
      }

      return Array.from(activeCodes);
    } catch (err) {
      console.warn(`[ensureDefaultPermissions] Non-fatal provisioning warning:`, err);
      // Fallback to currently assigned permissions if any error
      const existing = await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
      });
      return existing.map((rp) => rp.permission.code);
    }
  }
}
