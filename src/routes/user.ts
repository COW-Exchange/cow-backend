import { Router } from "express";
import * as userController from "../controllers/user";
import jwtAuth from "../middleware/jwtAuth";

const router = Router();

router.post("/register/:email", userController.register);
router.post("/register/", jwtAuth, userController.createUser);

router.post("/login", userController.login);

router.get("/profile", jwtAuth, userController.getProfile);

router.put("/profile", jwtAuth, userController.updateProfile);

router.get("/validate/:token", userController.validateToken);

export default router;
