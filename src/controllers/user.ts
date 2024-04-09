import { Request as ExpressRequest, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User";
import UserServices from "../services/user";
import { transporter } from "../services/email";

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

export const register = async (req: Request, res: Response) => {
  const token = await generateToken(req.params.email, "");
  const mailOptions = {
    to: req.params.email,
    subject: "CowExchange registration",
    html: `<p>Please use the following <a href="https://cowexchange.se/register?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(
      req.params.email
    )}">link</a> to verify your email. The link expires in 1 hour.</p>
    <p>Or copy the link address from below:</p>
    <p>
    https://cowexchange.se/register?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(req.params.email)}</p>
    <p>Please disregard this e-mail if it was not requested by you.</p>`,
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.log(error);
    } else {
      res.status(200).send("E-mail sent.");
    }
  });
};
export const validateEmailToken = async (req: Request, res: Response) => {
  const token = req.params.token;
  const email = req.params.email;
  const secretKey = SECRET_KEY;
  try {
    const decoded: { id: string } = jwt.verify(token, secretKey) as {
      id: string;
    };
    if (decoded.id === email) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    return res.sendStatus(401);
  }
};
export const createUser = async (req: ExpressRequest, res: Response) => {
  let userData = null;
  try {
    const users = await User.find().select("id password");
    userData = users.find((user) =>
      bcrypt.compareSync(req.body.email, user.id)
    );
  } catch {
    () => {
      userData = null;
    };
  }
  if (!userData) {
    const userInformation = new User({
      id: await hash(req.body.email),
      email: encrypt(req.body.email),
      password: await hash(req.body.password),
    });
    const newUser = await UserServices.createUserService(userInformation);
    res.json({ message: "Password saved successfully" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = (await User.find().select("id password")).find((user) =>
    bcrypt.compareSync(email, user.id)
  );
  let isCorrectPassword = false;
  if (user) {
    isCorrectPassword = await bcrypt.compare(password, user.password);
    if (isCorrectPassword) {
      const token = await generateToken(user.id, user.password);
      res
        .cookie("AuthToken", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 3600000,
        })
        .json({ message: "authorized" });
    } else {
      res.sendStatus(400).json({ error: "unauthorized" });
    }
  } else {
    res.sendStatus(400).json({ error: "unauthorized" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  let user = null;
  if (req.user) {
    user = await UserServices.findUserById(req.user.id);
  }

  res.json({ user });
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
