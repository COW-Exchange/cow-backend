import { Request as ExpressRequest, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface Request extends ExpressRequest {
  user?: {
    id: string;
  };
}

const SECRET_KEY = process.env.JWT_SECRET || "KEY";

export default (req: Request, res: Response, next: NextFunction) => {
  function getCookieAuth(req: Request) {
    const cookie = req.headers.cookie;
    const cookieArray = cookie?.split("; ");
    const authElement = cookieArray?.find((item) => {
      return item.includes("AuthToken=");
    });
    const token = authElement?.split("AuthToken=")[1];
    return token;
  }
  const token = req.header("Authentication") || getCookieAuth(req);
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, SECRET_KEY) as { id: string };

    if (verified.id) {
      req.user = verified;
      next();
    } else {
      res.status(401).send("Invalid Token Payload");
    }
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
