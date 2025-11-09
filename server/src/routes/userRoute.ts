import { Router } from "express";
import {
  getUser,
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
userRouter.get("/:uid", getUser)

userRouter.get("/:uid/custom-claims", getUserCustomClaims);

userRouter.delete(
  "/:uid/custom-claims",
  restrictRoute(["admin"]),
  nullifyUserCustomClaims
);
