const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found in database.');
    return;
  }

  const plantHead = await prisma.user.findFirst({
    where: { email: 'plant.head@himalayaerp.com' }
  });
  const hrUser = await prisma.user.findFirst({
    where: { email: 'hr@himalayaerp.com' }
  });

  const plantHeadId = plantHead ? plantHead.id : 'b3d0b887-9361-46d4-9d34-cd6b758b211d';
  const hrUserId = hrUser ? hrUser.id : '78fd58e8-fa59-4986-8136-09efe62deea5';

  const requestsData = [
    {
      indentNumber: 'RR-101',
      designation: 'Production Engineer',
      department: 'Production',
      vacancies: 3,
      priority: 'HIGH',
      employmentType: 'PERMANENT',
      requiredExperience: '3-5 Years',
      requiredSkills: 'FRP Moulding, Resin Mix Control, Shift Management',
      reasonForHiring: 'Plant expansion for new production line A3',
      jobDescription: 'Oversee daily FRP sheet pressing and raw resin batch mixing operations.',
      requestedById: plantHeadId,
      requestedByName: 'Plant Head',
      requestedByRole: 'PLANT_HEAD',
      status: 'OPEN',
    },
    {
      indentNumber: 'RR-102',
      designation: 'QC Inspector',
      department: 'Quality Control',
      vacancies: 2,
      priority: 'URGENT',
      employmentType: 'PERMANENT',
      requiredExperience: '2-4 Years',
      requiredSkills: 'Tensile Strength Testing, Visual Inspection, QC Reporting',
      reasonForHiring: 'Increased order volume requiring round-the-clock QC checks',
      jobDescription: 'Perform dimensional and strength checks on finished manhole covers.',
      requestedById: plantHeadId,
      requestedByName: 'Plant Head',
      requestedByRole: 'PLANT_HEAD',
      assignedHrUserId: hrUserId,
      assignedHrUserName: 'HR Executive',
      status: 'PENDING',
    },
    {
      indentNumber: 'RR-103',
      designation: 'Maintenance Technician',
      department: 'Maintenance',
      vacancies: 2,
      priority: 'MEDIUM',
      employmentType: 'PERMANENT',
      requiredExperience: '1-3 Years',
      requiredSkills: 'Hydraulic Press Repair, Electrical Wiring, Preventive Maintenance',
      reasonForHiring: 'Replacement for resigned maintenance staff',
      jobDescription: 'Execute preventive maintenance on hydraulic presses HM001-HM006.',
      requestedById: plantHeadId,
      requestedByName: 'Plant Head',
      requestedByRole: 'PLANT_HEAD',
      positionsFilled: 2,
      fulfilledAt: new Date(),
      status: 'FULFILLED',
    },
    {
      indentNumber: 'RR-104',
      designation: 'Store Executive',
      department: 'Inventory',
      vacancies: 1,
      priority: 'LOW',
      employmentType: 'PERMANENT',
      requiredExperience: '1-2 Years',
      requiredSkills: 'GRN Entry, Raw Material Stock Ledger, ERP Entry',
      reasonForHiring: 'Additional staff for raw material warehouse',
      jobDescription: 'Manage resin and glass fiber raw inventory receipts.',
      requestedById: plantHeadId,
      requestedByName: 'Plant Head',
      requestedByRole: 'PLANT_HEAD',
      status: 'OPEN',
    },
    {
      indentNumber: 'RR-105',
      designation: 'Dispatch Assistant',
      department: 'Logistics',
      vacancies: 1,
      priority: 'MEDIUM',
      employmentType: 'PERMANENT',
      requiredExperience: '1-2 Years',
      requiredSkills: 'Packing Inspection, Loading Supervision, Lorry Receipt Handling',
      reasonForHiring: 'Dispatch team capacity enhancement',
      jobDescription: 'Supervise vehicle loading and verify invoice delivery documentation.',
      requestedById: plantHeadId,
      requestedByName: 'Plant Head',
      requestedByRole: 'PLANT_HEAD',
      rejectedAt: new Date(),
      rejectionReason: 'Headcount frozen for logistics department for Q3.',
      status: 'REJECTED',
    }
  ];

  for (const r of requestsData) {
    await prisma.recruitmentRequest.upsert({
      where: { indentNumber: r.indentNumber },
      update: { ...r, companyId: company.id },
      create: { ...r, companyId: company.id },
    });
  }

  const count = await prisma.recruitmentRequest.count();
  console.log(`✅ Successfully seeded ${count} recruitment requests!`);
  await prisma.$disconnect();
}

run().catch(console.error);
