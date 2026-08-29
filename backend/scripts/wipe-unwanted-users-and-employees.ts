import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== WIPING UNWANTED USERS & EMPLOYEES (PRESERVING HR & SUPERADMIN) ===');

  const preservedEmails = [
    'super.admin@himalayaerp.com'
  ];

  const preservedUsers = await prisma.user.findMany({
    where: { email: { in: preservedEmails } },
    include: { employee: true }
  });

  const preservedUserIds = preservedUsers.map(u => u.id);
  const preservedEmployeeIds = preservedUsers.map(u => u.employee?.id).filter(Boolean) as string[];

  console.log(`Preserving ${preservedUsers.length} Users:`, preservedUsers.map(u => `${u.email} (${u.id})`));
  console.log(`Preserving ${preservedEmployeeIds.length} Employees:`, preservedEmployeeIds);

  const mainAdminUser = preservedUsers.find(u => u.email === 'super.admin@himalayaerp.com') || preservedUsers[0];
  if (!mainAdminUser) {
    throw new Error('Super Admin user not found! Aborting wipe.');
  }

  // 1. Reassign or delete foreign key records pointing to other users
  console.log('\n1. Cleaning/Reassigning User FK dependencies...');

  // Unlink or reassign user references across all ERP modules
  await prisma.purchaseIndent.updateMany({
    where: { requestedById: { notIn: preservedUserIds } },
    data: { requestedById: mainAdminUser.id }
  });
  await prisma.purchaseOrder.updateMany({
    where: { issuedById: { notIn: preservedUserIds } },
    data: { issuedById: mainAdminUser.id }
  });
  await prisma.purchaseOrder.updateMany({
    where: { orderedById: { notIn: preservedUserIds } },
    data: { orderedById: mainAdminUser.id }
  });
  await prisma.purchaseOrder.updateMany({
    where: { superAdminApprovedById: { notIn: preservedUserIds } },
    data: { superAdminApprovedById: null }
  });
  await prisma.purchaseOrder.updateMany({
    where: { superAdminRejectedById: { notIn: preservedUserIds } },
    data: { superAdminRejectedById: null }
  });
  await prisma.customerComplaint.updateMany({
    where: { salesExecutiveId: { notIn: preservedUserIds } },
    data: { salesExecutiveId: null }
  });
  await prisma.leadActivity.deleteMany({
    where: { createdById: { notIn: preservedUserIds } }
  });
  await prisma.followUp.deleteMany({
    where: { createdById: { notIn: preservedUserIds } }
  });
  await prisma.brandAnalysisHistory.deleteMany({
    where: { performedById: { notIn: preservedUserIds } }
  });
  await prisma.brandAnalysisRequest.updateMany({
    where: { requestedById: { notIn: preservedUserIds } },
    data: { requestedById: mainAdminUser.id }
  });
  await prisma.brandAnalysisRequest.updateMany({
    where: { approvedById: { notIn: preservedUserIds } },
    data: { approvedById: null }
  });
  await prisma.brandAnalysisRequest.updateMany({
    where: { rejectedById: { notIn: preservedUserIds } },
    data: { rejectedById: null }
  });
  await prisma.brandAnalysisRequest.updateMany({
    where: { financeStartedById: { notIn: preservedUserIds } },
    data: { financeStartedById: null }
  });
  await prisma.brandAnalysisRequest.updateMany({
    where: { financeCompletedById: { notIn: preservedUserIds } },
    data: { financeCompletedById: null }
  });
  await prisma.salesOrder.updateMany({
    where: { createdById: { notIn: preservedUserIds } },
    data: { createdById: mainAdminUser.id }
  });
  await prisma.lead.updateMany({
    where: { createdById: { notIn: preservedUserIds } },
    data: { createdById: mainAdminUser.id }
  });
  await prisma.lead.updateMany({
    where: { salesExecutiveId: { notIn: preservedUserIds } },
    data: { salesExecutiveId: null }
  });
  await prisma.quotation.updateMany({
    where: { createdById: { notIn: preservedUserIds } },
    data: { createdById: mainAdminUser.id }
  });
  await prisma.quotation.updateMany({
    where: { salesExecutiveId: { notIn: preservedUserIds } },
    data: { salesExecutiveId: null }
  });
  await prisma.salesOrder.updateMany({
    where: { salesExecutiveId: { notIn: preservedUserIds } },
    data: { salesExecutiveId: null }
  });
  await prisma.sampleRequest.updateMany({
    where: { salesExecutiveId: { notIn: preservedUserIds } },
    data: { salesExecutiveId: null }
  });
  await prisma.salesTarget.deleteMany({
    where: { salespersonId: { notIn: preservedUserIds } }
  });

  // Reassign / delete daily reports created by other users
  await prisma.productionDailyReport.updateMany({
    where: { createdById: { notIn: preservedUserIds } },
    data: { createdById: mainAdminUser.id, approvedById: null }
  });
  await prisma.dispatchDailyReport.updateMany({
    where: { createdById: { notIn: preservedUserIds } },
    data: { createdById: mainAdminUser.id }
  });
  await prisma.materialRequest.updateMany({
    where: { requestedById: { notIn: preservedUserIds } },
    data: { requestedById: mainAdminUser.id }
  });
  await prisma.productionPlan.updateMany({
    where: { assignedToId: { notIn: preservedUserIds } },
    data: { assignedToId: null }
  });
  await prisma.machineDailyStatus.updateMany({
    where: { updatedById: { notIn: preservedUserIds } },
    data: { updatedById: null }
  });

  // Delete sessions, attendances, locations, tokens for deleted users
  await prisma.refreshSession.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.elevationSession.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.fcmDeviceToken.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.notification.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.backOfficeDailyReport.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.userLocationHistory.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.latestUserLocation.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.deviceSession.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });
  await prisma.attendance.deleteMany({
    where: { userId: { notIn: preservedUserIds } }
  });

  // 2. Clean Employee FK dependencies
  console.log('\n2. Cleaning Employee FK dependencies...');
  await prisma.salaryPayment.deleteMany({
    where: { payrollRecord: { employeeId: { notIn: preservedEmployeeIds } } }
  });
  await prisma.salarySlip.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.employeeSalaryStructure.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.employeeMonthlyAttendanceSummary.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.payrollRecord.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.employeeDocument.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.leaveApproval.deleteMany({
    where: { leaveRequest: { employeeId: { notIn: preservedEmployeeIds } } }
  });
  await prisma.leaveRequest.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.manualAttendanceRequest.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.expense.deleteMany({
    where: { employeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.employeeDraft.deleteMany({
    where: { completedEmployeeId: { notIn: preservedEmployeeIds } }
  });
  await prisma.employee.updateMany({
    where: { reportingManagerId: { notIn: preservedEmployeeIds } },
    data: { reportingManagerId: null }
  });

  // 3. Delete non-preserved Employees
  const deletedEmployees = await prisma.employee.deleteMany({
    where: { id: { notIn: preservedEmployeeIds } }
  });
  console.log(`✅ Deleted ${deletedEmployees.count} legacy Employees.`);

  // 4. Delete non-preserved Users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { notIn: preservedUserIds } }
  });
  console.log(`✅ Deleted ${deletedUsers.count} legacy Users.`);

  // 5. Clean up unused legacy roles (leave SUPER_ADMIN and HR)
  console.log('\n3. Cleaning up unused legacy roles...');
  const preservedRoleCodes = ['SUPER_ADMIN', 'HR'];
  const unusedRoles = await prisma.role.findMany({
    where: {
      code: { notIn: preservedRoleCodes },
      users: { none: {} }
    }
  });

  for (const role of unusedRoles) {
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.role.delete({ where: { id: role.id } });
    console.log(`- Removed unused role: ${role.name} (${role.code})`);
  }

  // 6. Grant full permissions to SUPER_ADMIN and HR roles
  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
  const hrRole = await prisma.role.findFirst({ where: { code: 'HR' } });

  if (superAdminRole) {
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
        create: { roleId: superAdminRole.id, permissionId: perm.id },
        update: {}
      });
    }
    console.log(`✅ Verified ${allPermissions.length} permissions mapped to Super Admin role.`);
  }

  if (hrRole) {
    const hrPerms = allPermissions.filter(p => p.code.startsWith('hr.') || p.code.startsWith('employee.') || p.code.startsWith('user.') || p.code.startsWith('role.') || p.code.startsWith('attendance.'));
    for (const perm of hrPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: hrRole.id, permissionId: perm.id } },
        create: { roleId: hrRole.id, permissionId: perm.id },
        update: {}
      });
    }
    console.log(`✅ Verified ${hrPerms.length} HR permissions mapped to HR role.`);
  }

  // Final verification check
  const finalUsers = await prisma.user.findMany({ include: { role: true, employee: true } });
  const finalEmployees = await prisma.employee.findMany({ include: { department: true } });
  const finalRoles = await prisma.role.findMany();

  console.log(`\n=== FINAL DATABASE STATE ===`);
  console.log(`Users (${finalUsers.length}):`);
  finalUsers.forEach(u => console.log(`- ${u.email} | Role: ${u.role?.name} | Employee: ${u.employee?.fullName}`));
  console.log(`\nEmployees (${finalEmployees.length}):`);
  finalEmployees.forEach(e => console.log(`- ${e.employeeCode} | ${e.fullName} | Dept: ${e.department?.name}`));
  console.log(`\nRoles (${finalRoles.length}):`);
  finalRoles.forEach(r => console.log(`- ${r.name} (${r.code})`));
}

main()
  .catch(e => {
    console.error('Error during wipe script:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
