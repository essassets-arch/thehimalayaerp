SELECT u.id, u.email, r.name AS role_name
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email = 'supersales1@himalayaerp.com';
