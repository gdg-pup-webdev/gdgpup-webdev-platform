import { db } from "../lib/firebase.js";
import { Token } from "../types/Token.js";

export const fetchTokenFromDb = async (tokenId: string) => {
  const doc = await db.collection("tokens").doc(tokenId).get();

  // if wallet doesnt exist, initiate one with 0 points
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Token;
};
