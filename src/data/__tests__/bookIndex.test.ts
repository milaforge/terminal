import { describe, expect, it } from "vitest";
import { blogIndex } from "../blogIndex";
import { bookChapters } from "../bookChapters";
import { bookEntries, BookEntry } from "../bookEntries";
import { bookIndex, validateBookContent } from "../bookIndex";

const blogModules = import.meta.glob("../blogs/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function blogFileSlugs() {
  return Object.keys(blogModules)
    .map((path) =>
      path
        .split("/")
        .pop()!
        .replace(/\.md$/, ""),
    )
    .sort();
}

function cloneEntry(overrides: Partial<BookEntry> = {}): BookEntry {
  return {
    id: "entry-test",
    slug: "test",
    code: "TEST-01",
    title: "Test Entry",
    summary: "A test entry.",
    chapter: "boundaries",
    order: 99,
    status: "Fragment",
    firstWrittenAt: "2026-01-01",
    revisedAt: "2026-01-01",
    centralClaim: "A test claim.",
    relationships: [],
    tags: ["test"],
    ...overrides,
  };
}

function issueCodesFor(entries: readonly BookEntry[]) {
  return validateBookContent(entries, bookChapters).map((issue) => issue.code);
}

describe("unfinished book metadata", () => {
  it("is valid for the current registry", () => {
    expect(validateBookContent()).toEqual([]);
  });

  it("maps every current Markdown article slug exactly once", () => {
    const entrySlugs = bookEntries.map((entry) => entry.slug).sort();

    expect(entrySlugs).toEqual(blogFileSlugs());
  });

  it("preserves existing article URLs by using current blog slugs", () => {
    bookEntries.forEach((entry) => {
      expect(blogIndex.findBySlugOrTitle(entry.slug)?.slug).toBe(entry.slug);
    });
  });

  it("derives a deterministic reading path by chapter and entry order", () => {
    expect(bookIndex.getReadingPath().map((entry) => entry.code)).toEqual([
      "BOUNDARY-01",
      "BOUNDARY-02",
      "FAILURE-01",
      "FAILURE-02",
      "RELIABLE-AGENCY-01",
      "JUDGMENT-01",
      "JUDGMENT-02",
      "HUMAN-SYSTEMS-01",
      "OPEN-QUESTIONS-01",
    ]);
  });

  it("derives previous and next idea navigation without route changes", () => {
    const entry = bookIndex.getWithNavigation("cybersecurity-harsh-truth");

    expect(entry?.previous?.slug).toBe("design-tradeoffs");
    expect(entry?.next?.slug).toBe("gen-ai-token-compression");
    expect(entry?.chapterInfo.id).toBe("failure");
  });

  it("detects duplicate ids and slugs", () => {
    const first = cloneEntry();
    const second = cloneEntry({ order: 100 });

    expect(issueCodesFor([first, second])).toEqual(
      expect.arrayContaining(["duplicate-id", "duplicate-slug"]),
    );
  });

  it("detects missing required fields, invalid chapters, invalid statuses, and invalid dates", () => {
    const invalid = cloneEntry({
      id: "",
      title: "",
      chapter: "missing",
      status: "Done" as BookEntry["status"],
      firstWrittenAt: "2026-13-40",
      revisedAt: "not-a-date",
    });

    expect(issueCodesFor([invalid])).toEqual(
      expect.arrayContaining([
        "missing-required-field",
        "invalid-chapter",
        "invalid-status",
        "invalid-date",
      ]),
    );
  });

  it("detects broken, self, duplicate, and hidden-entry relationship references", () => {
    const hidden = cloneEntry({
      id: "entry-hidden",
      slug: "hidden",
      code: "TEST-00",
      order: 98,
      hidden: true,
    });
    const source = cloneEntry({
      id: "entry-source",
      slug: "source",
      code: "TEST-01",
      relationships: [
        { type: "related", entryId: "entry-source" },
        { type: "related", entryId: "entry-missing" },
        { type: "related", entryId: "entry-hidden" },
        { type: "related", entryId: "entry-hidden" },
      ],
    });

    expect(issueCodesFor([hidden, source])).toEqual(
      expect.arrayContaining([
        "self-reference",
        "broken-relationship",
        "hidden-entry-reference",
        "duplicate-relationship-reference",
      ]),
    );
  });

  it("detects ambiguous visible ordering", () => {
    expect(
      issueCodesFor([
        cloneEntry({ id: "entry-a", slug: "a", order: 1 }),
        cloneEntry({ id: "entry-b", slug: "b", order: 1 }),
      ]),
    ).toContain("ambiguous-order");
  });
});
