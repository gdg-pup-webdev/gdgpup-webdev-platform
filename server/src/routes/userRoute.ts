import { Router } from "express";
import {
  getUserCustomClaims,
  nullifyUserCustomClaims,
} from "../controllers/userController.js";
import { ensureUserExists } from "../middlewares/verifyToken.js";
import { restrictRoute } from "../middlewares/restrictRoute.js";

export const userRouter = Router();

userRouter.use(ensureUserExists);
 
userRouter.get("/:uid/custom-claims", getUserCustomClaims);
 
userRouter.patch(
  "/:uid/null-custom-claims",
  restrictRoute(["admin"]),
  nullifyUserCustomClaims
);
