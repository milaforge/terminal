import { useState } from "react";
import type { ServiceItem, ServicesSegment } from "@types";
import type { ExecuteCommand } from "../types";

/**
 * Progressive disclosure, one layer at a time:
 *   1. service list (title + hook)
 *   2. one service (when it fits) + optional "see examples"
 *   3. examples; detail examples expand inline, case examples run a command
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

  const active = serviceId
    ? services.find((service) => service.id === serviceId)
    : undefined;

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
          <div className="t-servicesIntro">{segment.intro}</div>
        ) : null}
        <ul className="t-servicesList">
          {services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                className="t-servicesItem"
                onClick={() => openService(service.id)}
                aria-label={`Open ${service.title}`}
              >
                <span className="t-servicesItemTitle">{service.title}</span>
                <span className="t-servicesItemHook">{service.hook}</span>
                <span className="t-servicesArrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
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
        ← services
      </button>

      <div className="t-servicesDetail">
        <div className="t-servicesTitle">{active.title}</div>
        <div className="t-servicesHook">{active.hook}</div>

        <ul className="t-servicesFits" aria-label="When this fits">
          {active.fits.map((fit) => (
            <li key={fit}>{fit}</li>
          ))}
        </ul>

        {active.examples.length && !showExamples ? (
          <button
            type="button"
            className="t-servicesExamplesToggle"
            onClick={() => setShowExamples(true)}
          >
            See examples →
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
      </div>
    </div>
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
                className="t-servicesExampleName"
                onClick={() => executeCommand(example.command!)}
                aria-label={`Open case study: ${example.name}`}
              >
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
                {example.name}
                <span className="t-servicesChevron" aria-hidden="true">
                  {isOpen ? "▾" : "▸"}
                </span>
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
