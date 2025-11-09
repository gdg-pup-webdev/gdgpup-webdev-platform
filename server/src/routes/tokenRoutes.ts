import { Router } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { CreateTokenDTO, Token, TokenCore } from "../types/Token.js";
import { generateTokenCode } from "../utils/tokenUtil.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { createToken, getToken, listTokens } from "../controllers/tokenController.js";

export const tokenRouter = Router();

tokenRouter.post("/", createToken);

tokenRouter.get("/:tokenId", getToken);
 
tokenRouter.get("/", listTokens);