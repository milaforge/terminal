import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  STORY_CTA_EYEBROW,
  STORY_CTA_LABEL,
  STORY_ERA,
  STORY_INTRO,
  STORY_SCROLL_HINT,
  STORY_START,
  STORY_END,
  STORY_TAGLINE,
  type StoryChapter,
} from "@data/storyChapters";
import Terminal from "@components/terminal";
import ChatDock from "@components/terminal/chat";
import { useTerminalColors } from "@hooks/useTerminalColors";
import { openChat, useChatStore } from "@stores/chatStore";
import type { CommandButton, ContactInfo } from "@types";
import { CalendarCheck, Github, Mail, Send } from "lucide-react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { parseShareCommandsFromLocation } from "@utils";
import "./story.css";

const BASE = import.meta.env.BASE_URL;
const AVATAR_SRC = `${BASE}images/avatar.jpg`;
/** viewport-heights of scroll runway per scene — pacing of the scrub */
const VH_PER_SCENE = 110;
const WHEEL_SNAP_MIN_DELTA = 8;
const WHEEL_SNAP_LOCK_MS = 850;
const MENU_WIDTH = 240;
const MENU_HEIGHT = 48;
const MENU_MARGIN = 6;
const SELECTED_WORK_COMMAND: CommandButton = {
  command: "selected_cases",
  typing: "simulate",
};
const SERVICES_COMMAND: CommandButton = {
  command: "services",
  typing: "simulate",
};
const TELEGRAM_URL = "https://t.me/milaforge";
const GITHUB_URL = "https://github.com/milaforge";

type StoryPageProps = {
  onBookCall: () => void;
  contact?: ContactInfo;
  audience?: "founders" | "hiring";
  chapters?: StoryChapter[];
  ctaEyebrow?: string;
  ctaLabel?: string;
  era?: string;
  intro?: string;
  scrollHint?: string;
  tagline?: string;
  timelineStart?: string;
  timelineEnd?: string;
};

type SceneEdge = "first" | "last" | "middle";

export function getStoryStartupCommandFromLocation(
  loc: Pick<Location, "search">,
): CommandButton | null {
  const commands = parseShareCommandsFromLocation(loc as Location);
  if (commands.includes(SELECTED_WORK_COMMAND.command)) {
    return SELECTED_WORK_COMMAND;
  }
  return null;
}

export function getStorySceneScrollTarget({
  index,
  sceneCount,
  trackTop,
  scrollable,
}: {
  index: number;
  sceneCount: number;
  trackTop: number;
  scrollable: number;
}) {
  const boundedIndex = Math.min(sceneCount - 1, Math.max(0, index));
  if (boundedIndex === 0) return trackTop;
  if (boundedIndex === sceneCount - 1) return trackTop + scrollable;
  return trackTop + ((boundedIndex + 0.5) / sceneCount) * scrollable;
}

