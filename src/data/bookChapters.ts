import rawBookChapters from "./bookChapters.json";

export type BookChapter = {
  id: string;
  title: string;
  description: string;
  order: number;
};

export const bookChapters = rawBookChapters as readonly BookChapter[];
