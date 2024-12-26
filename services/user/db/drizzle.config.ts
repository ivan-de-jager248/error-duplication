import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: 'services/user/db/schemas.ts',
    dialect: "postgresql",
    out: 'services/user/db/migrations/drizzle',
    dbCredentials: {
        url: "postgresql://leave-system-yumi:local@127.0.0.1:9500/user?sslmode=disable"
    }
})