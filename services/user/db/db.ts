import { SQLDatabase } from "encore.dev/storage/sqldb";
import * as schema from './schemas';
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const UserDB = new SQLDatabase('user', {
    migrations: "./migrations"
});

export const db: PostgresJsDatabase<typeof schema> = drizzle(postgres(UserDB.connectionString), { schema });