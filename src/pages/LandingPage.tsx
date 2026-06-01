import { type MouseEvent, useEffect, useRef, useState } from "react";

const configuredBasePath = import.meta.env.BASE_URL || "/";
const basePath = configuredBasePath.replace(/\/$/, "");
const homeHref = configuredBasePath;
const blogHref = `${basePath}/blog`;
const contextMenuWidth = 180;
const contextMenuHeight = 98;
const contextMenuMargin = 8;

type LandingPageProps = {
  onAskAi: () => void;
  onOpenTerminal: () => void;
};

const recognitionItems = [
  "Managing multiple freelancers",
  "Rebuilding the same product twice",
  "Missing deadlines despite active development",
  "Feeling unable to evaluate technical decisions",
  "Watching momentum disappear into execution",
];

const caseStudies = [
  {
    before: "MVP",
    after: "Paying Customers",
    situation:
      "A founder needed a usable product path before committing months of spend.",
    outcome:
      "The work narrowed to the smallest production-ready slice, with enough evidence to charge real users and continue from proof instead of opinion.",
  },
  {
    before: "Prototype",
    after: "Production System",
    situation:
      "The demo worked, but delivery risk lived between experiments, releases, and support.",
    outcome:
      "The prototype became a governed production path with explicit decisions, release checks, and visible ownership after launch.",
  },
  {
    before: "Unstable Platform",
    after: "Reliable Operations",
    situation:
      "A live system had become hard to trust under load, change, and operational pressure.",
    outcome:
      "Failure paths were bounded, recovery became inspectable, and reliability could be judged from evidence instead of reassurance.",
  },
];

const ownershipPrinciples = [
  {
    title: "Decisions get named.",
    body: "Tradeoffs, constraints, and risks are made explicit before they turn into hidden delays.",
  },
  {
    title: "Delivery stays owned.",
    body: "Planning, implementation, release, and follow-through are treated as one responsibility.",
  },
  {
    title: "Reliability is visible.",
    body: "The system should leave enough evidence to understand what happened and what needs attention.",
  },
];

function ArrowTitle({ before, after }: { before: string; after: string }) {
  return (
    <span className="landing-caseTitleText">
      <span>{before}</span>
      <span aria-hidden="true">{"\u2192"}</span>
      <span>{after}</span>
    </span>
  );
}

function getContextMenuPosition(clientX: number, clientY: number) {
  if (typeof window === "undefined") {
    return { x: clientX, y: clientY };
  }

  return {
    x: Math.min(
      Math.max(clientX, contextMenuMargin),
      Math.max(
        contextMenuMargin,
        window.innerWidth - contextMenuWidth - contextMenuMargin,
      ),
    ),
    y: Math.min(
      Math.max(clientY, contextMenuMargin),
      Math.max(
        contextMenuMargin,
        window.innerHeight - contextMenuHeight - contextMenuMargin,
      ),
    ),
  };
}

export default function LandingPage({
  onAskAi,
  onOpenTerminal,
}: LandingPageProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    firstMenuItemRef.current?.focus();

    const close = () => setContextMenu(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  const openContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setContextMenu(getContextMenuPosition(event.clientX, event.clientY));
  };

  const runContextAction = (action: () => void) => {
    setContextMenu(null);
    action();
  };

  return (
    <main className="landing-page" onContextMenu={openContextMenu}>
      <section className="landing-hero" aria-labelledby="landing-title">
        <header className="landing-header" aria-label="Primary">
          <a className="landing-brand" href={homeHref}>
            MILAD
          </a>
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href={blogHref}>Thinking</a>
            <a href="#about">About</a>
          </nav>
        </header>

        <div className="landing-heroCenter">
          <div className="landing-heroCopy">
            <h1 id="landing-title" className="landing-title">
              <span>You don&apos;t need another developer.</span>
              <span>You need someone who owns execution.</span>
            </h1>
            <p>
              Products stall when nobody owns technical decisions, delivery,
              and long-term reliability.
            </p>
          </div>

          <nav className="landing-heroActions" aria-label="Explore">
            <a className="landing-action landing-actionPrimary" href="#approach">
              See how I work
            </a>
            <a className="landing-action" href="#work">
              Read case studies
            </a>
          </nav>
        </div>
      </section>

      <section
        className="landing-section landing-recognition"
        aria-labelledby="recognition-title"
      >
        <div className="landing-sectionInner">
          <p className="landing-kicker">Recognition</p>
          <h2 id="recognition-title">Founders often arrive here after:</h2>
          <ul className="landing-recognitionList">
            {recognitionItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="approach"
        className="landing-section landing-approach"
        aria-labelledby="approach-title"
      >
        <div className="landing-statement">
          <p className="landing-kicker">Execution ownership</p>
          <h2 id="approach-title">
            I step in as the person responsible for execution.
          </h2>
        </div>
      </section>

      <section
        id="work"
        className="landing-section landing-work"
        aria-labelledby="work-title"
      >
        <div className="landing-sectionInner">
          <header className="landing-sectionHeader">
            <p className="landing-kicker">Selected work</p>
            <h2 id="work-title">
              Case studies where ownership changed the outcome.
            </h2>
          </header>

          <div className="landing-caseList">
            {caseStudies.map((item) => (
              <article
                className="landing-caseStudy"
                key={`${item.before}-${item.after}`}
              >
                <h3>
                  <ArrowTitle before={item.before} after={item.after} />
                </h3>
                <div className="landing-caseBody">
                  <p>{item.situation}</p>
                  <p>{item.outcome}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="landing-section landing-about"
        aria-labelledby="about-title"
      >
        <div className="landing-sectionInner landing-aboutGrid">
          <div>
            <p className="landing-kicker">Quiet credibility</p>
            <h2 id="about-title">I work where delivery risk is the problem.</h2>
          </div>
          <div
            className="landing-principles"
            aria-label="How execution is owned"
          >
            {ownershipPrinciples.map((item) => (
              <section key={item.title} className="landing-principle">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      {contextMenu ? (
        <div
          className="landing-contextMenu"
          role="menu"
          aria-label="Page actions"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            ref={firstMenuItemRef}
            type="button"
            role="menuitem"
            onClick={() => runContextAction(onAskAi)}
          >
            Ask AI
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runContextAction(onOpenTerminal)}
          >
            Open Terminal
          </button>
        </div>
      ) : null}
    </main>
  );
}
