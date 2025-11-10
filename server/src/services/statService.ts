import { db } from "../lib/firebase.js";
import {
  Streak,
  StreakDuplicate,
  UserStats,
  UserStatsDuplicate,
  UserStatsList,
  Wallet,
  WalletDuplicate,
} from "../types/UserStats.js";

/**
 * Posts the user stats on the database
 * Auto syncs the stats list
 */
export const postStatsOnDb = async (userStats: UserStats): Promise<void> => {
  await db.collection("stats").doc(userStats.uid).set(userStats);

  await syncStatsListWithUpdatedStats(userStats);
};

/**
 * Lists all users stats from the database
 */
export const listStatsFromDb = async (): Promise<UserStatsList> => {
  const doc = await db.collection("stats").doc("list").get();

  if (!doc.exists) {
    return {} as UserStatsList;
  }

  const userStatsList = doc.data() as UserStatsList;
  return userStatsList;
};

/**
 * Creates a new user stats on the database
 * Auto syncs the stats list
 */
export const createNewUserStatOnDb = async (
  uid: string
): Promise<UserStats> => {
  // create new wallet
  const defaultWallet: Wallet = {
    id: uid,
    points: 0,
    uid: uid,
    history: [],
  };

  const defaultStreak: Streak = {
    id: uid,
    uid: uid,
    currentStreak: 0,
    longestStreak: 0,
    history: [],
  };

  const defaultUserStats: UserStats = {
    id: uid,
    uid: uid,
    wallet: defaultWallet,
    streak: defaultStreak,
  };

  // post new wallet on database
  await db.collection("stats").doc(uid).set(defaultUserStats);

  // update wallet list
  await syncStatsListWithUpdatedStats(defaultUserStats);

  return defaultUserStats;
};

/**
 * Increments the wallet value of a user
 * Auto syncs the stats list
 */
export const incrementWalletValue = async (
  uid: string,
  increment: number,
  message?: string
): Promise<UserStats> => {
  // get current user stats
  const userStats = await fetchStatFromDb(uid);

  const currentWallet = userStats.wallet;
  const updatedPoints = currentWallet.points + increment;
  const updatedWallet = {
    ...currentWallet,
    points: updatedPoints,
    history: [
      ...currentWallet.history,
      {
        change: increment,
        date: Date.now(),
        message: message || `Added ${increment} points`,
      },
    ],
  };

  // make updated stats
  const updatedUserStats: UserStats = {
    ...userStats,
    wallet: updatedWallet,
  };

  // post changes on the database
  await postStatsOnDb(updatedUserStats);

  // return the updated wallet
  return updatedUserStats;
};

/**
 * Fetches the user stats from the database
 */
export const fetchStatFromDb = async (uid: string): Promise<UserStats> => {
  const doc = await db.collection("stats").doc(uid).get();

  if (!doc.exists) {
    const newUserStats = await createNewUserStatOnDb(uid);
    return newUserStats;
  }

  const userStats = doc.data() as UserStats;
  return userStats;
};

/**
 * updates the stats list document based on an updated stats
 */
export const syncStatsListWithUpdatedStats = async (
  updatedStats: UserStats
): Promise<UserStatsList> => {
  // wallet dupliciate
  const walletDuplicate: WalletDuplicate = {
    id: updatedStats.wallet.id,
    points: updatedStats.wallet.points,
    uid: updatedStats.wallet.uid,
  };

  const StreakDuplicate: StreakDuplicate = {
    id: updatedStats.streak.id,
    uid: updatedStats.streak.uid,
    currentStreak: updatedStats.streak.currentStreak,
    longestStreak: updatedStats.streak.longestStreak,
  };

  // build the wallet duplicate
  const statsDuplicate: UserStatsDuplicate = {
    id: updatedStats.id,
    uid: updatedStats.uid,
    wallet: walletDuplicate,
    streak: StreakDuplicate,
  };

  // get complete list of wallets
  const listDoc = await db.collection("stats").doc("list").get();
  let userStatsList = await listStatsFromDb();

  // add new wallet to list
  userStatsList[statsDuplicate.uid] = statsDuplicate;

  // post on database
  await db.collection("stats").doc("list").set(userStatsList);

  return userStatsList;
};

/**
 * updates the stats list document based on an updated wallet
 */
export const syncStatsListWithUpdatedWallet = async (
  updatedWallet: Wallet
): Promise<UserStatsList> => {
  // get current statslist
  const userStatsList = await listStatsFromDb();

  // get user current stat
  const userStats = userStatsList[updatedWallet.uid];

  // wallet dupliciate
  const updatedWalletDupplicate: WalletDuplicate = {
    id: updatedWallet.id,
    points: updatedWallet.points,
    uid: updatedWallet.uid,
  };

  // update wallet in list
  userStats.wallet = updatedWalletDupplicate;

  // add new wallet to list
  userStatsList[updatedWallet.uid] = userStats;

  // post on database
  await db.collection("stats").doc("list").set(userStatsList);

  return userStatsList;
};

/**
 * updates the stats list document based on an updated streak
 */
export const syncStatsListWithUpdatedStreak = async (
  updatedStreak: Streak
): Promise<UserStatsList> => {
  // get current statslist
  const userStatsList = await listStatsFromDb();

  // get user current stat
  const userStats = userStatsList[updatedStreak.uid];

  // streak dupliciate
  const updatedStreakDupplicate: StreakDuplicate = {
    id: updatedStreak.id,
    uid: updatedStreak.uid,
    currentStreak: updatedStreak.currentStreak,
    longestStreak: updatedStreak.longestStreak,
  };

  // update streak in list
  userStats.streak = updatedStreakDupplicate;

  // add new streak to list
  userStatsList[updatedStreak.uid] = userStats;

  // post on database
  await db.collection("stats").doc("list").set(userStatsList);

  return userStatsList;
};
