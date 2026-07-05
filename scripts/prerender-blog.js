#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "data", "blogs");
const BOOK_CHAPTERS_PATH = path.join(ROOT, "src", "data", "bookChapters.json");
const BOOK_ENTRIES_PATH = path.join(ROOT, "src", "data", "bookEntries.json");
const DIST_DIR = path.join(ROOT, "dist");
const BASE_PATH = process.env.BASE_PATH || "/terminal/";
const BLOG_COMMENTS_REPO = "milaforge/terminal";
const BLOG_COMMENTS_ISSUE_TERM = "pathname";
const BLOG_TAG_PARAM = "tag";
const BOOK_DESCRIPTION =
  "Notes toward building systems—and a life—that remain trustworthy under uncertainty.";
const BOOK_EXPLANATION =
  "This is not a chronological blog. It is a book in progress: arguments being refined, principles being tested, and observations connected over time.";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);

const LANGUAGE_ALIASES = {
  js: "javascript",
  sh: "bash",
  shell: "bash",
  sol: "javascript",
  solidity: "javascript",
  ts: "typescript",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeLanguage(infostring) {
  const raw = String(infostring || "").trim().split(/\s+/)[0]?.toLowerCase() || "";
  const highlightAs = LANGUAGE_ALIASES[raw] || raw;
  if (
    !highlightAs ||
    highlightAs === "text" ||
    highlightAs === "txt" ||
    highlightAs === "plaintext"
  ) {
    return { raw };
  }

  return hljs.getLanguage(highlightAs) ? { raw, highlightAs } : { raw };
}

function highlightCode(code, infostring) {
  const { raw, highlightAs } = normalizeLanguage(infostring);
  const className = raw
    ? ` class="hljs language-${escapeHtml(raw)}"`
    : ` class="hljs"`;

  if (!highlightAs) {
    return `<pre><code${className}>${escapeHtml(code)}</code></pre>\n`;
  }

  const highlighted = hljs.highlight(code, {
    language: highlightAs,
    ignoreIllegals: true,
  }).value;

  return `<pre><code${className}>${highlighted}</code></pre>\n`;
}

const renderer = new marked.Renderer();
renderer.code = (code, infostring) => highlightCode(code, infostring);
renderer.table = (header, body) =>
  `<div class="t-markdownTable"><table>\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table></div>\n`;

marked.setOptions({
  gfm: true,
  breaks: false,
  renderer,
});

function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta = {};
  match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key || !rest.length) return;
      const valueRaw = rest.join(":").trim();
      if (!valueRaw) return;

      if (valueRaw.startsWith("[") && valueRaw.endsWith("]")) {
        try {
          const parsed = JSON.parse(valueRaw);
          if (key.trim() === "tags" && Array.isArray(parsed)) {
            meta.tags = parsed.map(String);
            return;
          }
        } catch {
          // Fall through to string parsing.
        }
      }

      meta[key.trim()] = valueRaw.replace(/^"|"$/g, "").trim();
    });

  return { meta, body: (match[2] || "").trim() };
}

function markdownToPlain(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "");
}

function estimateReadingMinutes(plain) {
  const words = plain.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 200));
}

function formatBookDate(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return value;
  return `${year}-${month}-${day}`;
}

function formatRelativeBookDate(value) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return value;

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.max(0, Math.floor((todayUtc - parsed.getTime()) / 86400000));

  if (diffDays < 1) return "today";
  if (diffDays < 14) return `${diffDays}d ago`;

  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 60) return `${weeks} wk ago`;

  const months = Math.floor(diffDays / 30);
  if (diffDays < 730) return `${months} mo ago`;

  const years = Math.floor(diffDays / 365);
  return `${years} yr ago`;
}

function renderBookDate(value, label = "") {
  const exactDate = formatBookDate(value);
  const relativeDate = formatRelativeBookDate(value);
  const text = label ? `${label} ${relativeDate}` : relativeDate;
  const ariaLabel = label ? `${label} ${exactDate}` : exactDate;

  return `<span title="${escapeHtml(exactDate)}" aria-label="${escapeHtml(ariaLabel)}">${escapeHtml(text)}</span>`;
}

function formatEntryCode(code) {
  const match = String(code || "").match(/^(.+)-(\d+)$/);
  if (!match) return code;

  const family = match[1]
    .toLowerCase()
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");

  return `${family} ${match[2]}`;
}

