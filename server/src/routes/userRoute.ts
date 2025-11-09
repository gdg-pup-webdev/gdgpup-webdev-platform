import { Router } from "express";
import {
  getUserCustomClaims,
  nullifyUserCustomClaims,
} from "../controllers/userController.js";
import { ensureUserExists } from "../middlewares/verifyToken.js";
import { restrictRoute } from "../middlewares/restrictRoute.js";

export const userRouter = Router();

// route middlewares
userRouter.use(ensureUserExists);

/**
 * GET /api/users/{uid}/custom-claims
 * Get user’s custom-claims
 * Must be authenticated and accessing own claims, except for admins
 */
userRouter.get("/custom-claims/:uid", getUserCustomClaims);

userRouter.delete(
  "/custom-claims/:uid/",
  restrictRoute(["admin"]),
  nullifyUserCustomClaims
);
