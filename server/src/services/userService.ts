import { auth } from "../lib/firebase.js";

export async function fetchUserFromDb(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    // If no error, user exists
    return userRecord;
  } catch (error: unknown) {
    return undefined;
  }
}
