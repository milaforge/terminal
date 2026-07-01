import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  STORY_CHAPTERS,
  STORY_END_YEAR,
  STORY_START_YEAR,
  STORY_TAGLINE,
  type StoryChapter,
} from "@data/storyChapters";
import Terminal from "@components/terminal";
import ChatDock from "@components/terminal/chat";
import { useTerminalColors } from "@hooks/useTerminalColors";
import { openChat } from "@stores/chatStore";
import type { CommandButton, ContactInfo } from "@types";
import { Github, Mail, Send } from "lucide-react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import "./story.css";

const BASE = import.meta.env.BASE_URL;
const AVATAR_SRC = `${BASE}images/avatar.jpg`;
/** viewport-heights of scroll runway per scene — pacing of the scrub */
const VH_PER_SCENE = 110;
const MENU_WIDTH = 240;
const MENU_HEIGHT = 48;
const MENU_MARGIN = 6;
const SELECTED_WORK_COMMAND: CommandButton = {
  command: "selected_cases",
  typing: "simulate",
};
const TELEGRAM_URL = "https://t.me/milaforge";
const GITHUB_URL = "https://github.com/milaforge";

type StoryPageProps = {
  onBookCall: () => void;
  contact?: ContactInfo;
};

type SceneEdge = "first" | "last" | "middle";

/**
 * Maps the global scroll progress onto one scene's segment, producing
 * opacity / drift / scale that play forward on scroll-down and reverse
 * on scroll-up. Edge scenes stay visible at their outer boundary.
 */
function useSceneMotion(
  progress: MotionValue<number>,
  index: number,
  count: number,
  reduced: boolean,
) {
  const { stops, opacityOut, yOut, scaleOut } = useMemo(() => {
    const start = index / count;
    const end = (index + 1) / count;
    const span = end - start;
    const fade = span * 0.24;
    const edge: SceneEdge =
      index === 0 ? "first" : index === count - 1 ? "last" : "middle";

    const stops: number[] = [];
    const opacityOut: number[] = [];
    const yOut: number[] = [];
    const scaleOut: number[] = [];

    if (edge === "first") {
      stops.push(start);
      opacityOut.push(1);
      yOut.push(0);
      scaleOut.push(1);
    } else {
      stops.push(start, start + fade);
      opacityOut.push(0, 1);
      yOut.push(64, 0);
      scaleOut.push(0.95, 1);
    }
    if (edge === "last") {
      stops.push(end);
      opacityOut.push(1);
      yOut.push(0);
      scaleOut.push(1);
    } else {
      stops.push(end - fade, end);
      opacityOut.push(1, 0);
      yOut.push(0, -64);
      scaleOut.push(1, 1.05);
    }
    return { stops, opacityOut, yOut, scaleOut };
  }, [index, count]);

  const opacity = useTransform(progress, stops, opacityOut);
  const y = useTransform(progress, stops, reduced ? yOut.map(() => 0) : yOut);
  const scale = useTransform(
    progress,
    stops,
    reduced ? scaleOut.map(() => 1) : scaleOut,
  );
  const pointerEvents = useTransform(opacity, (v) =>
    v > 0.55 ? ("auto" as const) : ("none" as const),
  );
  return { opacity, y, scale, pointerEvents };
}

