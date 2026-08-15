import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPunches() {
    return this.prisma.attendancePunch.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async createPunch(data: any) {
    return this.prisma.attendancePunch.create({
      data: {
        empId: data.empId,
        empName: data.empName,
        type: data.type,
        time: data.time,
        date: data.date,
        location: data.location || null,
        coords: data.coords || null,
        selfieUrl: data.selfieUrl || null,
        isRealPunch: data.isRealPunch !== undefined ? data.isRealPunch : true,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });
  }

  async getAllShiftPolicies() {
    const policies = await this.prisma.shiftPolicy.findMany();
    if (policies.length === 0) {
      const defaults = [
        { deptName: 'HR', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Sales', checkIn: '09:30 AM', checkOut: '06:30 PM', grace: 30 },
        { deptName: 'Production', checkIn: '08:00 AM', checkOut: '05:00 PM', grace: 10 },
        { deptName: 'Finance', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 },
        { deptName: 'Default', checkIn: '09:00 AM', checkOut: '06:00 PM', grace: 15 }
      ];
      for (const d of defaults) {
        await this.prisma.shiftPolicy.create({ data: d });
      }
      return this.prisma.shiftPolicy.findMany();
    }
    return policies;
  }

  async saveShiftPolicy(deptName: string, data: any) {
    return this.prisma.shiftPolicy.upsert({
      where: { deptName },
      update: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        grace: data.grace,
      },
      create: {
        deptName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        grace: data.grace,
      },
    });
  }
}
