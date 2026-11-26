-- ==============================================================================
-- HIMALAYA ERP — SAFE CREDENTIALS & PASSWORD SYNC SCRIPT
-- ZERO DATA LOSS: No tables dropped, no data deleted, existing records preserved
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  comp_id TEXT;
  r_super_admin TEXT;
  r_hr TEXT;
  r_back_office TEXT;
  r_super_sales TEXT;
  r_sales_exec TEXT;
  r_fin_mgr TEXT;
  r_fin_exec TEXT;
  r_disp_exec TEXT;
  r_disp_2 TEXT;
  r_plant_head TEXT;
  r_prod_plan TEXT;
  r_store_mgr TEXT;
BEGIN
  -- 1. Identify existing company
  SELECT id INTO comp_id FROM "Company" LIMIT 1;
  IF comp_id IS NULL THEN
    comp_id := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  END IF;

  -- 2. Identify role IDs
  SELECT id INTO r_super_admin FROM "Role" WHERE code = 'SUPER_ADMIN' LIMIT 1;
  SELECT id INTO r_hr FROM "Role" WHERE code = 'HR' LIMIT 1;
  SELECT id INTO r_back_office FROM "Role" WHERE code = 'BACK_OFFICE' LIMIT 1;
  SELECT id INTO r_super_sales FROM "Role" WHERE code = 'SUPER_SALES' LIMIT 1;
  SELECT id INTO r_sales_exec FROM "Role" WHERE code = 'SALES_EXECUTIVE' LIMIT 1;
  SELECT id INTO r_fin_mgr FROM "Role" WHERE code = 'FINANCE_MANAGER' LIMIT 1;
  SELECT id INTO r_fin_exec FROM "Role" WHERE code = 'FINANCE_EXECUTIVE' LIMIT 1;
  SELECT id INTO r_disp_exec FROM "Role" WHERE code = 'DISPATCH_EXECUTIVE' LIMIT 1;
  SELECT id INTO r_disp_2 FROM "Role" WHERE code = 'DISPATCH_2' LIMIT 1;
  SELECT id INTO r_plant_head FROM "Role" WHERE code = 'PLANT_HEAD' LIMIT 1;
  SELECT id INTO r_prod_plan FROM "Role" WHERE code = 'PRODUCTION_PLANNER' LIMIT 1;
  SELECT id INTO r_store_mgr FROM "Role" WHERE code = 'STORE_MANAGER' LIMIT 1;

  -- Fallbacks if any role was missing
  IF r_sales_exec IS NULL THEN
    SELECT id INTO r_sales_exec FROM "Role" LIMIT 1;
  END IF;

  -- 1. Super Admin (super.admin@himalayaerp.com -> SuperAdmin&67*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1000', 'super.admin@himalayaerp.com', crypt('SuperAdmin&67*', gen_salt('bf', 12)), 'Super Admin', COALESCE(r_super_admin, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('SuperAdmin&67*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_super_admin, "User"."roleId");

  -- 2. HR Manager (hr@himalayaerp.com -> HRManager*46#)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1002', 'hr@himalayaerp.com', crypt('HRManager*46#', gen_salt('bf', 12)), 'HR Manager', COALESCE(r_hr, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('HRManager*46#', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_hr, "User"."roleId");

  -- 3. Abbas B (abbas.b@himalayaerp.com -> Abbas@94$)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1003', 'abbas.b@himalayaerp.com', crypt('Abbas@94$', gen_salt('bf', 12)), 'Abbas B', COALESCE(r_back_office, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Abbas@94$', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_back_office, "User"."roleId");

  -- 4. Back Office (shared) (backoffice@himalayaerp.com -> BackOffice*44*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1004', 'backoffice@himalayaerp.com', crypt('BackOffice*44*', gen_salt('bf', 12)), 'Back Office (shared)', COALESCE(r_back_office, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('BackOffice*44*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_back_office, "User"."roleId");

  -- 5. SuperSales 1 (supersales1@himalayaerp.com -> SuperSales1&9#)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1005', 'supersales1@himalayaerp.com', crypt('SuperSales1&9#', gen_salt('bf', 12)), 'SuperSales 1', COALESCE(r_super_sales, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('SuperSales1&9#', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_super_sales, "User"."roleId");

  -- 6. SuperSales 2 (supersales2@himalayaerp.com -> SuperSales2*6*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1006', 'supersales2@himalayaerp.com', crypt('SuperSales2*6*', gen_salt('bf', 12)), 'SuperSales 2', COALESCE(r_super_sales, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('SuperSales2*6*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_super_sales, "User"."roleId");

  -- 7. Sales 1 (sales1@himalayaerp.com -> Sales1@2!)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1007', 'sales1@himalayaerp.com', crypt('Sales1@2!', gen_salt('bf', 12)), 'Sales 1', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales1@2!', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 8. Sales 2 (sales2@himalayaerp.com -> Sales2&7&)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1008', 'sales2@himalayaerp.com', crypt('Sales2&7&', gen_salt('bf', 12)), 'Sales 2', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales2&7&', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 9. Sales 3 (sales3@himalayaerp.com -> Sales3#2*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1009', 'sales3@himalayaerp.com', crypt('Sales3#2*', gen_salt('bf', 12)), 'Sales 3', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales3#2*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 10. Sales 4 (sales4@himalayaerp.com -> Sales4*4#)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1010', 'sales4@himalayaerp.com', crypt('Sales4*4#', gen_salt('bf', 12)), 'Sales 4', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales4*4#', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 11. Sales 5 (sales5@himalayaerp.com -> Sales5#4*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1011', 'sales5@himalayaerp.com', crypt('Sales5#4*', gen_salt('bf', 12)), 'Sales 5', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales5#4*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 12. Sales 6 (sales6@himalayaerp.com -> Sales6&6*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1012', 'sales6@himalayaerp.com', crypt('Sales6&6*', gen_salt('bf', 12)), 'Sales 6', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales6&6*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 13. Sales 7 (sales7@himalayaerp.com -> Sales7!9@)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1013', 'sales7@himalayaerp.com', crypt('Sales7!9@', gen_salt('bf', 12)), 'Sales 7', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales7!9@', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 14. Sales 11 (sales11@himalayaerp.com -> Sales11#$)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1014', 'sales11@himalayaerp.com', crypt('Sales11#$', gen_salt('bf', 12)), 'Sales 11', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales11#$', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 15. Jyoti (Sales 12) (sales12@himalayaerp.com -> Jyoti*97@)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1015', 'sales12@himalayaerp.com', crypt('Jyoti*97@', gen_salt('bf', 12)), 'Jyoti (Sales 12)', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Jyoti*97@', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 16. Sales 13 (sales13@himalayaerp.com -> Sales13!$)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1016', 'sales13@himalayaerp.com', crypt('Sales13!$', gen_salt('bf', 12)), 'Sales 13', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales13!$', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 17. Sales 14 (sales14@himalayaerp.com -> Sales14!&)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1017', 'sales14@himalayaerp.com', crypt('Sales14!&', gen_salt('bf', 12)), 'Sales 14', r_sales_exec, comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sales14!&', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_sales_exec, "User"."roleId");

  -- 18. Sahad M (Finance Manager) (sahad.m@himalayaerp.com -> SahadM&35!)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1018', 'sahad.m@himalayaerp.com', crypt('SahadM&35!', gen_salt('bf', 12)), 'Sahad M', COALESCE(r_fin_mgr, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('SahadM&35!', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_fin_mgr, "User"."roleId");

  -- 19. Trushna G (Finance Executive) (trushna.g@himalayaerp.com -> Trushna$62#)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1019', 'trushna.g@himalayaerp.com', crypt('Trushna$62#', gen_salt('bf', 12)), 'Trushna G', COALESCE(r_fin_exec, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Trushna$62#', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_fin_exec, "User"."roleId");

  -- 20. Ravikant T (Dispatch 1 / Cat 1) (ravikant.t@himalayaerp.com -> Ravikant*36$)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "dispatchCategory", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1020', 'ravikant.t@himalayaerp.com', crypt('Ravikant*36$', gen_salt('bf', 12)), 'Ravikant T', COALESCE(r_disp_exec, r_sales_exec), comp_id, 'Category 1', true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Ravikant*36$', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_disp_exec, "User"."roleId"),
    "dispatchCategory" = 'Category 1';

  -- 21. Sahad Dispatch (Dispatch 2 / Cat 2) (sahad.dispatch@himalayaerp.com -> SahadDisp!85#)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "dispatchCategory", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1021', 'sahad.dispatch@himalayaerp.com', crypt('SahadDisp!85#', gen_salt('bf', 12)), 'Sahad Dispatch', COALESCE(r_disp_2, r_sales_exec), comp_id, 'Category 2', true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('SahadDisp!85#', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_disp_2, "User"."roleId"),
    "dispatchCategory" = 'Category 2';

  -- 22. Sana R (Plant Head) (sana.r@himalayaerp.com -> Sana*52*)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1022', 'sana.r@himalayaerp.com', crypt('Sana*52*', gen_salt('bf', 12)), 'Sana R', COALESCE(r_plant_head, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Sana*52*', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_plant_head, "User"."roleId");

  -- 23. Moksha N (Production Planner) (moksha.n@himalayaerp.com -> Moksha!96&)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1023', 'moksha.n@himalayaerp.com', crypt('Moksha!96&', gen_salt('bf', 12)), 'Moksha N', COALESCE(r_prod_plan, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Moksha!96&', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_prod_plan, "User"."roleId");

  -- 24. Hussain T (Production / R&D) (hussain.t@himalayaerp.com -> Hussain$38!)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1024', 'hussain.t@himalayaerp.com', crypt('Hussain$38!', gen_salt('bf', 12)), 'Hussain T', COALESCE(r_prod_plan, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Hussain$38!', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_prod_plan, "User"."roleId");

  -- 25. Makhdum (Store Manager) (makhdum@himalayaerp.com -> Makhdum$85$)
  INSERT INTO "User" ("id", "publicId", "email", "password", "name", "roleId", "companyId", "isActive", "failedLoginAttempts", "updatedAt")
  VALUES (gen_random_uuid()::text, 'EMP-1025', 'makhdum@himalayaerp.com', crypt('Makhdum$85$', gen_salt('bf', 12)), 'Makhdum', COALESCE(r_store_mgr, r_sales_exec), comp_id, true, 0, NOW())
  ON CONFLICT ("email") DO UPDATE SET
    "password" = crypt('Makhdum$85$', gen_salt('bf', 12)),
    "isActive" = true,
    "failedLoginAttempts" = 0,
    "lockedUntil" = NULL,
    "roleId" = COALESCE(r_store_mgr, "User"."roleId");

  -- Also update legacy alternate emails if present
  UPDATE "User" SET "password" = crypt('SuperAdmin&67*', gen_salt('bf', 12)), "isActive" = true, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE "email" ILIKE 'superadmin@himalayaerp.com';
  UPDATE "User" SET "password" = crypt('Abbas@94$', gen_salt('bf', 12)), "isActive" = true, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE "email" ILIKE 'abbas@himalayaerp.com';
  UPDATE "User" SET "password" = crypt('Sana*52*', gen_salt('bf', 12)), "isActive" = true, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE "email" ILIKE 'plant.head@himalayaerp.com' OR "email" ILIKE 'planthead@himalayaerp.com';
  UPDATE "User" SET "password" = crypt('Makhdum$85$', gen_salt('bf', 12)), "isActive" = true, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE "email" ILIKE 'store@himalayaerp.com';

  -- Final sanitization: unlock all accounts, ensure active, remove leading/trailing spaces
  UPDATE "User" SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "isActive" = true, "email" = LOWER(TRIM("email"));

  -- Synchronize default BackupConfig with verified Hostinger SMTP credentials
  INSERT INTO "BackupConfig" (
    "id", "key", "isEnabled", "scheduleTime", "timezone", "retentionDays", "chunkSizeMb",
    "smtpHost", "smtpPort", "smtpSecure", "smtpUser", "smtpPasswordEncrypted", "smtpFrom",
    "encryptionAlgorithm", "encryptionKeyId", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, 'default', true, '23:00', 'Asia/Kolkata', 30, 20,
    'smtp.hostinger.com', 465, true, 'himalaya@emperorsmartsolutions.com', 'Johnthedon07#',
    'Himalaya ERP Backups <himalaya@emperorsmartsolutions.com>', 'aes-256-gcm', 'himalaya-key-v1', CURRENT_TIMESTAMP
  )
  ON CONFLICT ("key") DO UPDATE SET
    "smtpHost" = EXCLUDED."smtpHost",
    "smtpPort" = EXCLUDED."smtpPort",
    "smtpSecure" = EXCLUDED."smtpSecure",
    "smtpUser" = EXCLUDED."smtpUser",
    "smtpPasswordEncrypted" = EXCLUDED."smtpPasswordEncrypted",
    "smtpFrom" = EXCLUDED."smtpFrom",
    "updatedAt" = CURRENT_TIMESTAMP;
END $$;
