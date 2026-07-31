const fs = require('fs');

const appendText = `
enum TargetPeriod {
  Monthly
  Quarterly
  Yearly
}

enum SalesTargetStatus {
  ACTIVE
  CANCELLED
  COMPLETED
}

model SalesTarget {
  id             String   @id @default(cuid())
  salespersonId  String
  salesperson    User     @relation(fields: [salespersonId], references: [id])

  targetPeriod   TargetPeriod

  startDate      DateTime
  endDate        DateTime

  revenueTarget  Decimal @db.Decimal(15,2)

  remarks        String?

  status         SalesTargetStatus @default(ACTIVE)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
`;

fs.appendFileSync('d:\\prototype-next-main\\backend\\prisma\\schema.prisma', appendText);
console.log('Appended successfully');
