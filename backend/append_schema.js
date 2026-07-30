const fs = require('fs');

const appendContent = `
enum BrandAnalysisRequestStatus {
  DRAFT
  PENDING_SUPER_ADMIN_APPROVAL
  SUPER_ADMIN_APPROVED
  SUPER_ADMIN_REJECTED
  FINANCE_ANALYSIS_IN_PROGRESS
  FINANCE_ANALYSIS_COMPLETED
  CANCELLED
}

enum BrandAnalysisRecommendation {
  RECOMMENDED
  NOT_RECOMMENDED
  FURTHER_REVIEW_REQUIRED
}

model BrandAnalysisRequest {
  id                    String                      @id @default(uuid())
  requestNo             String                      @unique
  productName           String
  brandName             String
  quantity              Decimal                     @db.Decimal(18, 3)
  quantityUnit          String
  imageUrl              String
  imageOriginalName     String?
  reason                String
  orderDetails          String?
  requiredByDate        DateTime?
  remarks               String?

  status                BrandAnalysisRequestStatus  @default(PENDING_SUPER_ADMIN_APPROVAL)
  version               Int                         @default(1)

  requestedById         String
  requestedBy           User                        @relation("BrandAnalysisRequestedBy", fields: [requestedById], references: [id])

  approvedById          String?
  approvedBy            User?                       @relation("BrandAnalysisApprovedBy", fields: [approvedById], references: [id])
  approvedAt            DateTime?
  approvalRemarks       String?

  rejectedById          String?
  rejectedBy            User?                       @relation("BrandAnalysisRejectedBy", fields: [rejectedById], references: [id])
  rejectedAt            DateTime?
  rejectionReason       String?

  financeStartedById    String?
  financeStartedBy      User?                       @relation("BrandAnalysisFinanceStartedBy", fields: [financeStartedById], references: [id])
  financeStartedAt      DateTime?
  financeInitialRemarks String?

  financeCompletedById  String?
  financeCompletedBy    User?                       @relation("BrandAnalysisFinanceCompletedBy", fields: [financeCompletedById], references: [id])
  financeCompletedAt    DateTime?

  analysisResult        String?
  recommendedBrand      String?
  estimatedUnitCost     Decimal?                    @db.Decimal(18, 2)
  estimatedTotalCost    Decimal?                    @db.Decimal(18, 2)
  supplierName          String?
  financeRemarks        String?
  analysisDocumentUrl   String?
  recommendation        BrandAnalysisRecommendation?

  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt

  history               BrandAnalysisHistory[]

  @@index([status])
  @@index([requestedById])
  @@index([createdAt])
  @@map("brand_analysis_requests")
}

model BrandAnalysisHistory {
  id               String                     @id @default(uuid())
  requestId        String
  request          BrandAnalysisRequest       @relation(fields: [requestId], references: [id], onDelete: Cascade)

  fromStatus       BrandAnalysisRequestStatus?
  toStatus         BrandAnalysisRequestStatus
  action           String
  remarks          String?

  performedById    String
  performedBy      User                       @relation("BrandAnalysisHistoryPerformedBy", fields: [performedById], references: [id])

  createdAt        DateTime                   @default(now())

  @@index([requestId])
  @@index([performedById])
  @@map("brand_analysis_history")
}
`;

fs.appendFileSync('prisma/schema.prisma', appendContent);
console.log('Appended to schema.prisma successfully');
