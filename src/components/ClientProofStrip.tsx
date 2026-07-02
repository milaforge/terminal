import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getClientProofAriaLabel } from "@data/clientProof";
import type { ClientProofItem, ClientProofSegment } from "@types";

type ClientProofStripProps = {
  segment: ClientProofSegment;
};

type TooltipRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
};

type ClientTooltipPositionInput = {
  anchorRect: TooltipRect;
  tooltipWidth: number;
  tooltipHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  preferredCenterX?: number;
  preferredTop?: number;
  margin?: number;
  gap?: number;
};

export function getClientTooltipPosition({
  anchorRect,
  tooltipWidth,
  tooltipHeight,
  viewportWidth,
  viewportHeight,
  preferredCenterX,
  preferredTop,
  margin = 12,
  gap = 10,
}: ClientTooltipPositionInput) {
  const width = Math.min(tooltipWidth, Math.max(0, viewportWidth - margin * 2));
  const minX = margin;
  const maxX = Math.max(minX, viewportWidth - margin - width);
  const anchorCenter = anchorRect.left + anchorRect.width / 2;
  const tooltipCenter = preferredCenterX ?? anchorCenter;
  const x = Math.min(Math.max(tooltipCenter - width / 2, minX), maxX);
  const maxY = Math.max(margin, viewportHeight - margin - tooltipHeight);
  const y = Math.min(Math.max(preferredTop ?? anchorRect.bottom + gap, margin), maxY);
  const arrowX = Math.min(Math.max(anchorCenter - x, 18), Math.max(18, width - 18));

  return { x, y, width, arrowX };
}

export function ClientProofStrip({ segment }: ClientProofStripProps) {
  const [activeClient, setActiveClient] = useState<ClientProofItem | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const instanceId = useId().replace(/:/g, "");
  const headingId = `intro-client-proof-title-${instanceId}`;

  useEffect(() => {
    if (!activeClient) return;

    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveClient(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeClient]);

  const modal =
    activeClient && typeof document !== "undefined"
      ? createPortal(
          <div
            className="intro-clientModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`intro-client-modal-title-${instanceId}-${activeClient.slug}`}
            onClick={() => setActiveClient(null)}
          >
            <div
              className="intro-clientModalPanel"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={closeButtonRef}
                type="button"
                className="intro-clientModalClose"
                aria-label="Close client details"
                onClick={() => setActiveClient(null)}
              >
                x
              </button>
              <img
                className="intro-clientModalLogo"
                src={activeClient.logoPath}
                alt={`${activeClient.name} logo`}
                decoding="async"
              />
              <span
                id={`intro-client-modal-title-${instanceId}-${activeClient.slug}`}
                className="intro-clientModalTitle"
              >
                {activeClient.name} <span className="intro-clientModalDomain">({activeClient.domain})</span>
              </span>
              <span className="intro-clientModalRow">
                {activeClient.proof}
              </span>
            </div>
          </div>,
          document.body,
        )
      : null;

  const updateTooltipPosition = (button: HTMLButtonElement) => {
    const tooltip = button.querySelector<HTMLElement>(".intro-clientTooltip");
    if (!tooltip) return;

    const gridRect = button
      .closest<HTMLElement>(".intro-clientGrid")
      ?.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const position = getClientTooltipPosition({
      anchorRect: button.getBoundingClientRect(),
      tooltipWidth: tooltipRect.width || 320,
      tooltipHeight: tooltipRect.height || 120,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      preferredCenterX: gridRect
        ? gridRect.left + gridRect.width / 2
        : undefined,
      preferredTop: gridRect ? gridRect.bottom + 10 : undefined,
    });

    tooltip.style.setProperty("--intro-tooltip-x", `${position.x}px`);
    tooltip.style.setProperty("--intro-tooltip-y", `${position.y}px`);
    tooltip.style.setProperty("--intro-tooltip-width", `${position.width}px`);
    tooltip.style.setProperty("--intro-tooltip-arrow-x", `${position.arrowX}px`);
  };

  return (
    <>
      <span
        className="intro-clientProof"
        aria-label={segment.title ? undefined : "Trusted client examples"}
        aria-labelledby={segment.title ? headingId : undefined}
      >
        {segment.title ? (
          <span id={headingId} className="intro-proofLabel">
            {segment.title}
          </span>
        ) : null}
        <span className="intro-clientGrid" role="list">
          {segment.items.map((item) => {
            const tooltipId = `intro-client-${instanceId}-${item.slug}-tooltip`;
            return (
              <span
                key={item.slug}
                className="intro-clientSlot"
                role="listitem"
              >
                <button
                  type="button"
                  className="intro-clientItem"
                  aria-label={getClientProofAriaLabel(item)}
                  aria-describedby={tooltipId}
                  aria-haspopup="dialog"
                  aria-expanded={activeClient?.slug === item.slug}
                  onMouseEnter={(event) => updateTooltipPosition(event.currentTarget)}
                  onFocus={(event) => updateTooltipPosition(event.currentTarget)}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveClient(item);
                  }}
                >
                  <img
                    src={item.logoPath}
                    alt={`${item.name} logo`}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                  <span
                    id={tooltipId}
                    className="intro-clientTooltip"
                    role="tooltip"
                  >
                    <span className="intro-clientTooltipTitle">
                      {item.name} <span className="intro-clientModalDomain">({item.domain})</span>
                    </span>
                    <span className="intro-clientTooltipRow">
                      {item.proof} 
                    </span>
                  </span>
                </button>
              </span>
            );
          })}
        </span>
      </span>
      {modal}
    </>
  );
}
