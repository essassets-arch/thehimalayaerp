-- Align user roles for non-sales personnel who were assigned Sales Executive by fallback
DO $$
DECLARE
    back_office_role_id TEXT;
    production_planner_role_id TEXT;
BEGIN
    SELECT id INTO back_office_role_id FROM "Role" WHERE code = 'BACK_OFFICE' OR name = 'Back Office' LIMIT 1;
    SELECT id INTO production_planner_role_id FROM "Role" WHERE code = 'PRODUCTION_PLANNER' OR name = 'Production Planner' LIMIT 1;

    -- Update Baman Abbas / Abbas Baman to Back Office
    IF back_office_role_id IS NOT NULL THEN
        UPDATE "User"
        SET "roleId" = back_office_role_id
        WHERE "email" ILIKE '%abbasbaman%' OR "name" ILIKE '%Baman Abbas%';
    END IF;

    -- Update Moksha Naik to Production Planner
    IF production_planner_role_id IS NOT NULL THEN
        UPDATE "User"
        SET "roleId" = production_planner_role_id
        WHERE "email" ILIKE '%riya@gmail%' OR "name" ILIKE '%moksha naik%';
    END IF;
END $$;
