-- Local-development safeguard: retains every legacy complaint row before the
-- CustomerComplaint schema is replaced by the complaint-management workflow.
CREATE TABLE "CustomerComplaint_legacy_backup" AS TABLE "CustomerComplaint";
