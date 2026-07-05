import { blogIndex, BlogPost } from "./blogIndex";
import { bookChapters, BookChapter } from "./bookChapters";
import {
  bookEntries,
  BookEntry,
  BookEntryStatus,
  bookEntryStatuses,
  BookRelationshipType,
  bookRelationshipTypes,
} from "./bookEntries";

export type BookEntryWithPost = BookEntry & {
  post: BlogPost;
};

export type ResolvedBookRelationship = {
  type: BookRelationshipType;
  entry: BookEntryWithPost;
  note?: string;
};

export type BookEntryWithNavigation = BookEntryWithPost & {
  chapterInfo: BookChapter;
  previous?: BookEntryWithPost;
  next?: BookEntryWithPost;
  resolvedRelationships: ResolvedBookRelationship[];
};

export type BookValidationIssueCode =
  | "duplicate-id"
  | "duplicate-slug"
  | "missing-required-field"
  | "invalid-chapter"
  | "invalid-status"
  | "invalid-date"
  | "broken-relationship"
  | "self-reference"
  | "duplicate-relationship-reference"
  | "hidden-entry-reference"
  | "ambiguous-order"
  | "duplicate-chapter-id"
  | "ambiguous-chapter-order";

export type BookValidationIssue = {
  code: BookValidationIssueCode;
  message: string;
  entryId?: string;
};

const requiredEntryStringFields = [
  "id",
  "slug",
  "code",
  "title",
  "chapter",
  "status",
  "firstWrittenAt",
  "revisedAt",
  "centralClaim",
] as const;

