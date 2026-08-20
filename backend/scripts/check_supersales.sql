SELECT r.name, p.code
FROM "Role" r
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r.name = 'SuperSales' AND p.code = 'sales.leads.update';
