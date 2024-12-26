import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: 'services/leave/db/schemas.ts',
    dialect: "postgresql",
    out: 'services/leave/db/migrations/drizzle',
    dbCredentials: {
        url: "postgresql://leave-system-yumi:local@127.0.0.1:9500/leave?sslmode=disable"
    }
})