function formatStatus(status) {
  if (status === "Stable for now") return "Stable";
  if (status === "Working chapter") return "Working";
  if (status === "Under revision") return "Revising";
  return status;
}

function withBase(relativePath) {
  const base = BASE_PATH.endsWith("/") ? BASE_PATH.slice(0, -1) : BASE_PATH;
  return `${base}${relativePath}`;
}

function normalizeTag(tag) {
  return String(tag || "").trim().toLowerCase();
}

function formatTagLabel(tag) {
  return normalizeTag(tag)
    .split(/(\s+|-)/)
    .map((part) => {
      if (!part.trim() || part === "-") return part;
      if (part === "&") return part;
      if (part === "ai") return "AI";
      return `${part[0].toUpperCase()}${part.slice(1)}`;
    })
    .join("");
}

function tagHref(tag) {
  const params = new URLSearchParams({ [BLOG_TAG_PARAM]: normalizeTag(tag) });
  return `${withBase("/blog/")}?${params.toString()}`;
}

function renderTopicTags(tags, className) {
  const uniqueTags = Array.from(new Set(tags.map(normalizeTag))).filter(Boolean);
  if (!uniqueTags.length) return "";

  const items = uniqueTags
    .map((tag, index) => {
      const label = formatTagLabel(tag);
      const dot = index
        ? '<span class="blog-topicDot" aria-hidden="true">·</span>'
        : "";

      return `
        <span class="blog-topicTagItem">
          ${dot}
          <a
            class="blog-topicTag"
            href="${escapeHtml(tagHref(tag))}"
            aria-label="Filter blog posts tagged ${escapeHtml(label)}"
          >${escapeHtml(label)}</a>
        </span>`.trim();
    })
    .join("\n");

  return `<div class="${escapeHtml(className)}" aria-label="Blog topics">${items}</div>`;
}

async function loadPosts() {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const filePath = path.join(BLOG_DIR, entry.name);
    const raw = await fs.readFile(filePath, "utf8");
    const { meta, body } = parseFrontMatter(raw);
    const fallbackSlug = entry.name.replace(/\.md$/, "");
    const plain = markdownToPlain(body);

    posts.push({
      slug: fallbackSlug,
      title: meta.title || fallbackSlug,
      date: meta.date,
      tags: Array.isArray(meta.tags) ? meta.tags.map((tag) => tag.toLowerCase()) : [],
      summary: meta.summary,
      body,
      readingMinutes: estimateReadingMinutes(plain),
    });
  }

  return posts.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return a.title.localeCompare(b.title);
  });
}

async function loadBookContent(posts) {
  const [chaptersRaw, entriesRaw] = await Promise.all([
    fs.readFile(BOOK_CHAPTERS_PATH, "utf8"),
    fs.readFile(BOOK_ENTRIES_PATH, "utf8"),
  ]);
  const chapters = JSON.parse(chaptersRaw).slice().sort((a, b) => a.order - b.order);
  const postBySlug = new Map(posts.map((post) => [post.slug, post]));
  const entries = JSON.parse(entriesRaw).map((entry) => {
    const post = postBySlug.get(entry.slug);
    if (!post) {
      throw new Error(`Book entry references missing blog slug: ${entry.slug}`);
    }
    return { ...entry, post };
  });
  const chapterOrder = new Map(chapters.map((chapter) => [chapter.id, chapter.order]));
  const readingPath = entries
    .filter((entry) => !entry.hidden && !entry.draft)
    .sort((a, b) => {
      const chapterDelta = (chapterOrder.get(a.chapter) ?? 0) - (chapterOrder.get(b.chapter) ?? 0);
      if (chapterDelta !== 0) return chapterDelta;
      return a.order - b.order;
    });
  const recentRevisions = readingPath
    .slice()
    .sort((a, b) => b.revisedAt.localeCompare(a.revisedAt) || a.title.localeCompare(b.title))
    .slice(0, 4);

  return { chapters, readingPath, recentRevisions };
}

function applySeo(template, { title, description }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);

  if (/<meta\s+name="description"/.test(html)) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${safeDescription}" />`,
    );
  } else {
    html = html.replace(
      /<meta name="referrer" content="no-referrer" \/>/,
      `<meta name="referrer" content="no-referrer" />\n    <meta name="description" content="${safeDescription}" />`,
    );
  }

  return html;
}

async function writeHtml(routePath, template, seo, content) {
  const html = applySeo(template, seo).replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );
  const outputDir = path.join(DIST_DIR, routePath);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "index.html"), html);
}

