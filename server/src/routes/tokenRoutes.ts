import { RequestHandler, Router } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { CreateTokenDTO, Token, TokenCore } from "../types/Token.js";
import { generateTokenCode } from "../utils/tokenUtil.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import {
    claimToken,
  createToken,
  getToken,
  listTokens,
  voidToken,
} from "../controllers/tokenController.js";
import { restrictRoute } from "../middlewares/restrictRoute.js";

export const tokenRouter = Router();

tokenRouter.post("/", restrictRoute(["admin"]), createToken);

tokenRouter.get("/:tokenId", getToken);

tokenRouter.get("/", listTokens);

tokenRouter.patch("/:tokenId/void", voidToken);

const defaulthandler: RequestHandler = async (req, res) => {
  res.status(501).json(createApiResponse(false, "Not implemented"));
};

tokenRouter.patch("/:tokenId/claim", claimToken);
