import { Router } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { CreateTokenDTO, Token, TokenCore } from "../types/Token.js";
import { generateTokenCode } from "../utils/tokenUtil.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { createToken } from "../controllers/tokenRouter.js";

export const tokenRouter = Router();

tokenRouter.post("/", createToken);
