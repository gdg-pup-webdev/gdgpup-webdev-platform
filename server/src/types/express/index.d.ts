import "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { UserRecord } from "firebase-admin/auth";

declare global {
  namespace Express {
    export interface Request {
      user?: UserRecord | null;
      decodedToken?: DecodedIdToken | null;
    }
  }
}
