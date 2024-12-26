-- Custom SQL migration file, put you code below! --

CREATE OR REPLACE FUNCTION enforce_unique_owner_role() RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role_id = (SELECT id FROM role WHERE name = 'owner')) THEN
        IF EXISTS (
            SELECT 1
            FROM organization_membership
            WHERE organization_id = NEW.organization_id
              AND role_id = NEW.role_id
              AND user_id <> NEW.user_id
        ) THEN
            RAISE EXCEPTION 'An organization can have only one owner';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that calls the function before insert or update
CREATE TRIGGER enforce_unique_owner_role_trigger
BEFORE INSERT OR UPDATE ON organization_membership
FOR EACH ROW EXECUTE FUNCTION enforce_unique_owner_role();
