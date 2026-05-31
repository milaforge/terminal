import { useEffect, useMemo } from "react";
import { MarkdownBlock } from "@components/MarkdownBlock";
import { blogIndex, BlogPost } from "@data/blogIndex";

type BlogPageProps = {
  slug?: string;
};

const BLOG_DESCRIPTION =
  "FailureSmith notes on reliability, automation risk, execution ownership, and production systems.";

function withBase(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base === "/" ? "" : base.replace(/\/$/, "");
  return `${cleanBase}${path}`;
}

function formatDate(date?: string) {
  if (!date) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
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

function postHref(post: BlogPost) {
  return withBase(`/blog/${encodeURIComponent(post.slug)}`);
}

export default function BlogPage({ slug }: BlogPageProps) {
  const posts = useMemo(() => blogIndex.getAll(), []);
  const post = useMemo(
    () => (slug ? blogIndex.findBySlugOrTitle(slug) : undefined),
    [slug],
  );
  const title = post ? `${post.title} | FS.dev` : "Blog | FS.dev";
  const description = post?.summary || BLOG_DESCRIPTION;

  useEffect(() => {
    document.title = title;
    setMeta("description", description);
  }, [description, title]);

  if (slug && !post) {
    return (
      <main className="blog-page">
        <header className="blog-header">
          <a className="blog-homeLink" href={withBase("/")}>
            FS.dev
          </a>
          <h1>Post not found</h1>
          <p>The requested note is not available.</p>
        </header>
        <a className="blog-backLink" href={withBase("/blog")}>
          Back to blog
        </a>
      </main>
    );
  }

  if (post) {
    const writtenAt = formatDate(post.date);

    return (
      <main className="blog-page">
        <header className="blog-header">
          <a className="blog-homeLink" href={withBase("/")}>
            FS.dev
          </a>
          <a className="blog-backLink" href={withBase("/blog")}>
            Blog
          </a>
        </header>
        <article className="blog-article">
          <header className="blog-articleHeader">
            <h1>{post.title}</h1>
            <div className="blog-meta">
              {writtenAt ? <time dateTime={post.date}>{writtenAt}</time> : null}
              <span>{post.readingMinutes} min read</span>
            </div>
            {post.summary ? <p>{post.summary}</p> : null}
          </header>
          <MarkdownBlock
            segment={{
              type: "markdown",
              markdown: post.body,
              variant: "blog",
            }}
          />
        </article>
      </main>
    );
  }

  return (
    <main className="blog-page">
      <header className="blog-header">
        <a className="blog-homeLink" href={withBase("/")}>
          FS.dev
        </a>
        <h1>Blog</h1>
        <p>{BLOG_DESCRIPTION}</p>
      </header>
      <section className="blog-list" aria-label="Blog posts">
        {posts.map((item) => {
          const writtenAt = formatDate(item.date);

          return (
            <article key={item.slug} className="blog-listItem">
              <a href={postHref(item)}>
                <h2>{item.title}</h2>
              </a>
              <div className="blog-meta">
                {writtenAt ? <time dateTime={item.date}>{writtenAt}</time> : null}
                <span>{item.readingMinutes} min read</span>
              </div>
              {item.summary ? <p>{item.summary}</p> : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
