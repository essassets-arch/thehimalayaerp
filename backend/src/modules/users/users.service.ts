import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
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

  async create(data: {
    email: string;
    password?: string;
    name: string;
    roleCode: string;
    companyId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new BadRequestException('User with this email already exists.');
    }

    const role = await this.prisma.role.findUnique({
      where: { code: data.roleCode },
    });
    if (!role) {
      throw new BadRequestException('Invalid role code.');
    }

    let companyId = data.companyId;
    if (!companyId) {
      const company = await this.prisma.company.findFirst();
      if (!company) {
        throw new BadRequestException(
          'No company found in database to assign.',
        );
      }
      companyId = company.id;
    }

    const passwordToHash = data.password || 'admin123';
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);

    const user = await this.prisma.user.create({
      data: {
        publicId: randomUUID(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: role.id,
        companyId: companyId,
      },
    });

    const { password, ...result } = user;
    return result;
  }
}
