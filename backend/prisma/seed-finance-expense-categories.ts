import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const INITIAL_EXPENSE_CATEGORIES = [
  { srNo: 1, name: 'SALARY', header: 'ALL STAFF SALARY' },
  { srNo: 2, name: 'LABOUR SALARY', header: 'ALL LABOUR SALARY' },
  { srNo: 3, name: 'PROVIDENT FUND', header: 'PROVIDENT FUND' },
  { srNo: 4, name: 'E.S.I.C', header: 'E.S.I.C' },
  { srNo: 5, name: 'BONUS', header: 'BONUS ALL' },
  { srNo: 6, name: 'SALES INCENTIVE', header: 'SALES INCENTIVE ALL STAFF & OUT' },
  { srNo: 7, name: 'STAFF WELFARE', header: 'TEA MILK & TRANSPORT & FUNCTION ETC' },
  { srNo: 8, name: 'LABOUR WELFARE', header: 'LABOUR CANTEEN & MEDICAL & TRANSPORT' },
  { srNo: 9, name: 'PETROL EXPS', header: 'ALL STAFF PETROL' },
  { srNo: 10, name: 'TRAVELLING EXPS', header: 'ALL STAFF AND MD SIR' },
  { srNo: 11, name: 'REPAIR & MAINTANANCE (FRP)', header: null },
  { srNo: 12, name: 'REPAIR & MAINTANANCE (CB)', header: null },
  { srNo: 13, name: 'REPAIR & MAINTANANCE (OFFICE)', header: null },
  { srNo: 14, name: 'TRANSPORTATION SAMPLE', header: null },
  { srNo: 15, name: 'TRANSPORTATION REPLACEMENT', header: null },
  { srNo: 16, name: 'ELECTRICITY EXPS', header: null },
  { srNo: 17, name: 'MARKETING & BUSINESS PROMOTION', header: null },
  { srNo: 18, name: 'PROFESSNAL FEES', header: null },
  { srNo: 19, name: 'MISC EXPS', header: null },
  { srNo: 20, name: 'DONATION', header: 'NAZRUL MAKAM & ZABIHAT' },
  { srNo: 21, name: 'PACKING EXPS (FRP)', header: null },
  { srNo: 22, name: 'PACKING EXPS (CB)', header: null },
  { srNo: 23, name: 'OFFICE EXPS', header: 'COMPUTER AND ALL OFFICE' },
];

export async function seedFinanceExpenseCategories() {
  console.log('--- Seeding Finance Expense Categories & Headers ---');
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies to seed categories for.`);

  let totalCategoriesCreated = 0;
  let totalHeadersCreated = 0;

  for (const company of companies) {
    for (const item of INITIAL_EXPENSE_CATEGORIES) {
      let category = await prisma.financeExpenseCategory.findUnique({
        where: {
          companyId_name: {
            companyId: company.id,
            name: item.name,
          },
        },
      });

      if (!category) {
        category = await prisma.financeExpenseCategory.create({
          data: {
            companyId: company.id,
            name: item.name,
            isActive: true,
          },
        });
        totalCategoriesCreated++;
      }

      if (item.header) {
        const existingHeader = await prisma.financeExpenseHeader.findUnique({
          where: {
            categoryId_name: {
              categoryId: category.id,
              name: item.header,
            },
          },
        });

        if (!existingHeader) {
          await prisma.financeExpenseHeader.create({
            data: {
              categoryId: category.id,
              name: item.header,
              isActive: true,
            },
          });
          totalHeadersCreated++;
        }
      }
    }
  }

  console.log(`✅ Seeding Complete: ${totalCategoriesCreated} categories created, ${totalHeadersCreated} headers created.`);
}

if (require.main === module) {
  seedFinanceExpenseCategories()
    .catch((err) => {
      console.error('Error seeding categories:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
