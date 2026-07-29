CREATE TYPE "RecruitmentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'APPRENTICE', 'INTERN');
CREATE TYPE "RecruitmentRequestStatus" AS ENUM ('DRAFT', 'OPEN', 'RETURNED_FOR_CORRECTION', 'HR_PROCESSING', 'CANDIDATES_SOURCED', 'INTERVIEWS_SCHEDULED', 'CANDIDATES_SELECTED', 'OFFER_IN_PROGRESS', 'PARTIALLY_FULFILLED', 'FULFILLED', 'ON_HOLD', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "RecruitmentCandidateStatus" AS ENUM ('SOURCED', 'SCREENING', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'JOINED', 'NO_SHOW');
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED');
CREATE TYPE "InterviewResult" AS ENUM ('PENDING', 'SELECTED', 'REJECTED', 'NEXT_ROUND', 'ON_HOLD');

CREATE TABLE "RecruitmentRequest" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "indentNumber" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "vacancies" INTEGER NOT NULL,
  "priority" "RecruitmentPriority" NOT NULL,
  "employmentType" "EmploymentType",
  "requiredExperience" TEXT,
  "requiredSkills" TEXT,
  "reasonForHiring" TEXT NOT NULL,
  "jobDescription" TEXT,
  "requiredByDate" TIMESTAMP(3),
  "requestedById" TEXT NOT NULL,
  "requestedByName" TEXT NOT NULL,
  "requestedByRole" TEXT NOT NULL,
  "assignedHrUserId" TEXT,
  "assignedHrUserName" TEXT,
  "positionsFilled" INTEGER NOT NULL DEFAULT 0,
  "status" "RecruitmentRequestStatus" NOT NULL DEFAULT 'OPEN',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processingStartedAt" TIMESTAMP(3),
  "fulfilledAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "withdrawnAt" TIMESTAMP(3),
  "hrRemarks" TEXT,
  "rejectionReason" TEXT,
  "correctionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "RecruitmentRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecruitmentCandidate" (
  "id" TEXT NOT NULL,
  "candidateNumber" TEXT NOT NULL,
  "recruitmentRequestId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "experience" TEXT,
  "currentCompany" TEXT,
  "expectedSalary" DECIMAL(14,2),
  "resumeUrl" TEXT,
  "source" TEXT,
  "status" "RecruitmentCandidateStatus" NOT NULL DEFAULT 'SOURCED',
  "remarks" TEXT,
  "selectedAt" TIMESTAMP(3),
  "joiningDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecruitmentCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecruitmentInterview" (
  "id" TEXT NOT NULL,
  "recruitmentRequestId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "interviewDate" TIMESTAMP(3) NOT NULL,
  "interviewMode" TEXT NOT NULL,
  "interviewLocation" TEXT,
  "meetingLink" TEXT,
  "interviewRound" TEXT,
  "panelMembers" JSONB,
  "instructions" TEXT,
  "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
  "feedback" TEXT,
  "rating" INTEGER,
  "result" "InterviewResult",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecruitmentInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecruitmentRequestTimeline" (
  "id" TEXT NOT NULL,
  "recruitmentRequestId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "fromStatus" "RecruitmentRequestStatus",
  "toStatus" "RecruitmentRequestStatus",
  "performedById" TEXT NOT NULL,
  "performedByName" TEXT NOT NULL,
  "performedByRole" TEXT NOT NULL,
  "remarks" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecruitmentRequestTimeline_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecruitmentRequest_indentNumber_key" ON "RecruitmentRequest"("indentNumber");
CREATE INDEX "RecruitmentRequest_companyId_status_idx" ON "RecruitmentRequest"("companyId", "status");
CREATE INDEX "RecruitmentRequest_department_idx" ON "RecruitmentRequest"("department");
CREATE INDEX "RecruitmentRequest_requestedById_idx" ON "RecruitmentRequest"("requestedById");
CREATE INDEX "RecruitmentRequest_assignedHrUserId_idx" ON "RecruitmentRequest"("assignedHrUserId");
CREATE INDEX "RecruitmentRequest_createdAt_idx" ON "RecruitmentRequest"("createdAt");
CREATE UNIQUE INDEX "RecruitmentCandidate_candidateNumber_key" ON "RecruitmentCandidate"("candidateNumber");
CREATE INDEX "RecruitmentCandidate_recruitmentRequestId_idx" ON "RecruitmentCandidate"("recruitmentRequestId");
CREATE INDEX "RecruitmentCandidate_status_idx" ON "RecruitmentCandidate"("status");
CREATE INDEX "RecruitmentInterview_recruitmentRequestId_idx" ON "RecruitmentInterview"("recruitmentRequestId");
CREATE INDEX "RecruitmentInterview_candidateId_idx" ON "RecruitmentInterview"("candidateId");
CREATE INDEX "RecruitmentInterview_interviewDate_idx" ON "RecruitmentInterview"("interviewDate");
CREATE INDEX "RecruitmentRequestTimeline_recruitmentRequestId_idx" ON "RecruitmentRequestTimeline"("recruitmentRequestId");
CREATE INDEX "RecruitmentRequestTimeline_createdAt_idx" ON "RecruitmentRequestTimeline"("createdAt");

ALTER TABLE "RecruitmentRequest" ADD CONSTRAINT "RecruitmentRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecruitmentCandidate" ADD CONSTRAINT "RecruitmentCandidate_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecruitmentInterview" ADD CONSTRAINT "RecruitmentInterview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecruitmentRequestTimeline" ADD CONSTRAINT "RecruitmentRequestTimeline_recruitmentRequestId_fkey" FOREIGN KEY ("recruitmentRequestId") REFERENCES "RecruitmentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
