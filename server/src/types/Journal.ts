import { Metatype } from "./Metatype.js";

export type JournalEntry = Metatype & {
  actors: { uid: string; role: string }[]; // array of user IDs
  title: string;
  content: string;
};

export type Journal = {
  id: string;
  entries: JournalEntry[];
};
