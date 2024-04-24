import { Router } from "express";
import * as userController from "../controllers/user";
import jwtAuth from "../middleware/jwtAuth";

const router = Router();

router.post("/register/:email", userController.register);
router.post("/register/", jwtAuth, userController.createUser);

router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get("/profile", jwtAuth, userController.getProfile);

router.put("/profile", jwtAuth, userController.updateProfile);
router.put("/settings", jwtAuth, userController.updateSettings);

router.get("/validate/:token/:email", userController.validateEmailToken);

export default router;
