import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { createOrg } from "./organization";
import { db } from "./db/db";
import { organizations } from "./db/schemas";
import { user } from "~encore/clients";

const mockOwnerRole = { id: 1, name: "owner" };
const mockUser = { id: 1, email: `test${Math.floor(Math.random() * 1000)}@example.com`, password: "password", name: "Test User", role: mockOwnerRole.id };


describe("Organization Service", () => {
    beforeAll(async () => {
        // Clean up the database before running tests
        await db.delete(organizations);
        
        // Insert a mock User
        await user.createUser(mockUser)
    });
    
    beforeEach(async () => {
        // Clean up the database before each test
        await db.delete(organizations);
        
        // Mock getAuthData to return mockUser
        vi.mock("~encore/auth", () => ({
            getAuthData: () => ({ user: mockUser })
        }))
    });

    describe("createOrg", () => {
        test("should create an organization", async () => {
            const result = await createOrg({ name: "Test Organization" });
            expect(!!result.org).toEqual(true);
        });
    });
});