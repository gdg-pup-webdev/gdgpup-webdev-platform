import { Metatype } from "./Metatype.js";

export type TokenCore = {
  value: number;
  maxUses: number;
  expirationDate?: number;

  // core metadata
  creatorUid: string;
  isValid: boolean;
  code: string;
  claimants: {
    uid: string;
    dateClaimed: number;
  }[];
};

export type Token = Metatype & TokenCore;

export type CreateTokenDTO = Omit<
  TokenCore,
  keyof Metatype | "code" | "creatorUid" | "claimants" | "isValid"
>;



