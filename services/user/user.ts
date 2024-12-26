import { api, APIError } from "encore.dev/api";
import { CreateUser, User, users } from "./db/schemas";
import bcrypt from 'bcrypt';
import { db } from "./db/db";
import { eq } from "drizzle-orm";

interface CreateUserResponse {
    id: number,
    timestamp: string
}

export const createUser = api<CreateUser, CreateUserResponse>(
    { expose: false },
    async (params) => {
        const hashedPassword = await bcrypt.hash(params.password, 10);

        const [createdUser] = await db.insert(users).values({
            email: params.email,
            password: hashedPassword,
            name: params.name,
        }).returning();

        return { id: createdUser.id, timestamp: createdUser.dateCreated } as CreateUserResponse;
    }
);

export const getUser = api<{ id?: number, email?: string }, { user: User }>(
    { expose: false },
    async (p) => {

        if (p.id === undefined && p.email === undefined) {
            throw APIError.invalidArgument('Either id or email must be provided');
        }

        const userQuery = db.select().from(users);

        if (p.id !== undefined) {
            userQuery.where(eq(users.id, p.id));
        }

        if (p.email !== undefined) {
            userQuery.where(eq(users.email, p.email));
        }

        const [user] = await userQuery.limit(1);

        if (!user) {
            throw APIError.notFound(`User with id ${p.id} or email ${p.email} was not found`);
        }

        return { user };
    }
);


export const verifyCredentials = api<{ email: string, password: string }, { user: User }>(
    { expose: false },
    async ({ email, password }) => {
        const { user } = await getUser({ email });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw APIError.unauthenticated('Invalid password');
        }

        return { user };
    }
);
