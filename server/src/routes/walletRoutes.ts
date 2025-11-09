import { Router } from "express";
import {
  getWallet,
  incrementWalletPoints,
  listWallets,
} from "../controllers/walletController.js";

export const walletsRouter = Router();

walletsRouter.get("/:uid", getWallet);

walletsRouter.patch("/:uid/increment", incrementWalletPoints);

walletsRouter.get("/", listWallets);
