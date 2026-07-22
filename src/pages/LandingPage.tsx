import { SELECTED_CASES } from "@data/selectedCases";
import servicesData from "@data/services.json";
import Terminal from "@components/terminal";
import { WorkCaseModal } from "@components/terminal-line/segments/WorkGrid";
import { withBasePath } from "@utils/appRouting";
import { CalendarCheck, ChevronDown, Github, Mail, Send, TerminalSquare } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";

type LandingPageProps = {
  email: string;
  onBookCall: () => void;
};

const TELEGRAM_URL = "https://t.me/milaforge";
const GITHUB_URL = "https://github.com/milaforge";

function setMeta(name: string, content: string) {
  let node = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.name = name;
    document.head.appendChild(node);
  }
  node.content = content;
}

export function LandingPage({ email, onBookCall }: LandingPageProps) {
  const defaultVisibleCaseCount = 4;
  const [showAllCases, setShowAllCases] = useState(false);
  const proofCases = showAllCases
    ? SELECTED_CASES
    : SELECTED_CASES.slice(0, defaultVisibleCaseCount);
  const hiddenCaseCount = Math.max(0, SELECTED_CASES.length - defaultVisibleCaseCount);
  const [openCaseIndex, setOpenCaseIndex] = useState<number | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    document.title = "Milad | Product, Reliability, and Automation Engineering";
    setMeta(
      "description",
      "Product engineering, launch readiness, reliability, performance, cloud cost, security, and automation services for founders and software teams.",
    );
  }, []);

  useEffect(() => {
    if (!terminalOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTerminalOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [terminalOpen]);

  return (
    <main className="landing-page">
      <header className="landing-nav" aria-label="Primary">
        <a className="landing-brand" href={withBasePath("/")}>Milad</a>
        <nav className="landing-links" aria-label="Site sections">
          <a href="#services">Services</a>
          <a href="#proof">Proof</a>
          <a href={withBasePath("/blog/")}>Blog</a>
          <button type="button" onClick={() => setTerminalOpen(true)}>Terminal</button>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-heroCopy">
          <p className="landing-eyebrow">For founders and software teams</p>
          <h1 id="landing-title">I build and harden software before real users expose the weak parts.</h1>
          <p>
            Full-stack product engineering, launch readiness, reliability, performance,
            cloud cost control, security-sensitive workflows, and practical automation.
          </p>
          <div className="landing-actions" aria-label="Primary actions">
            <button className="landing-action is-primary" type="button" onClick={onBookCall}>
              <CalendarCheck size={17} aria-hidden="true" />
              Book a call
            </button>
            <a className="landing-action" href={`mailto:${email}`}>
              <Mail size={17} aria-hidden="true" />
              Email
            </a>
            <a className="landing-iconAction" href={TELEGRAM_URL} aria-label="Telegram" title="Telegram">
              <Send size={17} aria-hidden="true" />
            </a>
            <a className="landing-iconAction" href={GITHUB_URL} aria-label="GitHub" title="GitHub">
              <Github size={17} aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="landing-proofPanel" aria-label="Selected outcomes">
          <div>
            <span>10 days</span>
            <p>Investor demo shipped for an early-stage founder</p>
          </div>
          <div>
            <span>10x</span>
            <p>Realtime throughput increase without proportional hosting cost</p>
          </div>
          <div>
            <span>60%</span>
            <p>AWS spend reduction while protecting performance</p>
          </div>
        </aside>
      </section>

      <section className="landing-section" id="services" aria-labelledby="services-title">
        <div className="landing-sectionIntro">
          <p className="landing-eyebrow">Services</p>
          <h2 id="services-title">Pick the situation that sounds like yours.</h2>
        </div>
        <div className="landing-serviceGrid">
          {servicesData.services.map((service) => (
            <article className="landing-service" key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.hook}</p>
              <ul>
                {service.fits.map((fit) => (
                  <li key={fit}>{fit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="proof" aria-labelledby="proof-title">
        <div className="landing-sectionIntro">
          <p className="landing-eyebrow">Evidence</p>
          <h2 id="proof-title">Concrete work you can inspect.</h2>
        </div>
        <div className="landing-caseList">
          {proofCases.map((item, index) => {
            const openCase = (event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              setOpenCaseIndex(index);
            };

            return (
              <a className="landing-case" href={withBasePath("/")} onClick={openCase} key={item.title}>
                <span>{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <p>{item.oneLiner}</p>
              </a>
            );
          })}
        </div>
        {hiddenCaseCount > 0 ? (
          <div className="landing-moreCases">
            <button
              className="landing-action"
              type="button"
              onClick={() => setShowAllCases((value) => !value)}
              aria-expanded={showAllCases}
              aria-controls="proof"
            >
              <ChevronDown
                className={showAllCases ? "is-open" : ""}
                size={17}
                aria-hidden="true"
              />
              {showAllCases
                ? "Show fewer"
                : `See ${hiddenCaseCount} more`}
            </button>
          </div>
        ) : null}
      </section>

      <section className="landing-cta" id="contact" aria-labelledby="cta-title">
        <div>
          <p className="landing-eyebrow">Next step</p>
          <h2 id="cta-title">Bring the current risk, bottleneck, or product question.</h2>
          <p>I will help reduce it to the smallest useful decision and a build path that can be verified.</p>
        </div>
        <div className="landing-actions">
          <button className="landing-action is-primary" type="button" onClick={onBookCall}>
            <CalendarCheck size={17} aria-hidden="true" />
            Book a call
          </button>
          <a className="landing-action" href={withBasePath("/blog/")}>
            Read the blog
          </a>
          <button
            className="landing-iconAction"
            type="button"
            onClick={() => setTerminalOpen(true)}
            aria-label="Open terminal"
            title="Open terminal"
          >
            <TerminalSquare size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
      {terminalOpen ? (
        <div
          className="story-terminalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Terminal"
        >
          <div className="story-terminalPanel">
            <button
              type="button"
              className="story-terminalClose t-pressable"
              onClick={() => setTerminalOpen(false)}
              aria-label="Close terminal"
            >
              Close
            </button>
            <div className="story-terminalBody">
              <Terminal
                contact={{ email }}
                onBookCall={onBookCall}
                controllerMode="embedded"
                showAskAi={false}
              />
            </div>
          </div>
        </div>
      ) : null}
      <WorkCaseModal
        items={SELECTED_CASES}
        openIndex={openCaseIndex}
        onClose={() => setOpenCaseIndex(null)}
        onNavigate={setOpenCaseIndex}
      />
    </main>
  );
}
