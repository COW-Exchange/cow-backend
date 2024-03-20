import { Request as ExpressRequest, Response, NextFunction } from "express";
import User, { UserDocument } from "../models/User";
import UserServices from "../services/user";
import bcrypt from "bcryptjs";
import { transporter } from "../services/email";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "KEY";
const CRYPTO_KEY = process.env.CRYPTO_KEY || "KEY";
const ALGORITHM = process.env.ALGORITHM || "ALGORITHM";

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, CRYPTO_KEY, iv);
  let encryptedText = cipher.update(text, "utf-8", "hex");
  encryptedText += cipher.final("hex");
  return { text: encryptedText, iv: iv };
}

function decipher(text: string, iv: Buffer) {
  const decipher = crypto.createDecipheriv(ALGORITHM, CRYPTO_KEY, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function hash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function generateToken(id: string, password: string) {
  return jwt.sign({ id: id, password: await hash(password) }, SECRET_KEY, {
    expiresIn: "1h",
  });
}

interface Request extends ExpressRequest {
  user?: {
    id: string;
    password: string;
  };
}

export const createUser = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let userData: null | UserDocument = null;
    try {
      const userData = (await User.find()).filter(async (user) => {
        await bcrypt.compare(req.body.email, user.id);
      })[0];
    } catch {
      () => (userData = null);
    }
    if (userData) {
      res.sendStatus(409);
    } else {
      const userInformation = new User({
        id: await hash(req.body.email),
        email: encrypt(req.body.email),
        password: await hash(req.body.password),
      });
      const newUser = await UserServices.createUserService(userInformation);
      res.sendStatus(200);
    }
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response) => {
  const token = await generateToken(req.params.email, "");
  const mailOptions = {
    to: req.params.email,
    subject: "CowExchange registration",
    html: `<p>Please use the following <a href="http://cowexchange.se/register?${encodeURIComponent(
      token
    )}">link</a> to verify your email. The link expires in 1 hour.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.status(200).send("E-mail sent.");
    }
  });
};

export const validateToken = async (req: Request, res: Response) => {
  const token = req.params.token;
  const secretKey = SECRET_KEY;
  try {
    const decoded = jwt.verify(token, secretKey);
    res.sendStatus(200);
  } catch (error) {
    console.error("Token verification failed:", error);
    res.sendStatus(400);
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = (await User.find()).find(async (user) => {
    await bcrypt.compare(email, user.id);
  });
  let isCorrectPassword = false;
  if (user) {
    isCorrectPassword = await bcrypt.compare(password, user.password);
  }
  if (isCorrectPassword) {
    res.send("login");
  } else {
    res.send("unauthorized");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  res.send("getProfile");
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
    return res.sendStatus(404);
  }

  res.json("user");
};
