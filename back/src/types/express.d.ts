import { AuthController } from "src/auth/auth.controller";

declare module 'express'
{
    interface Request{
        user?:{sub: number, email: string};
        refreshToken?: string;
        userId?: number;
    }
}