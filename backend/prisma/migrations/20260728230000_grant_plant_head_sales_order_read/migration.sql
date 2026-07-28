INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT
  gen_random_uuid(),
  role."id",
  permission."id",
  CURRENT_TIMESTAMP
FROM "Role" AS role
CROSS JOIN "Permission" AS permission
WHERE role."code" = 'PLANT_HEAD'
  AND permission."code" = 'sales.orders.read'
  AND NOT EXISTS (
    SELECT 1
    FROM "RolePermission" AS existing
    WHERE existing."roleId" = role."id"
      AND existing."permissionId" = permission."id"
  );
