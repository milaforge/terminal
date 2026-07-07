import { useEffect, useId, useState } from "react";
import { getClientProofAriaLabel } from "@data/clientProof";
import type { ClientProofItem, ClientProofSegment } from "@types";

type ClientProofStripProps = {
  segment: ClientProofSegment;
};

export function ClientProofStrip({ segment }: ClientProofStripProps) {
  const [activeClient, setActiveClient] = useState<ClientProofItem | null>(null);
  const instanceId = useId().replace(/:/g, "");
  const headingId = `intro-client-proof-title-${instanceId}`;
  const modalTitleId = activeClient
    ? `intro-client-modal-title-${instanceId}-${activeClient.slug}`
    : undefined;

  useEffect(() => {
    if (!activeClient) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveClient(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeClient]);

  return (
    <>
      <span
        className="intro-clientProof"
        aria-label={segment.title ? undefined : "Trusted client examples"}
        aria-labelledby={segment.title ? headingId : undefined}
        onMouseLeave={() => setActiveClient(null)}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setActiveClient(null);
          }
        }}
      >
        {segment.title ? (
          <span id={headingId} className="intro-proofLabel">
            {segment.title}
          </span>
        ) : null}
        <span className="intro-clientGrid" role="list">
          {segment.items.map((item) => {
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
                  aria-haspopup="dialog"
                  aria-expanded={activeClient?.slug === item.slug}
                  onMouseEnter={() => setActiveClient(item)}
                  onFocus={() => setActiveClient(item)}
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
                </button>
              </span>
            );
          })}
        </span>
        {activeClient ? (
          <span
            className="intro-clientModal"
            role="dialog"
            aria-modal="false"
            aria-labelledby={modalTitleId}
          >
            <span className="intro-clientModalPanel">
              <img
                className="intro-clientModalLogo"
                src={activeClient.logoPath}
                alt={`${activeClient.name} logo`}
                decoding="async"
              />
              <span
                id={modalTitleId}
                className="intro-clientModalTitle"
              >
                {activeClient.name} <span className="intro-clientModalDomain">({activeClient.domain})</span>
              </span>
              <span className="intro-clientModalRow">
                {activeClient.proof}
              </span>
            </span>
          </span>
        ) : null}
      </span>
    </>
  );
}
