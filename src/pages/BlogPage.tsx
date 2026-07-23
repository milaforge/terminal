import { useEffect, useMemo, useRef, useState } from "react";
import { MarkdownBlock } from "@components/MarkdownBlock";
import { blogIndex } from "@data/blogIndex";
import { BookEntryWithPost, bookIndex } from "@data/bookIndex";
import { withBasePath } from "@utils/appRouting";
import { ChevronRight, Home, Moon, Sun } from "lucide-react";
import { BlogComments } from "./BlogComments";

type BlogPageProps = {
  slug?: string;
  mode?: "blog" | "book";
};

const BLOG_DESCRIPTION =
  "Notes on systems, judgment, and living with uncertainty";
const BLOG_ENTRANCE_MS = 1500;
const BLOG_TAG_PARAM = "tag";

function normalizeTag(tag?: string | null) {
  return tag?.trim().toLowerCase() || "";
}

function formatTagLabel(tag: string) {
  return tag
    .split(/(\s+|-)/)
    .map((part) => {
      if (!part.trim() || part === "-") return part;
      if (part === "&") return part;
      if (part === "ai") return "AI";
      return `${part[0].toUpperCase()}${part.slice(1)}`;
    })
    .join("");
}

function tagHref(tag: string, activeTag?: string, mode: "blog" | "book" = "book") {
  const routeRoot = mode === "blog" ? "/blog/" : "/book/";
  if (normalizeTag(tag) === activeTag) return withBasePath(routeRoot);
  const params = new URLSearchParams({ [BLOG_TAG_PARAM]: normalizeTag(tag) });
  return `${withBasePath(routeRoot)}?${params.toString()}`;
}

type BlogTagListProps = {
  activeTag?: string;
  className: string;
  mode?: "blog" | "book";
  tags: string[];
};

function BlogTagList({ activeTag, className, mode = "book", tags }: BlogTagListProps) {
  const uniqueTags = Array.from(new Set(tags.map(normalizeTag))).filter(Boolean);
  if (!uniqueTags.length) return null;

  return (
    <div className={className} aria-label="Blog topics">
      {uniqueTags.map((tag, index) => {
        const label = formatTagLabel(tag);
        const isActive = tag === activeTag;

        return (
          <span key={tag} className="blog-topicTagItem">
            {index > 0 ? (
              <span className="blog-topicDot" aria-hidden="true">
                ·
              </span>
            ) : null}
            <a
              className={`blog-topicTag${isActive ? " is-active" : ""}`}
              href={tagHref(tag, activeTag, mode)}
              aria-label={
                isActive
                  ? `Clear ${label} topic filter`
                  : `Filter blog posts tagged ${label}`
              }
            >
              {label}
            </a>
          </span>
        );
      })}
    </div>
  );
}

function getActiveTagFromLocation(knownTags: Set<string>) {
  if (typeof window === "undefined") return undefined;

  const tag = normalizeTag(
    new URLSearchParams(window.location.search).get(BLOG_TAG_PARAM),
  );

  return tag && knownTags.has(tag) ? tag : undefined;
}

function setMeta(name: string, content: string) {
  let node = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.name = name;
    document.head.appendChild(node);
  }
  node.content = content;
}

function entryHref(entry: Pick<BookEntryWithPost, "slug">, mode: "blog" | "book" = "book") {
  return withBasePath(`/${mode}/${encodeURIComponent(entry.slug)}/`);
}

function formatBookDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${year}-${month}-${day}`;
}

function formatRelativeBookDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return value;

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.max(
    0,
    Math.floor((todayUtc - parsed.getTime()) / 86_400_000),
  );

  if (diffDays < 1) return "today";
  if (diffDays < 14) return `${diffDays}d ago`;

  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 60) return `${weeks} wk ago`;

  const months = Math.floor(diffDays / 30);
  if (diffDays < 730) return `${months} mo ago`;

  const years = Math.floor(diffDays / 365);
  return `${years} yr ago`;
}

function BookDate({
  label,
  value,
}: {
  label?: string;
  value: string;
}) {
  const exactDate = formatBookDate(value);
  const relativeDate = formatRelativeBookDate(value);

  return (
    <span title={exactDate} aria-label={label ? `${label} ${exactDate}` : exactDate}>
      {label ? `${label} ` : ""}
      {relativeDate}
    </span>
  );
}

function formatEntryCode(code: string) {
  const match = code.match(/^(.+)-(\d+)$/);
  if (!match) return code;

  const family = match[1]
    .toLowerCase()
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");

  return `${family} ${match[2]}`;
}

function formatStatus(status: string) {
  if (status === "Stable for now") return "Stable";
  if (status === "Working chapter") return "Working";
  if (status === "Under revision") return "Revising";
  return status;
}

const BLOG_THEME_KEY = "blog-theme";

function useBlogTheme() {
  const [isLight, setIsLight] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BLOG_THEME_KEY) === "light";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setIsLight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(BLOG_THEME_KEY, next ? "light" : "dark");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return { isLight, toggle };
}

type BlogNavigationProps = {
  mode?: "blog" | "book";
  showBlogLink?: boolean;
  isLight: boolean;
  onToggleTheme: () => void;
};

function BlogNavigation({ mode = "book", showBlogLink = false, isLight, onToggleTheme }: BlogNavigationProps) {
  const label = mode === "blog" ? "Blog" : "Book";
  const href = mode === "blog" ? "/blog/" : "/book/";
  const blogCrumb = showBlogLink ? (
    <a className="blog-backLink" href={withBasePath(href)}>
      {label}
    </a>
  ) : (
    <span className="blog-backLink" aria-current="page">
      {label}
    </span>
  );

  return (
    <header className="blog-siteHeader" aria-label="Primary">
      <nav className="blog-nav" aria-label="Blog navigation">
        <a className="blog-homeLink" href={withBasePath("/")}>
          <Home className="blog-homeIcon" size={16} strokeWidth={2} aria-hidden="true" />
          <span>Milaforge</span>
        </a>
        <ChevronRight className="blog-breadcrumbChevron" size={15} strokeWidth={2.1} aria-hidden="true" />
        {blogCrumb}
        <div className="blog-navEnd">
          <button
            className="blog-themeToggle"
            onClick={onToggleTheme}
            aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
            title={isLight ? "Switch to dark theme" : "Switch to light theme"}
          >
            {isLight ? <Moon size={16} strokeWidth={2} /> : <Sun size={16} strokeWidth={2} />}
          </button>
        </div>
      </nav>
    </header>
  );
}

type BlogEntranceState = "entering" | "ready" | "idle";

function useBlogEntranceClass(slug?: string) {
  const [entranceState, setEntranceState] =
    useState<BlogEntranceState>("entering");
  const previousSlug = useRef(slug);

  useEffect(() => {
    if (previousSlug.current !== slug) {
      previousSlug.current = slug;
      setEntranceState("idle");
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntranceState("idle");
      return;
    }

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setEntranceState("ready");
      });
    });
    const idleTimer = window.setTimeout(() => {
      setEntranceState("idle");
    }, BLOG_ENTRANCE_MS);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return entranceState === "idle"
    ? "blog-page"
    : `blog-page is-${entranceState}`;
}

type OutlineHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  const seen = new Map<string, number>();
  const lines = markdown.split("\n");

  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/\*{1,2}|_{1,2}|`/g, "").trim();
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count === 0 ? base : `${base}-${count}`, text, level });
  }

  return headings;
}

