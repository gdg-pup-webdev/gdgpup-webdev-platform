import { Router } from "express";
import {
  getWallet, 
  listWallets,
} from "../controllers/walletController.js";

export const walletsRouter = Router();

walletsRouter.get("/:uid", getWallet);
 

walletsRouter.get("/", listWallets);
