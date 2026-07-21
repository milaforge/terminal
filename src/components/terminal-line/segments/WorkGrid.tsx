import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SampleWork, WorkSegment } from "@types";
import { MarkdownBlock } from "@components/MarkdownBlock";
import { ClientProofStrip } from "@components/ClientProofStrip";
import {
  getSelectedCaseMetric,
  isSelectedCase,
} from "@data/selectedCases";
import { makeWorkSlug } from "@data/searchIndex";

const isPresentString = (value: string | undefined): value is string =>
  typeof value === "string" && value.length > 0;


export function getWorkCardSummary(item: SampleWork): string {
  if (isSelectedCase(item)) return item.oneLiner;

  const lead = item.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));

  if (!lead) return "Details coming soon.";

  return lead
    .replace(/^[-*]\s+/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

export function buildWorkSpark(points: number[]) {
  const width = 100;
  const height = 36;
  const xs = points.map(
    (_, idx) => (idx / Math.max(points.length - 1, 1)) * width,
  );
  const ys = points.map((point) => height - 2 - point * 30);
  const line = xs
    .map(
      (x, idx) =>
        `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[idx].toFixed(1)}`,
    )
    .join(" ");

  return {
    line,
    area: `${line} L ${xs[xs.length - 1].toFixed(1)} 36 L ${xs[0].toFixed(1)} 36 Z`,
    endX: xs[xs.length - 1],
    endY: ys[ys.length - 1],
  };
}

export function getInitialWorkModalIndex(segment: WorkSegment): number | null {
  const items = segment.items || [];
  return typeof segment.initialOpenIndex === "number" &&
    segment.initialOpenIndex >= 0 &&
    segment.initialOpenIndex < items.length
    ? segment.initialOpenIndex
    : null;
}

export type ScrollableModal = {
  scrollTop: number;
  scrollTo?: (options: ScrollToOptions) => void;
};

export function resetWorkModalScroll(modal: ScrollableModal | null) {
  if (!modal) return;

  if (typeof modal.scrollTo === "function") {
    modal.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  modal.scrollTop = 0;
}

export function WorkGrid({ segment }: { segment: WorkSegment }) {
  const items = segment.items || [];
  const initialOpenIndex = getInitialWorkModalIndex(segment);
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const openItem = openIndex !== null ? items[openIndex] : null;
  const openItemSlug = openItem ? makeWorkSlug(openItem.title) : "";

  useEffect(() => {
    setOpenIndex(initialOpenIndex);
  }, [initialOpenIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenIndex(null);
        return;
      }

      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, details summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    modalRef.current?.querySelector<HTMLButtonElement>(".t-workModalClose")?.focus();
  }, [openIndex]);

  const getCardSummary = getWorkCardSummary;

  const getSpark = buildWorkSpark;

  const navigateCase = (index: number) => {
    setOpenIndex(index);
    window.requestAnimationFrame(() => resetWorkModalScroll(modalRef.current));
  };

  return (
    <div className="t-work">
      <div className="t-proofHeader">
        <div className="t-proofTitle font-extralight">
        </div>
        {segment.clientProof ? (
          <ClientProofStrip segment={segment.clientProof} />
        ) : null}
        <div className="t-proofSubtitle"></div>
      </div>

      <div className="t-workGrid">
        {items.map((item, idx) => {
          const metric = getSelectedCaseMetric(item, idx);
          const spark = getSpark(metric.points);
          const display = `${metric.prefix}${metric.value.toLocaleString()}${metric.suffix}`;

          return (
            <WorkCardButton
              key={idx}
              headline={idx < 3}
              onClick={() => setOpenIndex(idx)}
              aria-label={`Open ${item.title} details`}
              metric={metric}
              metricDisplay={display}
            >
              <div className="t-workSpark" aria-hidden="true">
                <div className="t-workSparkDots" />
                <svg
                  className="t-workSparkLine"
                  viewBox="0 0 100 36"
                  preserveAspectRatio="none"
                  focusable="false"
                >
                  <path className="t-workSparkArea" d={spark.area} />
                  <path className="t-workSparkStroke" d={spark.line} pathLength={1} />
                  <circle
                    className="t-workSparkCircle"
                    cx={spark.endX}
                    cy={spark.endY}
                    r="2.4"
                  />
                </svg>
                <div className="t-workSheen" />
              </div>
              <div className="t-proofMain">
                <div className="t-workTitleRow">
                  <span className="t-workNumber">{String(idx + 1).padStart(2, "0")}</span>
                  {isSelectedCase(item) ? (
                    <span className="t-workCardEyebrow">{item.eyebrow}</span>
                  ) : null}
                </div>
                <div className="t-workTitleRow">
                  <div className="t-proofPain">{item.title}</div>
                </div>
                <div className="t-proofOutcome">{getCardSummary(item)}</div>
                <div className="t-workMetric">
                  <span className="t-workMetricValue" data-work-count>
                    {display}
                  </span>
                  <span className="t-workMetricLabel">{metric.label}</span>
                </div>
              </div>
              <div className="t-proofFooter">
                <div className="t-workTags" aria-label="Tags">
                  {(item.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="t-workTag">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="t-workArrow" aria-hidden="true">
                  →
                </span>
              </div>
            </WorkCardButton>
          );
        })}
      </div>

      {openItem ? createPortal(
        <div
          className="t-workModalBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`case-study-title-${openItemSlug}`}
          aria-describedby={
            isSelectedCase(openItem) ? `case-study-summary-${openItemSlug}` : undefined
          }
          onClick={() => setOpenIndex(null)}
        >
          <div
            ref={modalRef}
            className={`t-workModal${isSelectedCase(openItem) ? " t-workModalCase" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="t-workModalHead">
              {!isSelectedCase(openItem) ? (
                <div>
                  <div className="t-workModalEyebrow">Case study</div>
                  <div className="t-workModalTitle" id={`case-study-title-${openItemSlug}`}>
                    {openItem.title}
                  </div>
                  {openItem.tags?.length ? (
                    <div className="t-proofStats" aria-label="Case study tags">
                      {openItem.tags.map((tag) => (
                        <span key={tag} className="t-workTag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                className="t-workModalClose"
                onClick={() => setOpenIndex(null)}
                aria-label="Close case study"
              >
                ×
              </button>
            </div>
            <CaseStudyModalBody
              item={openItem}
              items={items}
              openIndex={openIndex}
              itemSlug={openItemSlug}
              navigateCase={navigateCase}
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function CaseStudyModalBody({
  item,
  items,
  openIndex,
  itemSlug,
  navigateCase,
}: {
  item: SampleWork;
  items: SampleWork[];
  openIndex: number | null;
  itemSlug: string;
  navigateCase: (index: number) => void;
}) {
  if (!isSelectedCase(item)) {
    return (
      <div className="t-proofModalBody">
        <div className="t-proofMarkdown t-proofModalMarkdown">
          <MarkdownBlock
            segment={{ type: "markdown", markdown: item.description.trim() }}
          />
        </div>
      </div>
    );
  }

  const metric = getSelectedCaseMetric(item, Math.max(openIndex ?? 0, 0));
  const metricDisplay = `${metric.prefix}${metric.value.toLocaleString()}${metric.suffix}`;
  const previousIndex = openIndex !== null && openIndex > 0 ? openIndex - 1 : null;
  const nextIndex =
    openIndex !== null && openIndex < items.length - 1 ? openIndex + 1 : null;
  const previousItem = previousIndex !== null ? items[previousIndex] : null;
  const nextItem = nextIndex !== null ? items[nextIndex] : null;

  return (
    <div className="t-caseStudy">
      <header className="t-caseStudyHero">
        <div className="t-caseStudyHeroMain">
          <div className="t-caseStudyEyebrow">{item.eyebrow}</div>
          <h2 id={`case-study-title-${itemSlug}`}>{item.title}</h2>
          <p id={`case-study-summary-${itemSlug}`}>{item.oneLiner}</p>
          {item.role ? (
            <div className="t-caseStudyRole">
              <span>My role</span>
              <strong>{item.role}</strong>
            </div>
          ) : null}
          <InlineMeta items={[item.company, item.role].filter(isPresentString)} />
        </div>
        <aside className="t-caseStudyMetric" aria-label="Primary result">
          <div className="t-caseStudyMetricValue">{metricDisplay}</div>
          <div className="t-caseStudyMetricLabel">{metric.label}</div>
        </aside>
      </header>

      <div className="t-caseStudyFlow">
        <CaseStudyStatement title="Problem" body={item.problem} />
        <CaseStudyStatement title="Decision" body={item.decision} />
        <section className="t-caseStudyPanel">
          <h3>Proof</h3>
          <ul className="t-caseStudyOutcomes" aria-label="Structured outcomes">
            {item.proof.map((highlight) => (
              <li key={highlight} className="t-caseStudyOutcome">
                {highlight}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="t-caseStudyFooter">
        {item.technologies?.length ? (
          <div className="t-caseStudyCapabilities">
            <InlineMeta title="Technologies" items={item.technologies ?? []} />
          </div>
        ) : null}

        {item.engineeringNote ? (
          <details className="t-caseStudyNotes">
            <summary>View technical decisions +</summary>
            <p><strong>Constraint:</strong> {item.engineeringNote.constraint}</p>
            <p><strong>Invariant:</strong> {item.engineeringNote.invariant}</p>
          </details>
        ) : null}

        <nav className="t-caseStudyNav" aria-label="Case navigation">
          <button
            type="button"
            onClick={() => previousIndex !== null && navigateCase(previousIndex)}
            disabled={previousIndex === null}
          >
            <span>Previous</span>
            {previousItem ? `← ${previousItem.title}` : "Previous"}
          </button>
          <button
            type="button"
            onClick={() => nextIndex !== null && navigateCase(nextIndex)}
            disabled={nextIndex === null}
          >
            <span>Next</span>
            {nextItem ? `${nextItem.title} →` : "Next"}
          </button>
        </nav>
      </footer>
    </div>
  );
}

function CaseStudyStatement({ title, body }: { title: string; body: string }) {
  return (
    <section className="t-caseStudyPanel">
      <h3>{title}</h3>
      <p>{body}</p>
    </section>
  );
}

function InlineMeta({ title, items }: { title?: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="t-caseStudyInlineMeta">
      {title ? <span>{title}</span> : null}
      <p>{items.join(" · ")}</p>
    </div>
  );
}

function WorkCardButton({
  headline,
  metric,
  metricDisplay,
  children,
  onClick,
  ...props
}: {
  headline: boolean;
  metric: { prefix: string; value: number; suffix: string };
  metricDisplay: string;
  children: ReactNode;
  onClick: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [active, setActive] = useState(false);
  const frameRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const metricElement = buttonRef.current?.querySelector("[data-work-count]");

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (!active || metric.value <= 0) {
      if (metricElement) metricElement.textContent = metricDisplay;
      return;
    }

    const start = performance.now();
    const duration = 720;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(metric.value * eased);
      if (metricElement) {
        metricElement.textContent = `${metric.prefix}${current.toLocaleString()}${metric.suffix}`;
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        if (metricElement) metricElement.textContent = metricDisplay;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (metricElement) metricElement.textContent = metricDisplay;
    };
  }, [active, metric.prefix, metric.suffix, metric.value, metricDisplay]);

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      className={`t-workCard t-proofCard${headline ? " is-headline" : ""}${active ? " is-active" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
    </button>
  );
}