export function getNextStorySceneIndex({
  activeScene,
  deltaY,
  sceneCount,
}: {
  activeScene: number;
  deltaY: number;
  sceneCount: number;
}) {
  if (Math.abs(deltaY) < WHEEL_SNAP_MIN_DELTA) return null;
  const direction = deltaY > 0 ? 1 : -1;
  const next = activeScene + direction;
  if (next < 0 || next >= sceneCount) return null;
  return next;
}

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
  endX = -90,
  startX = 90,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  year: string;
  reduced: boolean;
  endX?: number;
  startX?: number;
}) {
  const start = index / count;
  const mid = (index + 0.5) / count;
  const end = (index + 1) / count;
  const x = useTransform(
    progress,
    [start, mid, end],
    reduced ? [0, 0, 0] : [startX, 0, endX],
  );
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

export default function StoryPage({
  onBookCall,
  contact,
  audience = "founders",
  chapters = STORY_CHAPTERS,
  ctaEyebrow = STORY_CTA_EYEBROW,
  ctaLabel = STORY_CTA_LABEL,
  era = STORY_ERA,
  intro = STORY_INTRO,
  scrollHint = STORY_SCROLL_HINT,
  tagline = STORY_TAGLINE,
  timelineStart = STORY_START,
  timelineEnd = STORY_END,
}: StoryPageProps) {
  const unread = useChatStore((state) => state.unread);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeSceneRef = useRef(0);
  const wheelLockRef = useRef<number | null>(null);
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
  const displayChapters = useMemo(() => [...chapters], [chapters]);
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
    activeSceneRef.current = next;
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

  const finalSceneStart = (sceneCount - 1) / sceneCount;
  const timelineScale = useTransform(scrub, [0, 1], [0, 1]);
  const timelineEndColor = useTransform(
    scrub,
    [finalSceneStart, 1],
    ["var(--muted)", "var(--accent)"],
  );
  const timelineEndScale = useTransform(scrub, [finalSceneStart, 1], [1, 1.08]);
  const introContactsOpacity = useTransform(
    scrollYProgress,
    [0, 0.45 / sceneCount, 0.85 / sceneCount],
    [1, 1, 0],
  );
  const introContactsY = useTransform(
    scrollYProgress,
    [0, 0.85 / sceneCount],
    [0, 12],
  );
  const timelineOpacity = useTransform(
    scrollYProgress,
    [0, 0.45 / sceneCount, 0.85 / sceneCount],
    [0, 0, 1],
  );
  const timelineY = useTransform(
    scrollYProgress,
    [0, 0.85 / sceneCount],
    [12, 0],
  );
  const hintOpacity = useTransform(
    scrollYProgress,
    [0, 0.6 / sceneCount],
    [1, 0],
  );

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

  const jumpToScene = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const top = window.scrollY + track.getBoundingClientRect().top;
      const scrollable = track.offsetHeight - window.innerHeight;
      const target = getStorySceneScrollTarget({
        index,
        sceneCount,
        trackTop: top,
        scrollable,
      });
      window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced, sceneCount],
  );

  useEffect(() => {
    const clearWheelLock = () => {
      if (wheelLockRef.current === null) return;
      window.clearTimeout(wheelLockRef.current);
      wheelLockRef.current = null;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || terminalOpen) return;
      if (wheelLockRef.current !== null) {
        event.preventDefault();
        return;
      }

      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const isWithinTrack =
        rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!isWithinTrack) return;

      const nextScene = getNextStorySceneIndex({
        activeScene: activeSceneRef.current,
        deltaY: event.deltaY,
        sceneCount,
      });
      if (nextScene === null) return;

      event.preventDefault();
      activeSceneRef.current = nextScene;
      setActiveScene(nextScene);
      jumpToScene(nextScene);
      wheelLockRef.current = window.setTimeout(
        clearWheelLock,
        reduced ? 120 : WHEEL_SNAP_LOCK_MS,
      );
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      clearWheelLock();
      window.removeEventListener("wheel", handleWheel);
    };
  }, [jumpToScene, reduced, sceneCount, terminalOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const closeContextMenu = () => setContextMenu(null);
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
    const startupCommand = getStoryStartupCommandFromLocation(window.location);
    if (!startupCommand) return;

    openTerminal(startupCommand);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("run");
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* ignore */
    }
  }, []);

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
          <button
            type="button"
            className="story-brandSecondary"
            title="See selected work"
            onClick={() => openTerminal(SELECTED_WORK_COMMAND)}
          >
            Works
          </button>
          <button
            type="button"
            className="story-brandSecondary"
            title="See the services I provide"
            onClick={() => openTerminal(SERVICES_COMMAND)}
          >
            Services
          </button>
          <a
            className="story-brandSecondary"
            title="Read The Unfinished Book"
            href={`${BASE}book/`}
          >
            Book
          </a>
        </div>
        <nav
          className={`audience-nav is-${audience}`}
          aria-label="Choose audience"
        >
          <span className="audience-nav__prefix">For</span>
          <a
            href={BASE}
            aria-current={audience === "founders" ? "page" : undefined}
          >
            Founders
          </a>
          <span className="audience-nav__separator" aria-hidden="true">
            /
          </span>
          <a
            href={`${BASE}team/`}
            aria-current={audience === "hiring" ? "page" : undefined}
          >
            Hiring teams
          </a>
        </nav>
      </header>
      <button
        type="button"
        className="story-avatarButton story-avatarLauncher"
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
        <span
          className={`story-avatarStatus${unread > 0 ? " has-unread" : ""}`}
          aria-hidden="true"
        />
        {unread > 0 ? (
          <span
            className="story-avatarUnread"
            aria-label={`${unread} unread messages`}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

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
              <p className="story-era">{era}</p>
              <h1 className="story-hook">{tagline}</h1>
              <p className="story-sub">{intro}</p>
              <motion.p
                className="story-scrollHint"
                style={{ opacity: hintOpacity }}
              >
                {/* <span className="story-key">↑</span> rewind */}
                <span className="story-key story-hintArrow">↓</span>{" "}
                {scrollHint}{" "}
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
            <div className="story-outroFrame">
              <GhostYear
                progress={scrub}
                index={sceneCount - 1}
                count={sceneCount}
                year="NEXT"
                reduced={reduced}
                endX={0}
              />
              <div className="story-chapter story-outro">
                <div className="story-outroPrimary">
                  <button
                    type="button"
                    className="t-commandLink t-pressable is-secondary"
                    onClick={onBookCall}
                  >
                    {ctaLabel}
                  </button>
                </div>
                <p className="story-outroEyebrow">{ctaEyebrow}</p>
              </div>
            </div>
          </Scene>

          {
            <>
              <motion.nav
                className="story-bottomContacts"
                aria-label="Contact Milad"
                style={{
                  opacity: introContactsOpacity,
                  x: "-50%",
                  y: introContactsY,
                  pointerEvents: activeScene === 0 ? "auto" : "none",
                }}
              >
                <button
                  type="button"
                  className="story-bottomContactLink"
                  onClick={onBookCall}
                  aria-label="Book a call"
                  title="Book a call"
                >
                  Meet
                </button>
                .
                <a
                  className="story-bottomContactLink"
                  href={emailHref}
                  aria-label="Email Milad"
                  title="Send an email"
                >
                  Email
                </a>
                .
                <a
                  className="story-bottomContactLink"
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Message Milad on Telegram"
                  title="Reach out on Telegram"
                >
                  Telegram
                </a>
                .
                <a
                  className="story-bottomContactLink"
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  title="Check out Github"
                >
                  Github
                </a>
              </motion.nav>
              <motion.div
                className="story-timeline"
                aria-hidden
                style={{ opacity: timelineOpacity, x: "-50%", y: timelineY }}
              >
                <span className="story-timelineYear">{timelineStart}</span>
                <div className="story-timelineBar">
                  <motion.div
                    className="story-timelineFill"
                    style={{ scaleX: timelineScale }}
                  />
                </div>
                <motion.span
                  className="story-timelineYear story-timelineYearEnd"
                  style={{ color: timelineEndColor, scale: timelineEndScale }}
                >
                  {timelineEnd}
                </motion.span>
              </motion.div>
            </>
          }
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
