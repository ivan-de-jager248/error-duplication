import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: 'services/organization/db/schemas.ts',
    dialect: "postgresql",
    out: 'services/organization/db/migrations/drizzle',
    dbCredentials: {
        url: "postgresql://leave-system-yumi:local@127.0.0.1:9500/organization?sslmode=disable"
    }
})