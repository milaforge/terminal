import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SampleWork, WorkSegment } from "@types";
import { MarkdownBlock } from "@components/MarkdownBlock";
import { ClientProofStrip } from "@components/ClientProofStrip";
import { getSelectedCaseMetric } from "@data/selectedCases";


export function getWorkCardSummary(item: SampleWork): string {
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

export function WorkGrid({ segment }: { segment: WorkSegment }) {
  const items = segment.items || [];
  const initialOpenIndex = getInitialWorkModalIndex(segment);
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  const openItem = openIndex !== null ? items[openIndex] : null;

  useEffect(() => {
    setOpenIndex(initialOpenIndex);
  }, [initialOpenIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex]);

  const getCardSummary = getWorkCardSummary;

  const getSpark = buildWorkSpark;



  const modalMarkdown = openItem ? openItem.description.trim() : "";

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
          aria-label={`${openItem.title} details`}
          onClick={() => setOpenIndex(null)}
        >
          <div className="t-workModal" onClick={(e) => e.stopPropagation()}>
            <div className="t-workModalHead">
              <div>
                <div className="t-workModalEyebrow">Case study</div>
                <div className="t-workModalTitle">{openItem.title}</div>
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
              <button
                type="button"
                className="t-workModalClose"
                onClick={() => setOpenIndex(null)}
                aria-label="Close case study"
              >
                ×
              </button>
            </div>
            <div className="t-proofModalBody">
              <div className="t-proofMarkdown t-proofModalMarkdown">
                <MarkdownBlock
                  segment={{ type: "markdown", markdown: modalMarkdown }}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
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
