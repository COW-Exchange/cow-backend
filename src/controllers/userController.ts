import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "KEY";

export const register = async (req: Request, res: Response) => {
 
};

export const login = async (req: Request, res: Response) => {
  
};

export const getProfile = async (req: Request, res: Response) => {
  
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

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
