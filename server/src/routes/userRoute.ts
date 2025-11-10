import { Router } from "express";
import {
  getUser,
  getUserCustomClaims,
  nullifyUserCustomClaims,
} from "../controllers/userController.js";
import { ensureUserExists } from "../middlewares/verifyToken.js";
import { restrictRoute } from "../middlewares/restrictRoute.js";

export const userRouter = Router();


userRouter.get("/:uid", getUser)

userRouter.get("/:uid/custom-claims", getUserCustomClaims);

userRouter.delete(
  "/:uid/custom-claims",
  restrictRoute(["admin"]),
  nullifyUserCustomClaims
);
