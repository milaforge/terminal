import type { LandingSectionId, SectionNavigation } from "./types";

const sectionLabels: Record<LandingSectionId, string> = {
  hero: "Home",
  recognition: "Recognition",
  approach: "Approach",
  work: "Case studies",
  about: "About",
};

type SectionProgressProps = {
  activeSection: LandingSectionId;
  sections: readonly LandingSectionId[];
  onNavigate: SectionNavigation;
};

export function SectionProgress({
  activeSection,
  sections,
  onNavigate,
}: SectionProgressProps) {
  return (
    <nav className="landing-sectionProgress" aria-label="Section progress">
      {sections.map((sectionId, index) => {
        const isActive = sectionId === activeSection;
        const sectionLabel = sectionLabels[sectionId];

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            aria-label={`Go to ${sectionLabel}, section ${index + 1} of ${sections.length}`}
            className="landing-sectionProgressDot"
            data-active={isActive ? "true" : undefined}
            key={sectionId}
            onClick={() => onNavigate(sectionId)}
            type="button"
          />
        );
      })}
    </nav>
  );
}
