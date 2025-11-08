
export type JournalEntry = {
    id: string;
    createdAt: number;
    updatedAt: number;
    actors: string[]; // array of user IDs
    title: string;
    content: string;
}

export type Journal = JournalEntry[]