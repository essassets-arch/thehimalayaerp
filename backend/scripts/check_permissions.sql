SELECT r.name AS role_name, p.code AS permission_code
FROM "Role" r
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r.name LIKE '%Super%' OR r.name LIKE '%Sales%';
