import express from "express";
const router = express.Router();
import authController from "../controllers/auth.js";

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

export default router;