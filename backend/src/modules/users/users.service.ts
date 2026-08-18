import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';

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
    return this.prisma.user.findMany({
      include: {
        role: true,
      },
    });
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
      // Update existing user role and link to employee
      const updatedUser = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          roleId: role.id,
          name: data.name || existing.name,
        },
        include: { role: true },
      });

      if (employeeToLink) {
        await this.prisma.employee.update({
          where: { id: employeeToLink.id },
          data: { userId: existing.id },
        });
      }

      const result = { ...updatedUser, employeeId: employeeToLink?.id || null };
      delete (result as { password?: string }).password;
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
        publicId: randomUUID(),
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
        data: { userId: user.id },
      });
    }

    if (employeeToLink) {
      await this.prisma.employee.update({
        where: { id: employeeToLink.id },
        data: { userId: user.id },
      });
    }

    const result = { ...user, employeeId: employeeToLink?.id || null };
    delete (result as { password?: string }).password;
    return result;
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
}
