import { APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import jwt from 'jsonwebtoken';
import { user } from "~encore/clients";
import { User } from "../user/db/schemas";
import log from "encore.dev/log";

// AuthParams specifies the incoming request information
// the auth handler is interested in. In this case it only
// cares about requests that contain the `Authorization` header.
interface AuthParams {
    authorization: Header<'Authorization'>;
}

// The AuthData specifies the information about the authenticated user
// that the auth handler makes available.
interface AuthData {
    user: User;
    userID: string;
}

export const auth = authHandler<AuthParams, AuthData>(
    async (params) => {
        // TODO: Look up information about the user based on the authorization header.
        try {
            const token = params.authorization.split(' ')[1];
            const decoded = jwt.verify(token, secretKey()) as { userId: string };

            // Get the user information
            const response = await user.getUser({ id: parseInt(decoded.userId) });

            return { user: response.user, userID: decoded.userId };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw APIError.unauthenticated('Token expired', error as Error);
            }

            throw APIError.unauthenticated('Authentication failed', error as Error);
        }
    }
);

const secretKey = secret("SecretKey");

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
    authHandler: auth
});

