import { Router } from "express";
import { auth } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import {
  getUserCustomClaims,
  nullifyUserCustomClaims,
} from "../controllers/authController.js";

export const authRouter = Router();

authRouter.get("/custom-claims", getUserCustomClaims);

authRouter.get("/null-custom-claims", nullifyUserCustomClaims);
