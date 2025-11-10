import { Router } from "express";
import {
  getStatsOfUser,
  listAllUsersStats,
  listAllUsersStreaks,
  listAllUsersWallets,
} from "../controllers/statsController.js";

export const statRouter = Router();

/**
 * List stats of all user
 */
statRouter.get("/", listAllUsersStats);

/**
 * List wallets of all users
 */
statRouter.get("/all/wallets", listAllUsersWallets);

/**
 * List streak of all users
 */
statRouter.get("/all/streaks", listAllUsersStreaks);

/**
 * Get stats of a user
 * GET /api/stats/:uid
 */
statRouter.get("/:uid", getStatsOfUser);