function renderBlogNavigation({ showBlogLink = false } = {}) {
  const blogLink = showBlogLink
    ? `<a class="blog-backLink" href="${escapeHtml(withBase("/blog/"))}">Book</a>`
    : `<span class="blog-backLink" aria-current="page">Book</span>`;
  return `
    <header class="blog-siteHeader" aria-label="Primary">
      <nav class="blog-nav" aria-label="Blog navigation">
        <a class="blog-homeLink" href="${escapeHtml(withBase("/"))}">
          <svg class="blog-homeIcon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7"></path>
            <path d="M9 22V12h6v10"></path>
            <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path>
          </svg>
          <span>Milad</span>
        </a>
        <svg class="blog-breadcrumbChevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"></path>
        </svg>
        ${blogLink}
      </nav>
    </header>`.trim();
}

function renderBlogComments() {
  return `
    <section class="blog-comments" aria-labelledby="blog-comments-title">
      <h2 id="blog-comments-title">Comments</h2>
      <div
        class="blog-commentsEmbed"
        data-comments-repo="${escapeHtml(BLOG_COMMENTS_REPO)}"
        data-comments-issue-term="${escapeHtml(BLOG_COMMENTS_ISSUE_TERM)}"
      ></div>
    </section>`.trim();
}

function entryHref(entry) {
  return withBase(`/blog/${encodeURIComponent(entry.slug)}/`);
}

function renderBookEntryCard(entry) {
  const summary = entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : "";

  return `
    <article class="blog-bookEntry">
      <a class="blog-listBody blog-bookEntryLink" href="${escapeHtml(entryHref(entry))}">
        <div class="blog-bookEntryMeta">
          <span title="${escapeHtml(entry.code)}">${escapeHtml(formatEntryCode(entry.code))}</span>
          <span title="${escapeHtml(entry.status)}">${escapeHtml(formatStatus(entry.status))}</span>
          ${renderBookDate(entry.revisedAt, "Updated")}
        </div>
        <h3>${escapeHtml(entry.title)}</h3>
        ${summary}
        <p class="blog-centralClaim">${escapeHtml(entry.centralClaim)}</p>
      </a>
    </article>`.trim();
}

function renderBlogIndex(book) {
  const firstEntry = book.readingPath[0];
  const chapters = book.chapters
    .map((chapter) => {
      const entries = book.readingPath.filter((entry) => entry.chapter === chapter.id);
      if (!entries.length) return "";

      return `
        <section class="blog-bookChapter" aria-labelledby="chapter-${escapeHtml(chapter.id)}">
          <div class="blog-bookChapterHeader">
            <span>${escapeHtml(String(chapter.order).padStart(2, "0"))}</span>
            <div>
              <h2 id="chapter-${escapeHtml(chapter.id)}">${escapeHtml(chapter.title)}</h2>
              <p>${escapeHtml(chapter.description)}</p>
            </div>
          </div>
          <div class="blog-bookEntryList">
            ${entries.map(renderBookEntryCard).join("\n")}
          </div>
        </section>`.trim();
    })
    .join("\n");
  const revisions = book.recentRevisions
    .map(
      (entry) => `
        <a href="${escapeHtml(entryHref(entry))}" class="blog-revisionItem">
          ${renderBookDate(entry.revisedAt)}
          <strong>${escapeHtml(entry.title)}</strong>
        </a>`.trim(),
    )
    .join("\n");

  return `
    <main class="blog-page is-entering">
      ${renderBlogNavigation()}
      <header class="blog-header blog-bookHero">
        <p class="blog-bookEyebrow">Systems under uncertainty</p>
        <h1>The Unfinished Book</h1>
        <p>${escapeHtml(BOOK_DESCRIPTION)}</p>
        <p class="blog-bookExplanation">${escapeHtml(BOOK_EXPLANATION)}</p>
        <div class="blog-bookActions" aria-label="Book actions">
          ${firstEntry ? `<a class="blog-bookAction" href="${escapeHtml(entryHref(firstEntry))}">Begin reading</a>` : ""}
          <a class="blog-bookAction" href="#recent-revisions">Recent revisions</a>
        </div>
      </header>
      <section class="blog-bookContents" aria-label="Book chapters">
        ${chapters}
      </section>
      <section class="blog-revisions" id="recent-revisions" aria-labelledby="recent-revisions-title">
        <div class="blog-revisionsHeader">
          <h2 id="recent-revisions-title">Recent revisions</h2>
          <p>Older entries remain alive as the model changes.</p>
        </div>
        <div class="blog-revisionList">
          ${revisions}
        </div>
      </section>
    </main>`.trim();
}

