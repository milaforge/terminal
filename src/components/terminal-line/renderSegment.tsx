import type {
  ActivityTreeSegment,
  AvatarSegment,
  ClientProofSegment,
  CommandSegment,
  CopySegment,
  FaqSegment,
  LineSegment,
  LinkSegment,
  LogSegment,
  MarkdownSegment,
  OperatingModelSegment,
  SearchHitsSegment as SearchHitsSegmentType,
  ServicesSegment,
  WorkSegment,
} from "@types";
import { MarkdownBlock } from "@components/MarkdownBlock";
import { ClientProofStrip } from "@components/ClientProofStrip";
import type { ExecuteCommand } from "./types";
import { ActivityTree } from "./segments/ActivityTree";
import { AvatarMessageSegment } from "./segments/AvatarMessageSegment";
import { CopyButton } from "./segments/CopyButton";
import { FaqAccordion, LogAccordion } from "./segments/Accordions";
import { OperatingModel } from "./segments/OperatingModel";
import { SearchHits } from "./segments/SearchHits";
import { Services } from "./segments/Services";
import { SparkleCommandButton } from "./segments/SparkleCommandButton";
import { WorkGrid } from "./segments/WorkGrid";

export function renderSegment(
  segment: LineSegment,
  key: string,
  executeCommand: ExecuteCommand,
) {
  switch (segment.type) {
    case "text":
      return <span key={key}>{segment.text}</span>;
    case "link": {
      const attrs = segment as LinkSegment;
      const ariaLabel = attrs.ariaLabel || attrs.label;
      return (
        <a
          key={key}
          className="t-link"
          href={attrs.href}
          aria-label={ariaLabel}
          target={attrs.newTab ? "_blank" : undefined}
          rel={attrs.newTab ? "noopener noreferrer" : undefined}
        >
          {attrs.label}
        </a>
      );
    }
    case "avatar":
      return (
        <AvatarMessageSegment
          key={key}
          segment={segment as AvatarSegment}
          executeCommand={executeCommand}
        />
      );
    case "command": {
      const attrs = segment as CommandSegment;
      const ariaLabel = attrs.ariaLabel || `Run ${attrs.command}`;
      if (attrs.variant === "sparkle") {
        return (
          <SparkleCommandButton
            key={key}
            label={attrs.label}
            ariaLabel={ariaLabel}
            onClick={() =>
              executeCommand(attrs.command, { typing: attrs.typing })
            }
          />
        );
      }
      const variantClass =
        attrs.variant === "primary"
          ? " is-primary"
          : attrs.variant === "secondary"
            ? " is-secondary"
            : attrs.variant === "link"
              ? " is-link"
              : "";
      return (
        <button
          key={key}
          type="button"
          className={`t-commandLink t-pressable${variantClass}`}
          onClick={() =>
            executeCommand(attrs.command, { typing: attrs.typing })
          }
          aria-label={ariaLabel}
        >
          <span className="t-commandLabel">{attrs.label}</span>
        </button>
      );
    }
    case "copy": {
      return <CopyButton key={key} segment={segment as CopySegment} />;
    }
    case "faq": {
      const faq = segment as FaqSegment;
      return <FaqAccordion key={key} items={faq.items} />;
    }
    case "logs": {
      const logs = segment as LogSegment;
      return <LogAccordion key={key} items={logs.items} />;
    }
    case "markdown": {
      return <MarkdownBlock key={key} segment={segment as MarkdownSegment} />;
    }
    case "work": {
      return <WorkGrid key={key} segment={segment as WorkSegment} />;
    }
    case "operatingModel": {
      return (
        <OperatingModel key={key} segment={segment as OperatingModelSegment} />
      );
    }
    case "clientProof": {
      return (
        <ClientProofStrip key={key} segment={segment as ClientProofSegment} />
      );
    }
    case "activityTree": {
      return (
        <ActivityTree
          key={key}
          segment={segment as ActivityTreeSegment}
          executeCommand={executeCommand}
        />
      );
    }
    case "services": {
      return (
        <Services
          key={key}
          segment={segment as ServicesSegment}
          executeCommand={executeCommand}
        />
      );
    }
    case "searchHits": {
      return (
        <SearchHits
          key={key}
          segment={segment as SearchHitsSegmentType}
          executeCommand={executeCommand}
        />
      );
    }
    default:
      return null;
  }
}
