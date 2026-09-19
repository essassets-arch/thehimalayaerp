-- Isolate Dispatch 1 and Dispatch 2 Notifications
-- 1. Remove any Dispatch 1 / Factory / WorkOrder notifications assigned to Dispatch 2 users
DELETE FROM "Notification"
WHERE "userId" IN (
  SELECT u.id FROM "User" u
  LEFT JOIN "Role" r ON u."roleId" = r.id
  WHERE r.code = 'DISPATCH_2'
     OR u.email ILIKE '%sahad%'
     OR u."dispatchCategory" = 'D2'
)
AND (
  ("route" LIKE '/dispatch%' AND "route" NOT LIKE '/dispatch-2%')
  OR "type" LIKE '%DISPATCH_1%'
  OR "entityType" = 'WorkOrder'
  OR "title" ILIKE '%Dispatch 1%'
  OR "title" ILIKE '%Factory%'
  OR "message" ILIKE '%Dispatch 1%'
  OR "message" ILIKE '%Factory%'
);

-- 2. Remove any Dispatch 2 notifications assigned to Dispatch 1 users
DELETE FROM "Notification"
WHERE "userId" IN (
  SELECT u.id FROM "User" u
  LEFT JOIN "Role" r ON u."roleId" = r.id
  WHERE r.code IN ('DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH')
     OR u.email ILIKE '%ravikant%'
     OR u."dispatchCategory" = 'D1'
)
AND (
  "route" LIKE '/dispatch-2%'
  OR "type" LIKE '%DISPATCH_2%'
  OR "title" ILIKE '%Dispatch 2%'
  OR "title" ILIKE '%Sahad%'
  OR "message" ILIKE '%Dispatch 2%'
  OR "message" ILIKE '%Sahad%'
);
