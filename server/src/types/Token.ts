import { Metatype } from "./Metatype.js";

export type TokenCore = {
  code: string;
  value: number;
  maxUses: number;
  isValid: boolean;
  expirationDate?: number; // unix timestamp
  claimants: {
    uid: string;
    dateClaimed: number;
  }[];
};

export type Token = Metatype & TokenCore;

export type CreateTokenDTO = Omit<TokenCore, keyof Metatype | "code">;
