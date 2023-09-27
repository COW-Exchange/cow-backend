import { Request as ExpressRequest, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import {
  generateResetToken,
  setResetTokenForUser,
  resetUserPassword,
} from "../utils/passwordResetUtils";


const SECRET_KEY = process.env.JWT_SECRET || "KEY";

interface Request extends ExpressRequest {
  user?: {
    id: string;
  };
}

export const register = async (req: Request, res: Response) => {
  // ...
};

export const login = async (req: Request, res: Response) => {
  // ...
};

export const getProfile = async (req: Request, res: Response) => {
  // ...
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user.id;
  const { email, password } = req.body;

  let updates: any = {};
  if (email) updates.email = email;

  if (password) {
    updates.password = await bcrypt.hash(password, 12);
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  }).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const resetToken = await generateResetToken();
  const success = await setResetTokenForUser(email, resetToken);

  if (!success) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "Reset link has been sent to the email." });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  const success = await resetUserPassword(resetToken, newPassword);

  if (!success) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  res.status(200).json({ message: "Password has been reset successfully." });
};

