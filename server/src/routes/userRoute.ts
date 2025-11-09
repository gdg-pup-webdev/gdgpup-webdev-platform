import { Router } from "express";
import {
  getUserCustomClaims,
  nullifyUserCustomClaims,
} from "../controllers/userController.js";
import { ensureUserExists } from "../middlewares/verifyToken.js";
import { restrictRoute } from "../middlewares/restrictRoute.js";

export const userRouter = Router();

userRouter.use(ensureUserExists);

/**
 * @route GET /api/users/:uid/custom-claims
 * @description Get user custom claims
 * @access Own Data EXCEPT ADMIN
 */
userRouter.get("/:uid/custom-claims", getUserCustomClaims);

/**
 * @route PATCH /api/users/:uid/null-custom-claims
 * @description Nullify user custom claims
 * @access ADMIN
 */
userRouter.get(
  "/:uid/null-custom-claims",
  restrictRoute(["admin"]),
  nullifyUserCustomClaims
);
