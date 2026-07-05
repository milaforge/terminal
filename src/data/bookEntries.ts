import rawBookEntries from "./bookEntries.json";

export const bookEntryStatuses = [
  "Fragment",
  "Developing",
  "Working chapter",
  "Stable for now",
  "Under revision",
] as const;

export type BookEntryStatus = (typeof bookEntryStatuses)[number];

export const bookRelationshipTypes = [
  "extends",
  "supports",
  "challenges",
  "tensions",
  "dependsOn",
  "related",
] as const;

export type BookRelationshipType = (typeof bookRelationshipTypes)[number];

export type BookRelationship = {
  type: BookRelationshipType;
  entryId: string;
  note?: string;
};

export type BookEntry = {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle?: string;
  summary?: string;
  chapter: string;
  order: number;
  status: BookEntryStatus;
  firstWrittenAt: string;
  revisedAt: string;
  readingTime?: number;
  centralClaim: string;
  currentBelief?: string;
  whatCouldChangeMyMind?: string;
  unresolved?: string[];
  relationships?: BookRelationship[];
  tags?: string[];
  hidden?: boolean;
  draft?: boolean;
};

export const bookEntries = rawBookEntries as readonly BookEntry[];
