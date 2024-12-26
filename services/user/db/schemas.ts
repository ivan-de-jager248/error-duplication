import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('user', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: text('password_hash').notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    dateCreated: timestamp('date_created', { mode: 'string' }).defaultNow(),
});

export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    dateCreated: string | null;
};

export interface CreateUser {
    email: string;
    password: string;
    name: string;
}

export interface UpdateUser {
    id: number;
    name: string;
}