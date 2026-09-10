import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  private formatSupplier(s: any, totalSpent?: number) {
    const calculatedSpent = totalSpent !== undefined
      ? totalSpent
      : (s.PurchaseOrder || []).reduce((acc: number, po: any) => {
          if (!['SUPER_ADMIN_REJECTED', 'CANCELLED', 'REJECTED'].includes(po.status)) {
            return acc + Number(po.totalAmount || 0);
          }
          return acc;
        }, 0);

    return {
      id: s.id,
      publicId: s.publicId,
      vendor_code: s.publicId,
      name: s.name,
      vendor_name: s.name,
      contact: s.contact,
      contact_person: s.contact,
      email: s.email || '',
      phone: s.phone || '',
      address: s.contact || '',
      gstin: s.gstin || '',
      payment_terms: 'Net 30',
      credit_limit: 0,
      notes: '',
      isActive: s.isActive,
      is_active: s.isActive,
      total_spent: calculatedSpent,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      PurchaseOrder: s.PurchaseOrder || [],
    };
  }

  async findAll(companyId?: string, search?: string) {
    const where: any = { isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { publicId: { contains: q, mode: 'insensitive' } },
        { gstin: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const suppliers = await this.prisma.supplier.findMany({
      where,
      include: {
        PurchaseOrder: {
          select: { totalAmount: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return suppliers.map((s) => this.formatSupplier(s));
  }

  async findOne(companyId: string | undefined, id: string) {
    const where: any = {
      OR: [{ id }, { publicId: id }],
    };
    if (companyId) {
      where.companyId = companyId;
    }

    const supplier = await this.prisma.supplier.findFirst({
      where,
      include: {
        PurchaseOrder: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            publicId: true,
            poNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!supplier) throw new NotFoundException(`Supplier not found with ID ${id}`);
    return this.formatSupplier(supplier);
  }

  async create(companyId: string, dto: any) {
    const name = (dto.vendor_name || dto.name || '').trim();
    if (!name) {
      throw new BadRequestException('Vendor name is required');
    }

    // Check if supplier with this name already exists in this company
    const existing = await this.prisma.supplier.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      // If found but inactive, reactivate and update
      const updated = await this.prisma.supplier.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          contact: dto.contact_person || dto.contact || dto.address || existing.contact,
          email: dto.email || existing.email,
          phone: dto.phone || existing.phone,
          gstin: dto.gstin || existing.gstin,
        },
      });
      return this.formatSupplier(updated);
    }

    // Generate unique code if not provided
    let publicId = (dto.vendor_code || dto.publicId || '').trim();
    if (!publicId) {
      const count = await this.prisma.supplier.count({ where: { companyId } });
      publicId = `SUP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    // Ensure publicId is unique
    let isUnique = false;
    let attempt = 0;
    while (!isUnique) {
      const dup = await this.prisma.supplier.findUnique({ where: { publicId } });
      if (!dup) {
        isUnique = true;
      } else {
        attempt++;
        publicId = `SUP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${attempt}`;
      }
    }

    const created = await this.prisma.supplier.create({
      data: {
        publicId,
        companyId,
        name,
        contact: dto.contact_person || dto.contact || dto.address || null,
        email: dto.email || null,
        phone: dto.phone || null,
        gstin: dto.gstin || null,
        isActive: dto.is_active !== false && dto.isActive !== false,
      },
    });

    return this.formatSupplier(created);
  }

  async update(companyId: string, id: string, dto: any) {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        companyId,
        OR: [{ id }, { publicId: id }],
      },
    });

    if (!supplier) throw new NotFoundException(`Supplier not found with ID ${id}`);

    const name = dto.vendor_name || dto.name;
    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(dto.contact_person !== undefined || dto.contact !== undefined || dto.address !== undefined
          ? { contact: dto.contact_person ?? dto.contact ?? dto.address }
          : {}),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.gstin !== undefined && { gstin: dto.gstin }),
        ...(dto.is_active !== undefined && { isActive: Boolean(dto.is_active) }),
        ...(dto.isActive !== undefined && { isActive: Boolean(dto.isActive) }),
      },
    });

    return this.formatSupplier(updated);
  }

  async remove(companyId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        companyId,
        OR: [{ id }, { publicId: id }],
      },
    });

    if (!supplier) throw new NotFoundException(`Supplier not found with ID ${id}`);

    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data: { isActive: false },
    });

    return { success: true, message: 'Vendor deactivated successfully', id: updated.id };
  }
}
