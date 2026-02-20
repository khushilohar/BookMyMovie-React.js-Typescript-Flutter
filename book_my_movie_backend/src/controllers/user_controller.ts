import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redisClient from "../config/redis";
import transporter from "../config/mailer";

const generateAndSendOtp = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:${email}`;
    await redisClient.setEx(redisKey, 300, otp); // 5 minutes
    await transporter.sendMail({
        to: email,
        subject: "Verify Your Account",
        html: `<h3>Your verification OTP is: <strong>${otp}</strong></h3><p>This OTP expires in 5 minutes.</p>`
    });
    return otp;
};

export const signUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        
        const [existing]: any = await pool.execute(
            "SELECT id FROM user_tb WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(
            `INSERT INTO user_tb (name, email, password_hash, is_verified, is_active) 
             VALUES (?, ?, ?, FALSE, FALSE)`,
            [name, email, hashedPassword]
        );
        await generateAndSendOtp(email);
        res.status(201).json({ 
            message: "User registered successfully. OTP sent to email for verification." 
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const redisKey = `otp:${email}`;
        const savedOtp = await redisClient.get(redisKey);

        if (!savedOtp || savedOtp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await redisClient.del(redisKey);
        await pool.execute(
            "UPDATE user_tb SET is_verified = TRUE, is_active = FALSE WHERE email = ?",
            [email]
        );

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "OTP verification failed" });
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const [users]: any = await pool.execute(
            "SELECT id FROM user_tb WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        await generateAndSendOtp(email);
        res.json({ message: "New OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Failed to resend OTP" });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { email, password, rememberMe } = req.body;
    try {
        const [users]: any = await pool.execute(
            "SELECT * FROM user_tb WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const user = users[0];
        if (!user.is_verified) {
            return res.status(403).json({ 
                message: "Please verify your email first. Check your inbox for OTP." 
            });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const expiresIn = rememberMe ? "7d" : "1d";
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.SECRET_KEY!,
            { expiresIn }
        );
        await pool.execute(
            "UPDATE user_tb SET is_verified = TRUE, is_active = TRUE WHERE email = ?",
            [email]
        );
        res.json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    try {
        const [users]: any = await pool.execute(
            "SELECT id, name, email, is_verified, is_active FROM user_tb WHERE id = ?",
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const [user]: any = await pool.execute(
          "SELECT id, name, email, is_verified FROM user_tb WHERE id = ? and is_active = 1",
          [userId]
        );
        if (user.length === 0) {
          return res.status(404).json({ message: "Active user not found, Sign in again" });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const [users]: any = await pool.execute(
            "SELECT id FROM user_tb WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000); 
        await pool.execute(
            `UPDATE user_tb 
             SET reset_password_token = ?, reset_password_expires = ?
             WHERE email = ?`,
            [token, expires, email]
        );
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await transporter.sendMail({
            to: email,
            subject: "Reset Your Password",
            html: `
                <h3>Password Reset Request</h3>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });
        res.json({ message: "Reset password email sent" });
    } catch (error) {
        res.status(500).json({ message: "Failed to process forgot password request" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result]: any = await pool.execute(
            `UPDATE user_tb
             SET password_hash = ?, 
                 reset_password_token = NULL, 
                 reset_password_expires = NULL
             WHERE reset_password_token = ? AND reset_password_expires > NOW()`,
            [hashedPassword, token]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to reset password" });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    try {
        const [users]: any = await pool.execute(
            "SELECT password_hash FROM user_tb WHERE id = ?",
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            "UPDATE user_tb SET password_hash = ? WHERE id = ?",
            [hashedPassword, userId]
        );
        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to change password" });
    }
};

export const signOut = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const [user]: any = await pool.execute(
      "SELECT id FROM user_tb WHERE id = ?",
      [userId]
    );
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const [users]: any = await pool.execute(
      "UPDATE user_tb SET is_active = 0 WHERE id = ?",
      [userId]
    );
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (token) {
      await redisClient.setEx(`blacklist:${token}`, 1800, "blacklisted"); // 30 minutes
    }
    res.status(200).json({
        message: "User signed out successfully",
        user: users[0]
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to sign out user" });
  }
};