function Scene({
  progress,
  index,
  count,
  reduced,
  className,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { opacity, y, scale, pointerEvents } = useSceneMotion(
    progress,
    index,
    count,
    reduced,
  );
  return (
    <motion.section
      className={`story-scene${className ? ` ${className}` : ""}`}
      style={{ opacity, y, scale, pointerEvents }}
    >
      {children}
    </motion.section>
  );
}

function GhostYear({
  progress,
  index,
  count,
  year,
  reduced,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  year: string;
  reduced: boolean;
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const x = useTransform(progress, [start, end], reduced ? [0, 0] : [90, -90]);
  return (
    <motion.span aria-hidden className="story-ghostYear" style={{ x }}>
      {year}
    </motion.span>
  );
}

function ChapterScene({
  chapter,
  progress,
  index,
  count,
  reduced,
}: {
  chapter: StoryChapter;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reduced: boolean;
}) {
  return (
    <Scene progress={progress} index={index} count={count} reduced={reduced}>
      <div
        className="story-chapter"
        style={{ "--story-accent": chapter.accent } as CSSProperties}
      >
        <h2 className="story-hook">{chapter.hook}</h2>
        <p className="story-sub">{chapter.sub}</p>
        <GhostYear
          progress={progress}
          index={index}
          count={count}
          year={chapter.year}
          reduced={reduced}
        />
      </div>
    </Scene>
  );
}

export default function StoryPage({ onBookCall, contact }: StoryPageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [activeScene, setActiveScene] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalStartupCommand, setTerminalStartupCommand] =
    useState<CommandButton | null>(null);

  // apply the persisted terminal color theme so :root carries valid color
  // values (the stylesheet default --accent is an HSL triple, not a color)
  useTerminalColors();

  // intro + chapters + outro
  const displayChapters = useMemo(() => [...STORY_CHAPTERS].reverse(), []);
  const sceneCount = displayChapters.length + 2;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.35,
  });
  const scrub = reduced ? scrollYProgress : progress;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(
      sceneCount - 1,
      Math.max(0, Math.floor(v * sceneCount)),
    );
    setActiveScene(next);
  });

  // ambient glow drifts through each chapter's color as time passes
  const { glowStops, glowColors } = useMemo(() => {
    const glowStops = [0];
    const glowColors = ["rgba(141, 208, 255, 0.10)"];
    displayChapters.forEach((chapter, i) => {
      glowStops.push((i + 1.5) / sceneCount);
      glowColors.push(chapter.glow);
    });
    glowStops.push(1);
    glowColors.push("rgba(141, 208, 255, 0.12)");
    return { glowStops, glowColors };
  }, [sceneCount, displayChapters]);
  const glowColor = useTransform(scrub, glowStops, glowColors);
  const glow = useMotionTemplate`radial-gradient(880px circle at 50% 22%, ${glowColor}, transparent 70%)`;

  const timelineScale = useTransform(scrub, [0, 1], [0, 1]);
  const hintOpacity = useTransform(
    scrollYProgress,
    [0, 0.6 / sceneCount],
    [1, 0],
  );

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Milad — the story";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!terminalOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLTextAreaElement>(".story-terminalBody .t-input")
        ?.focus();
    });
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [terminalOpen]);

  useEffect(() => {
    if (!terminalOpen) return;
    const handleTerminalEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const active = document.activeElement as Element | null;
      if (
        active?.closest(".t-searchModal, .chat-window, .t-contextMenu") ||
        document.querySelector(".t-searchModal")
      ) {
        return;
      }

      event.preventDefault();
      setTerminalOpen(false);
    };

    document.addEventListener("keydown", handleTerminalEscape);
    return () => document.removeEventListener("keydown", handleTerminalEscape);
  }, [terminalOpen]);

  const jumpToScene = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = window.scrollY + track.getBoundingClientRect().top;
    const scrollable = track.offsetHeight - window.innerHeight;
    const target = top + ((index + 0.5) / sceneCount) * scrollable;
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const closeContextMenu = () => setContextMenu(null);
  const isOutroScene = activeScene === sceneCount - 1;
  const openTerminal = (startupCommand?: CommandButton) => {
    setTerminalStartupCommand(startupCommand ?? null);
    setTerminalOpen(true);
  };
  const closeTerminal = () => {
    setTerminalOpen(false);
    setTerminalStartupCommand(null);
  };
  const emailHref = `mailto:${contact?.email ?? "milaforge@proton.me"}?subject=System%20reliability%20context`;

  useEffect(() => {
    if (!contextMenu) return;
    const handleDismiss = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest(".t-contextMenu")) return;
      closeContextMenu();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContextMenu();
    };
    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("scroll", handleDismiss, true);
    document.addEventListener("contextmenu", handleDismiss, true);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("scroll", handleDismiss, true);
      document.removeEventListener("contextmenu", handleDismiss, true);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null;
    if (
      target?.closest(
        "a, button, input, textarea, select, .t-contextMenu, .story-terminalOverlay, .t-root",
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

  return (
    <div className="story-root" onContextMenu={handleContextMenu}>
      <header className="story-topbar">
        <div className="story-brandGroup">
          <button type="button" className="story-brand" onClick={scrollToTop}>
            Milad
          </button>
          <a
            className="story-brandSecondary"
            title="Read Blog"
            href={`${BASE}blog/`}
          >
            Blog
          </a>
          <a
            className="story-brandIconLink"
            href={emailHref}
            aria-label="Email Milad"
            title="Send an email"
          >
            <Mail size={18} strokeWidth={1} aria-hidden="true" />
          </a>
          <a
            className="story-brandIconLink"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Message Milad on Telegram"
            title="Reach out on Telegram"
          >
            <Send size={18} strokeWidth={1} aria-hidden="true" />
          </a>

          <a
            className="story-brandIconLink"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="Check out Github"
          >
            <Github size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
        {isOutroScene ? null : (
          <button
            type="button"
            className="story-skip t-commandLink t-pressable is-secondary"
            onClick={() => jumpToScene(sceneCount - 1)}
          >
            <span className="t-commandLabel">Discuss your project</span>
          </button>
        )}
      </header>

      <div
        ref={trackRef}
        className="story-track"
        style={{ height: `${sceneCount * VH_PER_SCENE}vh` }}
      >
        <div className="story-stage">
          <motion.div
            aria-hidden
            className="story-glow"
            style={{ backgroundImage: glow }}
          />

          {/* Scene 0 — intro */}
          <Scene
            progress={scrub}
            index={0}
            count={sceneCount}
            reduced={reduced}
            className="is-intro"
          >
            <div className="story-chapter story-intro">
              <button
                type="button"
                className="story-avatarButton"
                aria-label="Open chatbot"
                onClick={openChat}
              >
                <img
                  className="story-avatar"
                  src={AVATAR_SRC}
                  alt="Portrait of Milad"
                  width={84}
                  height={84}
                />
                <span className="story-avatarStatus" aria-hidden="true" />
              </button>
              <p className="story-era">
                {STORY_START_YEAR} → {STORY_END_YEAR}
              </p>
              <h1 className="story-hook">{STORY_TAGLINE}</h1>
              <p className="story-sub">
                20 years turning ideas and fragile software into dependable
                products.
              </p>
              <button
                type="button"
                className="story-introProof t-commandLink t-pressable is-secondary"
                onClick={() => openTerminal(SELECTED_WORK_COMMAND)}
              >
                <span className="t-commandLabel">See selected work</span>
              </button>
              <motion.p
                className="story-scrollHint"
                style={{ opacity: hintOpacity }}
              >
                <span className="story-key">↓</span> Read my story{" "}
                {/* <span className="story-key">↑</span> rewind */}
                <span aria-hidden className="story-hintArrow">
                  ▾
                </span>
              </motion.p>
            </div>
          </Scene>

          {displayChapters.map((chapter, i) => (
            <ChapterScene
              key={chapter.id}
              chapter={chapter}
              progress={scrub}
              index={i + 1}
              count={sceneCount}
              reduced={reduced}
            />
          ))}

          {/* Final scene — outro / CTA */}
          <Scene
            progress={scrub}
            index={sceneCount - 1}
            count={sceneCount}
            reduced={reduced}
            className="is-outro"
          >
            <GhostYear
              progress={scrub}
              index={sceneCount - 1}
              count={sceneCount}
              year=""
              reduced={reduced}
            />
            <div className="story-chapter story-outro">
              <p className="story-outroEyebrow">DEPENDABLE SOFTWARE</p>
              <h2 className="story-hook">
                Bring me the idea or the software
                <br />
                you no longer trust.
              </h2>
              <p className="story-sub story-outroSub">
                I build new products, strengthen fragile systems, and make
                automation safer and easier to operate.
              </p>
              <div className="story-outroPrimary">
                <button
                  type="button"
                  className="story-primaryCta"
                  onClick={onBookCall}
                >
                  Discuss your project
                </button>
              </div>
            </div>
          </Scene>

          {isOutroScene ? (
            <div className="story-nextTimeline" aria-hidden>
              <span className="story-nextTimelineYear">{STORY_START_YEAR}</span>
              <span className="story-nextTimelineLine" />
              <span className="story-nextTimelineYear">{STORY_END_YEAR}</span>
              <span className="story-nextTimelineShortLine" />
              <span className="story-nextTimelineDot" />
              <span className="story-nextTimelineLabel">NEXT</span>
            </div>
          ) : (
            <div className="story-timeline" aria-hidden>
              <span className="story-timelineYear">{STORY_END_YEAR}</span>
              <div className="story-timelineBar">
                <motion.div
                  className="story-timelineFill"
                  style={{ scaleX: timelineScale }}
                />
              </div>
              <span className="story-timelineYear">{STORY_START_YEAR}</span>
            </div>
          )}
        </div>
      </div>
      {contextMenu ? (
        <div
          className="t-contextMenu story-contextMenu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
          aria-label="Story actions"
        >
          <button
            type="button"
            className="t-contextMenuItem t-pressable"
            onClick={() => {
              openTerminal();
              closeContextMenu();
            }}
          >
            <span>Open the Terminal</span>
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
              onClick={closeTerminal}
              aria-label="Close terminal"
            >
              Close
            </button>
            <div className="story-terminalBody">
              <Terminal
                contact={contact}
                onBookCall={onBookCall}
                controllerMode="embedded"
                showAskAi={false}
                startupCommand={terminalStartupCommand ?? undefined}
              />
            </div>
          </div>
        </div>
      ) : null}
      <ChatDock
        onBookCall={onBookCall}
        contactEmail={contact?.email}
        hideLauncher
      />
    </div>
  );
}
