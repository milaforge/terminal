import { SELECTED_CASES } from "@data/selectedCases";
import servicesData from "@data/services.json";
import Terminal from "@components/terminal";
import { WorkCaseModal } from "@components/terminal-line/segments/WorkGrid";
import { withBasePath } from "@utils/appRouting";
import { CalendarCheck, Github, Mail, Send, TerminalSquare } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";

type LandingPageProps = {
  email: string;
  onBookCall: () => void;
};

const TELEGRAM_URL = "https://t.me/milaforge";
const GITHUB_URL = "https://github.com/milaforge";
const MENU_MARGIN = 12;
const MENU_WIDTH = 72;
const MENU_HEIGHT = 56;

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
  const visibleServices = servicesData.services.slice(0, 4);
  const [openCaseIndex, setOpenCaseIndex] = useState<number | null>(null);
  const [activeWorkCategory, setActiveWorkCategory] = useState(SELECTED_CASES[0]?.eyebrow ?? "");
  const [activeServiceId, setActiveServiceId] = useState(visibleServices[0]?.id ?? "");
  const activeService =
    visibleServices.find((service) => service.id === activeServiceId) ?? visibleServices[0];
  const workCategories = SELECTED_CASES.reduce<Array<{ label: string; cases: typeof SELECTED_CASES }>>(
    (categories, item) => {
      const existingCategory = categories.find((category) => category.label === item.eyebrow);
      if (existingCategory) {
        existingCategory.cases.push(item);
      } else {
        categories.push({ label: item.eyebrow, cases: [item] });
      }
      return categories;
    },
    [],
  );
  const activeWork =
    workCategories.find((category) => category.label === activeWorkCategory) ?? workCategories[0];
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    document.title = "Milad | Product, Reliability, and Automation Engineering";
    setMeta(
      "description",
      "Product engineering for founders and software teams moving from working prototype to operated system.",
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

  useEffect(() => {
    if (!contextMenu) return;

    const closeContextMenu = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest(".landing-contextMenu")) return;
      setContextMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };

    document.addEventListener("mousedown", closeContextMenu);
    document.addEventListener("scroll", closeContextMenu, true);
    document.addEventListener("contextmenu", closeContextMenu, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeContextMenu);
      document.removeEventListener("scroll", closeContextMenu, true);
      document.removeEventListener("contextmenu", closeContextMenu, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [contextMenu]);

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as Element | null;
    if (
      target?.closest(
        "a, button, input, textarea, select, .landing-contextMenu, .story-terminalOverlay, .t-root",
      )
    ) {
      return;
    }

    event.preventDefault();
    const maxX = Math.max(
      MENU_MARGIN,
      window.innerWidth - MENU_WIDTH - MENU_MARGIN,
    );
    const maxY = Math.max(
      MENU_MARGIN,
      window.innerHeight - MENU_HEIGHT - MENU_MARGIN,
    );
    setContextMenu({
      x: Math.min(Math.max(event.clientX, MENU_MARGIN), maxX),
      y: Math.min(Math.max(event.clientY, MENU_MARGIN), maxY),
    });
  };

  const openTerminalFromContextMenu = () => {
    setTerminalOpen(true);
    setContextMenu(null);
  };

  return (
    <main className="landing-page" onContextMenu={handleContextMenu}>
      <header className="landing-nav" aria-label="Primary">
        <a className="landing-brand" href={withBasePath("/")}>Milad</a>
        <nav className="landing-links" aria-label="Site sections">
          <a href="#services">Fit</a>
          <a href="#proof">Work</a>
          <a href={withBasePath("/blog/")}>Blog</a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-heroCopy">
          <p className="landing-eyebrow">For founders and software teams</p>
          <h1 id="landing-title">When a product starts to matter, the engineering changes. I handle that transition.</h1>
          <p>
            I work where demos turn into obligations: release paths, failure boundaries,
            operating cost, review points, and the small decisions that decide whether a
            system stays usable after launch.
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
          <p className="landing-eyebrow">Fit</p>
          <h2 id="services-title">Pick the situation that sounds like yours.</h2>
        </div>
        <div className="landing-serviceExplorer">
          <div className="landing-serviceSelector" role="tablist" aria-label="Project situations">
            {visibleServices.map((service) => {
              const isActive = activeService?.id === service.id;

              return (
                <button
                  className="landing-serviceTab"
                  type="button"
                  role="tab"
                  onClick={() => setActiveServiceId(service.id)}
                  aria-selected={isActive}
                  aria-controls="service-detail"
                  id={`service-tab-${service.id}`}
                  key={service.id}
                >
                  {service.title}
                </button>
              );
            })}
          </div>
          {activeService ? (
            <article
              className="landing-serviceDetail"
              id="service-detail"
              role="tabpanel"
              aria-labelledby={`service-tab-${activeService.id}`}
            >
              <p>{activeService.hook}</p>
              <ul>
                {activeService.fits.map((fit) => (
                  <li key={fit}>{fit}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </section>

      <section className="landing-section" id="proof" aria-labelledby="proof-title">
        <div className="landing-sectionIntro">
          <p className="landing-eyebrow">Selected work</p>
          <h2 id="proof-title">A few things worth opening.</h2>
        </div>
        <div className="landing-workExplorer">
          <div className="landing-workIndex" role="tablist" aria-label="Selected work categories">
            {workCategories.map((category) => {
              const isActive = activeWork?.label === category.label;

              return (
                <button
                  className="landing-workTab"
                  type="button"
                  role="tab"
                  onClick={() => setActiveWorkCategory(category.label)}
                  aria-selected={isActive}
                  aria-controls="work-detail"
                  id={`work-tab-${category.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  key={category.label}
                >
                  <span>{category.label}</span>
                  <small>{category.cases.length} {category.cases.length === 1 ? "case" : "cases"}</small>
                </button>
              );
            })}
          </div>
          {activeWork ? (
            <div
              className="landing-workDetail"
              id="work-detail"
              role="tabpanel"
              aria-labelledby={`work-tab-${activeWork.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              <div className="landing-workDetailHeader">
                <p>{activeWork.label}</p>
                <span>{activeWork.cases.length} {activeWork.cases.length === 1 ? "selected case" : "selected cases"}</span>
              </div>
              <div className="landing-workItems">
                {activeWork.cases.map((item) => {
                  const caseIndex = SELECTED_CASES.findIndex((selectedCase) => selectedCase.title === item.title);

                  return (
                    <article className="landing-workItem" key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.oneLiner}</p>
                      <button
                        className="landing-caseDetails"
                        type="button"
                        onClick={() => setOpenCaseIndex(caseIndex)}
                      >
                        Open details
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="landing-cta" id="contact" aria-labelledby="cta-title">
        <div>
          <p className="landing-eyebrow">Next step</p>
          <h2 id="cta-title">Bring the current risk, bottleneck, or product question.</h2>
          <p>We can reduce it to the next decision, the constraint behind it, and the smallest build path that proves something real.</p>
        </div>
        <div className="landing-actions">
          <button className="landing-action is-primary" type="button" onClick={onBookCall}>
            <CalendarCheck size={17} aria-hidden="true" />
            Book a call
          </button>
          <a className="landing-action" href={withBasePath("/blog/")}>
            Read the blog
          </a>
        </div>
      </section>
      {contextMenu ? (
        <div
          className="t-contextMenu landing-contextMenu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
          aria-label="Landing page actions"
        >
          <button
            type="button"
            className="t-contextMenuItem landing-contextTerminal t-pressable"
            onClick={openTerminalFromContextMenu}
            aria-label="Open terminal"
            title="Open terminal"
          >
            <TerminalSquare size={20} aria-hidden="true" />
          </button>
        </div>
      ) : null}
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
