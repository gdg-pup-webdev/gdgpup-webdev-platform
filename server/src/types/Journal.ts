export type JournalEntry = {
  id: string;
  createdAt: number;
  updatedAt: number;
  actors: { uid: string; role: string }[]; // array of user IDs
  title: string;
  content: string;
};

export type Journal = {
  id: string;
  entries: JournalEntry[];
};
