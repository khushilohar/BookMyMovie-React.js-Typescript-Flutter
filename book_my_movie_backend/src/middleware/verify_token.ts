import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis";

interface JwtPayload {
    userId: number;
    email: string;
    iat: number;
    exp: number;
}

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // Check if token is in blacklist
        const blacklisted = await redisClient.get(`blacklist:${token}`);
        if (blacklisted) {
            return res.status(401).json({ 
                message: "Token has been invalidated. Please sign in again." 
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY as string
        ) as JwtPayload;

        (req as any).userId = decoded.userId;
        (req as any).userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};