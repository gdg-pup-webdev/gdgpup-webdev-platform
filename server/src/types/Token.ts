import { Metatype } from "./Metatype.js";

export type TokenCore = {
  value: number;
  maxUses: number;
  expirationDate?: number;

  // core metadata
  createdBy: string;
  isValid: boolean;
  code: string;
  claimHistory: {
    uid: string;
    date: number;
  }[];
};

export type Token = Metatype & TokenCore;

export type CreateTokenDTO = Omit<
  TokenCore,
  keyof Metatype | "code" | "creatorUid" | "claimants" | "isValid"
>;
