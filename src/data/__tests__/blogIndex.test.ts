import { describe, expect, it } from "vitest";
import { blogIndex } from "../blogIndex";

const blogModules = import.meta.glob("../blogs/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function frontMatterSlug(raw: string): string | undefined {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;

  const slugLine = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("slug:"));

  return slugLine
    ?.slice("slug:".length)
    .trim()
    .replace(/^["']|["']$/g, "");
}

describe("blog index", () => {
  it("uses current filenames as canonical slugs", () => {
    Object.entries(blogModules).forEach(([path, raw]) => {
      const fileSlug = path
        .split("/")
        .pop()
        ?.replace(/\.md$/, "");

      expect(frontMatterSlug(raw)).toBe(fileSlug);
    });
  });

  it("does not resolve removed legacy slugs", () => {
    const currentSlugs = blogIndex.getAll().map((post) => post.slug);

    expect(currentSlugs).toContain("gen-ai-token-compression");
    expect(currentSlugs).not.toContain("70-genai");
    expect(blogIndex.findBySlugOrTitle("gen-ai-token-compression")?.slug).toBe(
      "gen-ai-token-compression",
    );

    [
      "70-genai",
      "2025-01-15-ship",
      "chatbot-training-alignment",
      "2025-03-08-chatbot",
      "2025-03-20-beautiful-lies",
      "2025-04-20-design-tradeoffs",
      "2025-05-04-overengineering-caching",
      "0_downsides_of_automation",
    ].forEach((legacySlug) => {
      expect(blogIndex.findBySlugOrTitle(legacySlug)).toBeUndefined();
    });
  });

  it("keeps every indexed post attached to at least one topic tag", () => {
    expect(blogIndex.getAll().every((post) => post.tags.length > 0)).toBe(true);
  });

  it("filters posts by topic tags case-insensitively", () => {
    const securityPosts = blogIndex.filterByTag("Security");

    expect(securityPosts.length).toBeGreaterThan(0);
    expect(securityPosts.every((post) => post.tags.includes("security"))).toBe(
      true,
    );
  });

  it("lists topic tags with post counts", () => {
    const security = blogIndex
      .listTags()
      .find(({ tag }) => tag === "security");

    expect(security?.count).toBeGreaterThan(0);
  });
});