function isVisible(entry: Pick<BookEntry, "hidden" | "draft">) {
  return !entry.hidden && !entry.draft;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function pushDuplicateIssues<T extends { id?: string; slug?: string }>(
  issues: BookValidationIssue[],
  items: readonly T[],
  keyName: "id" | "slug",
  code: "duplicate-id" | "duplicate-slug",
) {
  const seen = new Map<string, number>();

  items.forEach((item) => {
    const rawValue = item[keyName];
    if (!rawValue) return;
    const value = String(rawValue);
    const count = seen.get(value) ?? 0;
    seen.set(value, count + 1);
    if (count === 1) {
      issues.push({
        code,
        entryId: item.id,
        message: `Duplicate book entry ${keyName}: ${value}`,
      });
    }
  });
}

export function validateBookContent(
  entries: readonly BookEntry[] = bookEntries,
  chapters: readonly BookChapter[] = bookChapters,
): BookValidationIssue[] {
  const issues: BookValidationIssue[] = [];
  const chapterIds = new Set<string>();
  const chapterOrders = new Map<number, string>();
  const entryById = new Map<string, BookEntry>();
  const orderKeys = new Map<string, string>();
  const statuses = new Set<BookEntryStatus>(bookEntryStatuses);
  const relationshipTypes = new Set<BookRelationshipType>(bookRelationshipTypes);

  chapters.forEach((chapter) => {
    if (chapterIds.has(chapter.id)) {
      issues.push({
        code: "duplicate-chapter-id",
        message: `Duplicate book chapter id: ${chapter.id}`,
      });
    }
    chapterIds.add(chapter.id);

    const existingChapter = chapterOrders.get(chapter.order);
    if (existingChapter) {
      issues.push({
        code: "ambiguous-chapter-order",
        message: `Chapter order ${chapter.order} is shared by ${existingChapter} and ${chapter.id}`,
      });
    }
    chapterOrders.set(chapter.order, chapter.id);
  });

  pushDuplicateIssues(issues, entries, "id", "duplicate-id");
  pushDuplicateIssues(issues, entries, "slug", "duplicate-slug");

  entries.forEach((entry) => {
    if (entry.id) entryById.set(entry.id, entry);

    requiredEntryStringFields.forEach((field) => {
      if (!String(entry[field] ?? "").trim()) {
        issues.push({
          code: "missing-required-field",
          entryId: entry.id,
          message: `Book entry is missing required field: ${field}`,
        });
      }
    });

    if (!chapterIds.has(entry.chapter)) {
      issues.push({
        code: "invalid-chapter",
        entryId: entry.id,
        message: `Book entry references unknown chapter: ${entry.chapter}`,
      });
    }

    if (!statuses.has(entry.status)) {
      issues.push({
        code: "invalid-status",
        entryId: entry.id,
        message: `Book entry has invalid status: ${entry.status}`,
      });
    }

    if (!isValidDate(entry.firstWrittenAt)) {
      issues.push({
        code: "invalid-date",
        entryId: entry.id,
        message: `Book entry has invalid firstWrittenAt date: ${entry.firstWrittenAt}`,
      });
    }

    if (!isValidDate(entry.revisedAt)) {
      issues.push({
        code: "invalid-date",
        entryId: entry.id,
        message: `Book entry has invalid revisedAt date: ${entry.revisedAt}`,
      });
    }

    if (isVisible(entry)) {
      const orderKey = `${entry.chapter}:${entry.order}`;
      const existingEntry = orderKeys.get(orderKey);
      if (existingEntry) {
        issues.push({
          code: "ambiguous-order",
          entryId: entry.id,
          message: `Visible entries ${existingEntry} and ${entry.id} share chapter/order ${orderKey}`,
        });
      }
      orderKeys.set(orderKey, entry.id);
    }
  });

  entries.forEach((entry) => {
    const relationshipKeys = new Set<string>();

    entry.relationships?.forEach((relationship) => {
      if (!relationshipTypes.has(relationship.type)) {
        issues.push({
          code: "broken-relationship",
          entryId: entry.id,
          message: `Book entry uses invalid relationship type: ${relationship.type}`,
        });
      }

      if (relationship.entryId === entry.id) {
        issues.push({
          code: "self-reference",
          entryId: entry.id,
          message: `Book entry references itself: ${entry.id}`,
        });
      }

      const target = entryById.get(relationship.entryId);
      if (!target) {
        issues.push({
          code: "broken-relationship",
          entryId: entry.id,
          message: `Book entry references missing entry: ${relationship.entryId}`,
        });
      } else if (isVisible(entry) && !isVisible(target)) {
        issues.push({
          code: "hidden-entry-reference",
          entryId: entry.id,
          message: `Visible entry ${entry.id} references hidden or draft entry ${target.id}`,
        });
      }

      const relationshipKey = `${relationship.type}:${relationship.entryId}`;
      if (relationshipKeys.has(relationshipKey)) {
        issues.push({
          code: "duplicate-relationship-reference",
          entryId: entry.id,
          message: `Book entry repeats relationship ${relationshipKey}`,
        });
      }
      relationshipKeys.add(relationshipKey);
    });
  });

  return issues;
}

function getValidatedEntries() {
  const issues = validateBookContent();
  if (issues.length) {
    throw new Error(
      `Invalid unfinished-book metadata:\n${issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  return bookEntries;
}

function joinWithPosts(entries: readonly BookEntry[] = getValidatedEntries()): BookEntryWithPost[] {
  return entries.map((entry) => {
    const post = blogIndex.findBySlugOrTitle(entry.slug);
    if (!post) {
      throw new Error(`Book entry references missing blog slug: ${entry.slug}`);
    }

    return { ...entry, post };
  });
}

function getReadingPath() {
  const chapterOrder = new Map<string, number>(
    bookChapters.map((chapter) => [chapter.id, chapter.order]),
  );

  return joinWithPosts()
    .filter(isVisible)
    .sort((a, b) => {
      const chapterDelta = (chapterOrder.get(a.chapter) ?? 0) - (chapterOrder.get(b.chapter) ?? 0);
      if (chapterDelta !== 0) return chapterDelta;
      return a.order - b.order;
    });
}

function getAll() {
  return joinWithPosts().filter(isVisible);
}

function getBySlug(slug: string) {
  return getAll().find((entry) => entry.slug === slug);
}

function getById(id: string) {
  return getAll().find((entry) => entry.id === id);
}

function getByChapter(chapterId: string) {
  return getReadingPath().filter((entry) => entry.chapter === chapterId);
}

function getRecentRevisions(limit = 5) {
  return getAll()
    .slice()
    .sort((a, b) => b.revisedAt.localeCompare(a.revisedAt) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function getWithNavigation(slug: string): BookEntryWithNavigation | undefined {
  const readingPath = getReadingPath();
  const currentIndex = readingPath.findIndex((entry) => entry.slug === slug);
  if (currentIndex < 0) return undefined;

  const entry = readingPath[currentIndex];
  const entryById = new Map(readingPath.map((item) => [item.id, item]));
  const chapterInfo = bookChapters.find((chapter) => chapter.id === entry.chapter);
  if (!chapterInfo) return undefined;

  return {
    ...entry,
    chapterInfo,
    previous: readingPath[currentIndex - 1],
    next: readingPath[currentIndex + 1],
    resolvedRelationships:
      entry.relationships?.reduce<ResolvedBookRelationship[]>((resolved, relationship) => {
        const target = entryById.get(relationship.entryId);
        if (!target) return resolved;
        resolved.push({
          type: relationship.type,
          entry: target,
          ...(relationship.note ? { note: relationship.note } : {}),
        });
        return resolved;
      }, []) ?? [],
  };
}

export const bookIndex = {
  chapters: bookChapters,
  entries: bookEntries,
  getAll,
  getByChapter,
  getById,
  getBySlug,
  getReadingPath,
  getRecentRevisions,
  getWithNavigation,
  validate: validateBookContent,
};

export type BookIndex = typeof bookIndex;