function renderBookAside(entry, chapter) {
  return `
    <aside class="blog-bookAside" aria-label="Entry metadata">
      <div class="blog-bookAsideLabel">This entry</div>
      <dl class="blog-bookDetails">
        <div><dt>Code</dt><dd title="${escapeHtml(entry.code)}">${escapeHtml(formatEntryCode(entry.code))}</dd></div>
        <div><dt>Status</dt><dd title="${escapeHtml(entry.status)}">${escapeHtml(formatStatus(entry.status))}</dd></div>
        ${chapter ? `<div><dt>Chapter</dt><dd>${escapeHtml(chapter.title)}</dd></div>` : ""}
        <div><dt>First written</dt><dd>${renderBookDate(entry.firstWrittenAt)}</dd></div>
        <div><dt>Last revised</dt><dd>${renderBookDate(entry.revisedAt)}</dd></div>
      </dl>
    </aside>`.trim();
}

function renderReadingNav(entry, readingPath) {
  const index = readingPath.findIndex((item) => item.id === entry.id);
  const previous = readingPath[index - 1];
  const next = readingPath[index + 1];
  if (!previous && !next) return "";

  return `
    <nav class="blog-readingNav" aria-label="Continue through the book">
      <h2>Continue through the book</h2>
      <div class="blog-readingNavLinks">
        ${
          previous
            ? `<a href="${escapeHtml(entryHref(previous))}" class="blog-readingNavLink"><span>Previous idea</span><strong>${escapeHtml(previous.title)}</strong></a>`
            : ""
        }
        ${
          next
            ? `<a href="${escapeHtml(entryHref(next))}" class="blog-readingNavLink"><span>Next idea</span><strong>${escapeHtml(next.title)}</strong></a>`
            : ""
        }
      </div>
    </nav>`.trim();
}

async function renderPost(entry, book) {
  const post = entry.post;
  const summary = entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : "";
  const body = await marked.parse(post.body);
  const chapter = book.chapters.find((item) => item.id === entry.chapter);

  return `
    <main class="blog-page is-entering">
      ${renderBlogNavigation({ showBlogLink: true })}
      <div class="blog-layout">
        <article class="blog-article">
          <header class="blog-articleHeader">
            <div class="blog-bookEntryMeta is-article">
              <span title="${escapeHtml(entry.code)}">${escapeHtml(formatEntryCode(entry.code))}</span>
              <span title="${escapeHtml(entry.status)}">${escapeHtml(formatStatus(entry.status))}</span>
              ${renderBookDate(entry.revisedAt, "Updated")}
            </div>
            <h1>${escapeHtml(entry.title)}</h1>
            <div class="blog-meta">
              <span class="blog-metaDate">${renderBookDate(entry.firstWrittenAt, "First written")}</span>
              ${renderTopicTags(post.tags, "blog-metaTags")}
            </div>
            ${summary}
            <div class="blog-claimBox">
              <span>Central claim</span>
              <p>${escapeHtml(entry.centralClaim)}</p>
            </div>
          </header>
          <div class="t-markdown t-markdown--blog">
            <div class="t-markdownBody">${body}</div>
          </div>
          ${renderReadingNav(entry, book.readingPath)}
        </article>
        <div class="blog-sideRail">
          ${renderBookAside(entry, chapter)}
        </div>
      </div>
      ${renderBlogComments()}
    </main>`.trim();
}

async function main() {
  const templatePath = path.join(DIST_DIR, "index.html");
  const template = await fs.readFile(templatePath, "utf8");
  if (!template.includes('<div id="root"></div>')) {
    throw new Error("dist/index.html does not contain an empty #root placeholder");
  }

  const posts = await loadPosts();
  const book = await loadBookContent(posts);
  await writeHtml(
    "blog",
    template,
    {
      title: "The Unfinished Book | Milad",
      description: BOOK_DESCRIPTION,
    },
    renderBlogIndex(book),
  );

  for (const entry of book.readingPath) {
    await writeHtml(
      path.join("blog", entry.slug),
      template,
      {
        title: `${entry.title} | Milad`,
        description:
          entry.summary ||
          `Unfinished book entry: ${entry.title}.`,
      },
      await renderPost(entry, book),
    );
  }

  console.log(`prerendered blog index and ${posts.length} blog posts`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
