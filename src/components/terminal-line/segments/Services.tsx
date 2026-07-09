import { useCallback, useRef, useState } from "react";
import type { ServiceItem, ServicesSegment } from "@types";
import type { ExecuteCommand } from "../types";

/**
 * TUI-style selector, one layer at a time:
 *   1. service list — numbered rows with a ❯ caret, arrow-key navigable
 *   2. one service — ✓ checklist of fits + prev/next pager
 *   3. examples — detail examples expand inline, case examples run a command
 */
export function Services({
  segment,
  executeCommand,
}: {
  segment: ServicesSegment;
  executeCommand: ExecuteCommand;
}) {
  const services = segment.services || [];
  const [serviceId, setServiceId] = useState<string | null>(
    segment.initialServiceId ?? null,
  );
  const [showExamples, setShowExamples] = useState(false);
  const [openExampleId, setOpenExampleId] = useState<string | null>(null);

  const activeIndex = serviceId
    ? services.findIndex((service) => service.id === serviceId)
    : -1;
  const active = activeIndex >= 0 ? services[activeIndex] : undefined;

  const openService = (id: string) => {
    setServiceId(id);
    setShowExamples(false);
    setOpenExampleId(null);
  };

  const backToList = () => {
    setServiceId(null);
    setShowExamples(false);
    setOpenExampleId(null);
  };

  if (!active) {
    return (
      <div className="t-services">
        {segment.intro ? (
          <div className="t-servicesPrompt">
            <span className="t-servicesPromptMark" aria-hidden="true">
              ?
            </span>
            <span className="t-servicesPromptText">{segment.intro}</span>
          </div>
        ) : null}
        <ServicePicker services={services} onPick={openService} />
      </div>
    );
  }

  return (
    <div className="t-services">
      <button
        type="button"
        className="t-servicesBack"
        onClick={backToList}
        aria-label="Back to all services"
      >
        <span aria-hidden="true">←</span> ~/services
      </button>

      <div className="t-servicesDetail" key={active.id}>
        <div className="t-servicesTitleRow">
          <span className="t-servicesIndex" aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="t-servicesTitle">{active.title}</div>
            <div className="t-servicesHook">{active.hook}</div>
          </div>
        </div>

        <div className="t-servicesFitsLabel" aria-hidden="true">
          this fits if
        </div>
        <ul className="t-servicesFits" aria-label="When this fits">
          {active.fits.map((fit) => (
            <li key={fit}>
              <span className="t-servicesCheck" aria-hidden="true">
                ✓
              </span>
              {fit}
            </li>
          ))}
        </ul>

        {active.examples.length && !showExamples ? (
          <button
            type="button"
            className="t-servicesExamplesToggle"
            onClick={() => setShowExamples(true)}
          >
            See examples <span aria-hidden="true">→</span>
          </button>
        ) : null}

        {showExamples ? (
          <ServiceExamples
            service={active}
            openExampleId={openExampleId}
            onToggleExample={(id) =>
              setOpenExampleId((prev) => (prev === id ? null : id))
            }
            executeCommand={executeCommand}
          />
        ) : null}

        <ServicePager
          services={services}
          activeIndex={activeIndex}
          onPick={openService}
        />
      </div>
    </div>
  );
}

function ServicePicker({
  services,
  onPick,
}: {
  services: ServiceItem[];
  onPick: (id: string) => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState(0);

  const moveFocus = useCallback((index: number) => {
    setFocusIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = services.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowDown" || event.key === "j") {
      next = index >= last ? 0 : index + 1;
    } else if (event.key === "ArrowUp" || event.key === "k") {
      next = index <= 0 ? last : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    } else if (/^[1-9]$/.test(event.key)) {
      const target = Number(event.key) - 1;
      if (target <= last) {
        event.preventDefault();
        onPick(services[target].id);
      }
      return;
    }

    if (next !== null) {
      event.preventDefault();
      moveFocus(next);
    }
  };

  return (
    <ul className="t-servicesList">
      {services.map((service, index) => (
        <li key={service.id} style={{ "--i": index } as React.CSSProperties}>
          <button
            type="button"
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className="t-servicesItem"
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => onPick(service.id)}
            onFocus={() => setFocusIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            aria-label={`Open ${service.title}`}
          >
            <span className="t-servicesCaret" aria-hidden="true">
              ❯
            </span>
            <span className="t-servicesIndex" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="t-servicesItemTitle">{service.title}</span>
            <span className="t-servicesItemHook">{service.hook}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ServicePager({
  services,
  activeIndex,
  onPick,
}: {
  services: ServiceItem[];
  activeIndex: number;
  onPick: (id: string) => void;
}) {
  const prev = activeIndex > 0 ? services[activeIndex - 1] : null;
  const next =
    activeIndex < services.length - 1 ? services[activeIndex + 1] : null;

  return (
    <nav className="t-servicesPager" aria-label="More services">
      {prev ? (
        <button
          type="button"
          className="t-servicesPagerLink"
          onClick={() => onPick(prev.id)}
        >
          <span aria-hidden="true">←</span>
          <span className="t-servicesPagerTitle">{prev.title}</span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button
          type="button"
          className="t-servicesPagerLink is-next"
          onClick={() => onPick(next.id)}
        >
          <span className="t-servicesPagerTitle">{next.title}</span>
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}

function ServiceExamples({
  service,
  openExampleId,
  onToggleExample,
  executeCommand,
}: {
  service: ServiceItem;
  openExampleId: string | null;
  onToggleExample: (id: string) => void;
  executeCommand: ExecuteCommand;
}) {
  return (
    <ul className="t-servicesExamples" aria-label={`${service.title} examples`}>
      {service.examples.map((example) => {
        const isOpen = openExampleId === example.id;
        return (
          <li key={example.id} className="t-servicesExample">
            {example.command ? (
              <button
                type="button"
                className="t-servicesExampleName is-run"
                onClick={() => executeCommand(example.command!)}
                aria-label={`Open case study: ${example.name}`}
              >
                <span className="t-servicesExamplePrefix" aria-hidden="true">
                  $
                </span>
                {example.name}
                <span className="t-servicesRun" aria-hidden="true">
                  RUN
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="t-servicesExampleName"
                onClick={() => onToggleExample(example.id)}
                aria-expanded={isOpen}
              >
                <span className="t-servicesExamplePrefix" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
                {example.name}
              </button>
            )}

            {isOpen && !example.command ? (
              <dl className="t-servicesExampleBody">
                {(
                  [
                    ["The idea", example.idea],
                    ["How I proceeded", example.approach],
                    ["Outcome", example.outcome],
                  ] as const
                ).map(([label, value]) =>
                  value ? (
                    <div key={label} className="t-servicesExampleRow">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
