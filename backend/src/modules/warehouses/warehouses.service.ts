import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        companyId,
        name: dto.name,
        location: dto.location,
        branchId: dto.branchId,
      },
    });
  }

  async findAll(companyId: string, search?: string) {
    const where: any = { companyId };
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.warehouse.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { companyId, id },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(companyId: string, id: string, dto: UpdateWarehouseDto) {
    await this.findOne(companyId, id);
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }
}
