import { Router } from "express";
import { createApiResponse } from "../utils/apiRespones.js";
import { Wallet } from "../types/Wallet.js";
import { auth, db } from "../lib/firebase.js";
import { isUserExists } from "../utils/firebaseUtils.js";
import { Journal, JournalEntry } from "../types/Journal.js";
import { randomUUID } from "crypto";
import {
  getWallet,
  getWalletHistoryEntry,
  incrementWalletPoints,
  listWalletHistory,
  listWallets,
} from "../controllers/walletController.js";

export const walletsRouter = Router();

walletsRouter.get("/:uid", getWallet);

walletsRouter.patch("/:uid/increment", incrementWalletPoints);

walletsRouter.get("/", listWallets);

walletsRouter.get("/:uid/history", listWalletHistory);

walletsRouter.get("/:uid/history/:entryId", getWalletHistoryEntry);
