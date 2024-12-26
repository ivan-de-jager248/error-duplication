import { api } from "encore.dev/api";
import { user as userService } from "~encore/clients";
import jwt from 'jsonwebtoken';
import { secret } from "encore.dev/config";


export const register = api<RegisterParams, RegisterResponse>(
    {method: 'POST', path: '/auth/register', expose: true, auth: false},
    async (params) => {
        const user = await userService.createUser(params);
        const token = generateJWT(user.id.toString());
        return { token };
    }
)

export const login = api<{email: string, password: string}, LoginResponse>(
    {method:'POST', path:'/auth/login', expose: true, auth: false},
    async (params) => {
        const { user } = await userService.verifyCredentials({email: params.email, password: params.password});
        const token = generateJWT(user.id.toString());
        return { token }
    }
)

function generateJWT(userId: string): string {
    return jwt.sign({ userId }, secretKey(), { expiresIn: '1h' });
}

const secretKey = secret("SecretKey");

interface RegisterParams {
    name: string
    email: string
    password: string
}

interface RegisterResponse {
    token: string
}

interface LoginResponse {
    token: string
}