import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SaveMachineStatusDto } from './dto/save-machine-status.dto';
import { MachineStatus } from './dto/save-machine-status.dto';

@Injectable()
export class MachineStatusService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.serializeBigInt(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.serializeBigInt(obj[key]);
      }
      return res;
    }
    return obj;
  }

  // Safe ISO Date string parsing that represents the date accurately
  private parseDateOnly(dateStr: string): Date {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
    }
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  async getDailyStatus(dateStr: string) {
    const workDate = this.parseDateOnly(dateStr);

    // 1. Get all active machines
    const machines = await this.prisma.machine.findMany({
      where: { isActive: true },
      orderBy: { machineId: 'asc' },
    });

    // 2. Get status entries for this specific date
    const statuses = await this.prisma.machineDailyStatus.findMany({
      where: { workDate },
    });

    // 3. Map statuses by machine ID
    const statusMap = new Map<string, any>();
    for (const s of statuses) {
      statusMap.set(s.machineId.toString(), s);
    }

    // 4. Merge machines with statuses
    const merged = machines.map((machine) => {
      const statusEntry = statusMap.get(machine.id.toString());
      return {
        id: machine.id,
        machineId: machine.machineId,
        machineName: machine.machineName,
        machineType: machine.machineType,
        location: machine.location,
        serialNumber: machine.serialNumber,
        status: statusEntry ? statusEntry.status : null,
        remarks: statusEntry ? statusEntry.remarks : null,
        updatedAt: statusEntry ? statusEntry.updatedAt : null,
      };
    });

    return this.serializeBigInt(merged);
  }

  async saveDailyStatus(dto: SaveMachineStatusDto, userId: string) {
    const workDate = this.parseDateOnly(dto.workDate);

    let validUserId: string | null = null;
    if (userId) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (dbUser) {
        validUserId = userId;
      }
    }

    // Execute bulk upsert in a Prisma Transaction
    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.machines) {
        // Enforce active machine verification
        const machine = await tx.machine.findUnique({
          where: { id: BigInt(item.machineId) },
        });

        if (!machine || !machine.isActive) {
          throw new BadRequestException(`Machine ID ${item.machineId} is invalid or inactive`);
        }

        await tx.machineDailyStatus.upsert({
          where: {
            machineId_workDate: {
              machineId: BigInt(item.machineId),
              workDate,
            },
          },
          update: {
            status: item.status as any, // Cast to Prisma enum type
            remarks: item.remarks || null,
            updatedById: validUserId,
          },
          create: {
            machineId: BigInt(item.machineId),
            workDate,
            status: item.status as any, // Cast to Prisma enum type
            remarks: item.remarks || null,
            updatedById: validUserId,
          },
        });
      }
    });

    return { success: true };
  }
}
