import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as schema from './schemas';
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const OrgDB = new SQLDatabase('organization', {
    migrations: "./migrations"
});

export const db: PostgresJsDatabase<typeof schema> = drizzle(postgres(OrgDB.connectionString), { schema });