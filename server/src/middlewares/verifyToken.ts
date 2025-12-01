import { RequestHandler } from "express";
import { auth } from "../lib/firebase.js"; 

/**
 * Middleware to parse authorization token from request headers.
 * If valid, attaches the user and decoded token to the request object.
 * If invalid or absent, continues without attaching user info.
 */
export const parseToken: RequestHandler = async (req, res, next) => {
  try {
    // parsing header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If no header, mark user as undefined and continue (optional)
      req.user = undefined;
      req.decodedToken = undefined;
      return next();
    }

    // Extract the token and user
    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);
    let user = await auth.getUser(decoded.uid);

    // get the claims of the user
    const customClaims = user.customClaims;

    // create the claims if it doesnt exist
    if (!customClaims || Object.keys(customClaims).length === 0) {
      const defaultClaims = { role: "user" };
      await auth.setCustomUserClaims(user.uid, defaultClaims);
      user = await auth.getUser(user.uid);
    }

    req.user = user;
    req.decodedToken = decoded;
    return next();

  } catch (error) {
    // If an error occurs, mark user as undefined and continue
    req.user = undefined;
    req.decodedToken = undefined;
    return next();
  }
};