function useActiveHeading(headings: OutlineHeading[]) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function BlogOutline({ headings }: { headings: OutlineHeading[] }) {
  const activeId = useActiveHeading(headings);

  if (!headings.length) return null;

  return (
    <aside className="blog-outline" aria-label="Article outline">
      <div className="blog-outlineLabel">On this page</div>
      <ol className="blog-outlineList">
        {headings.map(({ id, text, level }) => (
          <li key={id} className="blog-outlineItem">
            <a
              href={`#${id}`}
              className={`blog-outlineLink${level === 3 ? " is-h3" : ""}${activeId === id ? " is-active" : ""}`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

type BookEntryCardProps = {
  entry: BookEntryWithPost;
};

function BookEntryCard({ entry }: BookEntryCardProps) {
  return (
    <article className="blog-bookEntry">
      <a className="blog-listBody blog-bookEntryLink" href={entryHref(entry)}>
        <div className="blog-bookEntryMeta">
          <span title={entry.code}>{formatEntryCode(entry.code)}</span>
          <span title={entry.status}>{formatStatus(entry.status)}</span>
          <BookDate label="Updated" value={entry.revisedAt} />
        </div>
        <h3>{entry.title}</h3>
        {entry.summary ? <p>{entry.summary}</p> : null}
        <p className="blog-centralClaim">{entry.centralClaim}</p>
      </a>
    </article>
  );
}

function formatBlogDate(value?: string) {
  if (!value) return "Undated";
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function BlogHome({
  activeTag,
}: {
  activeTag?: string;
}) {
  const posts = activeTag
    ? blogIndex.filterByTag(activeTag)
    : blogIndex.getAll();

  return (
    <>
      <header className="blog-header">
        <h1>Blog</h1>
        <p>{BLOG_DESCRIPTION}</p>
        {activeTag ? (
          <div className="blog-activeFilter" aria-live="polite">
            <span>Topic: {formatTagLabel(activeTag)}</span>
            <a href={withBasePath("/blog/")}>All posts</a>
          </div>
        ) : null}
      </header>

      <section className="blog-list" aria-label="Blog posts">
        {posts.map((post) => (
          <article className="blog-listItem" key={post.slug}>
            <div className="blog-listItemContent">
              <a className="blog-listBody" href={entryHref(post, "blog")}>
                <h2>{post.title}</h2>
                {post.summary ? <p>{post.summary}</p> : null}
                <BlogTagList
                  activeTag={activeTag}
                  className="blog-listTags"
                  mode="blog"
                  tags={post.tags}
                />
              </a>
              <span className="blog-metaDate">{formatBlogDate(post.date)}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function BookHome({
  activeTag,
}: {
  activeTag?: string;
}) {
  const readingPath = bookIndex.getReadingPath();
  const filteredEntries = activeTag
    ? readingPath.filter((entry) => entry.post.tags.includes(activeTag))
    : readingPath;
  const firstEntry = readingPath[0];
  const recentRevisions = bookIndex.getRecentRevisions(4);

  return (
    <>
      <header className="blog-header blog-bookHero">
        <h1>The Unfinished Book</h1>
        <p>{BLOG_DESCRIPTION}</p>
        <div className="blog-bookActions" aria-label="Book actions">
          {firstEntry ? (
            <a className="blog-bookAction" href={entryHref(firstEntry)}>
              Begin reading
            </a>
          ) : null}
          <a className="blog-bookAction" href="#recent-revisions">
            Recent revisions
          </a>
        </div>
        {activeTag ? (
          <div className="blog-activeFilter" aria-live="polite">
            <span>Topic: {formatTagLabel(activeTag)}</span>
            <a href={withBasePath("/book/")}>All entries</a>
          </div>
        ) : null}
      </header>

      <section className="blog-bookContents" aria-label="Book chapters">
        {bookIndex.chapters.map((chapter) => {
          const entries = filteredEntries.filter((entry) => entry.chapter === chapter.id);
          if (!entries.length) return null;

          return (
            <section key={chapter.id} className="blog-bookChapter" aria-labelledby={`chapter-${chapter.id}`}>
              <div className="blog-bookChapterHeader">
                <span>{String(chapter.order).padStart(2, "0")}</span>
                <div>
                  <h2 id={`chapter-${chapter.id}`}>{chapter.title}</h2>
                  <p>{chapter.description}</p>
                </div>
              </div>
              <div className="blog-bookEntryList">
                {entries.map((entry) => (
                  <BookEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      <section className="blog-revisions" id="recent-revisions" aria-labelledby="recent-revisions-title">
        <div className="blog-revisionsHeader">
          <h2 id="recent-revisions-title">Recent revisions</h2>
          <p>Older entries remain alive as the model changes.</p>
        </div>
        <div className="blog-revisionList">
          {recentRevisions.map((entry) => (
            <a key={entry.id} href={entryHref(entry)} className="blog-revisionItem">
              <BookDate value={entry.revisedAt} />
              <strong>{entry.title}</strong>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function BookArticleAside({ entry }: { entry: BookEntryWithPost }) {
  const chapter = bookIndex.chapters.find((item) => item.id === entry.chapter);

  return (
    <aside className="blog-bookAside" aria-label="Entry metadata">
      <div className="blog-bookAsideLabel">This entry</div>
      <dl className="blog-bookDetails">
        <div>
          <dt>Code</dt>
          <dd title={entry.code}>{formatEntryCode(entry.code)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd title={entry.status}>{formatStatus(entry.status)}</dd>
        </div>
        {chapter ? (
          <div>
            <dt>Chapter</dt>
            <dd>{chapter.title}</dd>
          </div>
        ) : null}
        <div>
          <dt>First written</dt>
          <dd>
            <BookDate value={entry.firstWrittenAt} />
          </dd>
        </div>
        <div>
          <dt>Last revised</dt>
          <dd>
            <BookDate value={entry.revisedAt} />
          </dd>
        </div>
      </dl>
    </aside>
  );
}

function BookReadingNav({
  previous,
  next,
}: {
  previous?: BookEntryWithPost;
  next?: BookEntryWithPost;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="blog-readingNav" aria-label="Continue through the book">
      <h2>Continue through the book</h2>
      <div className="blog-readingNavLinks">
        {previous ? (
          <a href={entryHref(previous)} className="blog-readingNavLink">
            <span>Previous idea</span>
            <strong>{previous.title}</strong>
          </a>
        ) : null}
        {next ? (
          <a href={entryHref(next)} className="blog-readingNavLink">
            <span>Next idea</span>
            <strong>{next.title}</strong>
          </a>
        ) : null}
      </div>
    </nav>
  );
}

function useInjectHeadingIds(articleRef: React.RefObject<HTMLElement | null>, headings: OutlineHeading[]) {
  useEffect(() => {
    if (!articleRef.current || !headings.length) return;

    function injectIds() {
      if (!articleRef.current) return;
      const seen = new Map<string, number>();
      articleRef.current.querySelectorAll("h2, h3").forEach((el) => {
        const text = el.textContent?.replace(/\*{1,2}|_{1,2}|`/g, "").trim() ?? "";
        const base = slugifyHeading(text);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        el.id = count === 0 ? base : `${base}-${count}`;
      });
    }

    injectIds();

    const observer = new MutationObserver(injectIds);
    observer.observe(articleRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [articleRef, headings]);
}

export default function BlogPage({ slug, mode = "book" }: BlogPageProps) {
  const knownTags = useMemo(
    () => new Set(blogIndex.listTags().map(({ tag }) => tag)),
    [],
  );
  const activeTag = getActiveTagFromLocation(knownTags);
  const post = useMemo(
    () => (slug ? blogIndex.findBySlugOrTitle(slug) : undefined),
    [slug],
  );
  const bookEntry = useMemo(
    () => (slug ? bookIndex.getWithNavigation(slug) : undefined),
    [slug],
  );
  const entranceClass = useBlogEntranceClass(slug);
  const { isLight, toggle: toggleTheme } = useBlogTheme();
  const pageClassName = `${entranceClass}${isLight ? " is-light" : ""}`;
  const title = mode === "blog" ? "Blog | Milad" : "The Unfinished Book | Milad";
  const description = bookEntry?.summary || post?.summary || BLOG_DESCRIPTION;

  const headings = useMemo(
    () => (post ? extractHeadings(post.body) : []),
    [post],
  );

  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = title;
    setMeta("description", description);
  }, [description, title]);

  useInjectHeadingIds(articleRef, headings);

  if (slug && !post) {
    return (
      <main className={pageClassName}>
        <BlogNavigation mode={mode} showBlogLink isLight={isLight} onToggleTheme={toggleTheme} />
        <header className="blog-header">
          <h1>Post not found</h1>
          <p>
            The requested note is not available.{" "}
            <a
              className="blog-inlineLink"
              href={withBasePath(mode === "blog" ? "/blog/" : "/book/")}
            >
              Back to {mode}
            </a>
            .
          </p>
        </header>
      </main>
    );
  }

  if (post && bookEntry) {
    return (
      <main className={pageClassName}>
        <BlogNavigation mode={mode} showBlogLink isLight={isLight} onToggleTheme={toggleTheme} />
        <div className="blog-layout">
          <article className="blog-article" ref={articleRef}>
            <header className="blog-articleHeader">
              <div className="blog-bookEntryMeta is-article">
                <span title={bookEntry.code}>{formatEntryCode(bookEntry.code)}</span>
                <span title={bookEntry.status}>{formatStatus(bookEntry.status)}</span>
                <BookDate label="Updated" value={bookEntry.revisedAt} />
              </div>
              <h1>{bookEntry.title}</h1>
              <div className="blog-meta">
                <span className="blog-metaDate">
                  <BookDate label="First written" value={bookEntry.firstWrittenAt} />
                </span>
                <BlogTagList className="blog-metaTags" mode={mode} tags={post.tags} />
              </div>
              {bookEntry.summary ? <p>{bookEntry.summary}</p> : null}
              <div className="blog-claimBox">
                <span>Central claim</span>
                <p>{bookEntry.centralClaim}</p>
              </div>
            </header>
            <MarkdownBlock
              segment={{
                type: "markdown",
                markdown: post.body,
                variant: "blog",
              }}
            />
            {mode === "book" ? (
              <BookReadingNav previous={bookEntry.previous} next={bookEntry.next} />
            ) : null}
          </article>
          <div className="blog-sideRail">
            {mode === "book" ? <BookArticleAside entry={bookEntry} /> : null}
            <BlogOutline headings={headings} />
          </div>
        </div>
        <BlogComments postSlug={post.slug} />
      </main>
    );
  }

  return (
    <main className={pageClassName}>
      <BlogNavigation mode={mode} isLight={isLight} onToggleTheme={toggleTheme} />
      {mode === "blog" ? (
        <BlogHome activeTag={activeTag} />
      ) : (
        <BookHome activeTag={activeTag} />
      )}
    </main>
  );
}
