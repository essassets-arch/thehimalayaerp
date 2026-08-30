import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachineService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj))
      return obj.map((item) => this.serializeBigInt(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeBigInt(obj[key]);
      }
      return res;
    }
    return obj;
  }

  async create(dto: CreateMachineDto) {
    const machine = await this.prisma.machine.create({
      data: {
        machineId: dto.machineId,
        machineName: dto.machineName,
        machineType: dto.machineType,
        serialNumber: dto.serialNumber,
        location: dto.location,
        isActive: true,
      },
    });
    return this.serializeBigInt(machine);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { machineId: { contains: search, mode: 'insensitive' } },
        { machineName: { contains: search, mode: 'insensitive' } },
        { machineType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.machine.count({ where }),
      this.prisma.machine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: this.serializeBigInt(items),
    };
  }

  async findOne(id: number) {
    const machine = await this.prisma.machine.findFirst({
      where: { id: BigInt(id), isActive: true },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
    return this.serializeBigInt(machine);
  }

  async update(id: number, dto: UpdateMachineDto) {
    await this.findOne(id);

    const updated = await this.prisma.machine.update({
      where: { id: BigInt(id) },
      data: {
        machineId: dto.machineId,
        machineName: dto.machineName,
        machineType: dto.machineType,
        serialNumber: dto.serialNumber,
        location: dto.location,
      },
    });
    return this.serializeBigInt(updated);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.machine.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { success: true };
  }
}
