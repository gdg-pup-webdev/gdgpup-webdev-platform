import { RequestHandler } from "express";
import { createNewUserStatOnDb, fetchStatFromDb, listStatsFromDb } from "../services/statService.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { fetchUserFromDb } from "../services/userService.js";

export const listAllUsersStats: RequestHandler = async (req, res) => {
  // fetch the WalletList document
  let statsList = await listStatsFromDb();

  // convert Record<string, WalletDuplicate> to array
  let statsListArray = Object.values(statsList);

  res.json(createApiResponse(true, "Success", statsListArray));
};

export const listAllUsersWallets: RequestHandler = async (req, res) => {
  // get sort direction (asc or desc)
  const sortDirection = ((req.query.sortDirection as string) || "desc") as
    | "asc"
    | "desc";

  // fetch the WalletList document
  let statsList = await listStatsFromDb();
  // convert Record<string, WalletDuplicate> to array
  let statsListArray = Object.values(statsList);

  // fetch the WalletList document
  const walletsArray = statsListArray.map((stat) => stat.wallet);

  // sort by points
  walletsArray.sort((a, b) => {
    if (sortDirection === "asc") return a.points - b.points;
    return b.points - a.points;
  });

  res.json(createApiResponse(true, "Success", walletsArray));
};

export const listAllUsersStreaks: RequestHandler = async (req, res) => {
  // get sort direction (asc or desc)
  const sortDirection = ((req.query.sortDirection as string) || "desc") as
    | "asc"
    | "desc";

  // fetch the WalletList document
  let statsList = await listStatsFromDb();
  // convert Record<string, WalletDuplicate> to array
  let statsListArray = Object.values(statsList);

  // fetch the WalletList document
  const streakArray = statsListArray.map((stat) => stat.streak);

  // sort by currentStreak
  streakArray.sort((a, b) => {
    if (sortDirection === "asc") return a.currentStreak - b.currentStreak;
    return b.currentStreak - a.currentStreak;
  });

  res.json(createApiResponse(true, "Success", streakArray));
};

export const getStatsOfUser: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json(createApiResponse(false, "Unauthorized."));
  }

  const role = user.customClaims?.role || "guest";
  const uid = req.params.uid;

  // PERMISSIONS:
  // Must be authenticated and accessing own claims, except for admins
  if (role !== "admin" && user.uid !== uid) {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  let targetuUser = await fetchUserFromDb(uid);

  if (!targetuUser) {
    return res.status(404).json(createApiResponse(false, "User not found."));
  }

  // get complete stats from db
  let userStats = await fetchStatFromDb(uid);

  // returning the response
  res.json(createApiResponse(true, "Success", userStats));
};
