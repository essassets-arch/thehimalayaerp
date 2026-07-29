INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT
  gen_random_uuid(),
  role."id",
  permission."id",
  CURRENT_TIMESTAMP
FROM "Role" AS role
CROSS JOIN "Permission" AS permission
WHERE role."code" IN ('FINANCE_EXECUTIVE', 'FINANCE_MANAGER')
  AND permission."code" IN (
    'finance.payment.read',
    'finance.payment.update',
    'sales.customers.read'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "RolePermission" AS existing
    WHERE existing."roleId" = role."id"
      AND existing."permissionId" = permission."id"
  );
