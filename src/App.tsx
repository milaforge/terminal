import { useEffect, useState } from "react";
import BookingOverlay from "@components/BookingOverlay";
import StoryPage from "@components/story";
import BlogPage from "./pages/BlogPage";
import { LandingPage } from "./pages/LandingPage";
import { useTerminalColors } from "@hooks/useTerminalColors";
import { useTerminalFonts } from "@hooks/useTerminalFonts";
import {
  TEAM_CHAPTERS,
  TEAM_STORY_CTA_EYEBROW,
  TEAM_STORY_CTA_LABEL,
  TEAM_STORY_ERA,
  TEAM_STORY_END,
  TEAM_STORY_INTRO,
  TEAM_STORY_SCROLL_HINT,
  TEAM_STORY_START,
  TEAM_STORY_TAGLINE,
} from "@data/teamChapters";
import { getClientRoutePathForClick, parseAppRoute } from "./utils/appRouting";

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || "milaforge@proton.me";

function readBrowserLocation() {
  return {
    hash: window.location.hash,
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function useAppLocation() {
  const [location, setLocation] = useState(readBrowserLocation);

  useEffect(() => {
    const refreshLocation = () => setLocation(readBrowserLocation());
    const onDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const routePath = getClientRoutePathForClick(
        event,
        anchor.href,
        anchor.target,
        anchor.hasAttribute("download"),
        window.location,
      );
      if (!routePath) return;

      event.preventDefault();
      window.history.pushState(null, "", routePath);
      refreshLocation();
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", refreshLocation);
    window.addEventListener("popstate", refreshLocation);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener("hashchange", refreshLocation);
      window.removeEventListener("popstate", refreshLocation);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return location;
}

export function shouldShowStoryRoute(hash: string) {
  return hash === "" || hash === "#" || hash.startsWith("#/story") || hash.startsWith("#/terminal");
}

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  useTerminalColors();
  useTerminalFonts();
  const location = useAppLocation();
  const route = parseAppRoute(location.pathname);

  if (route.name === "book" || route.name === "blog") {
    return <BlogPage slug={route.slug} mode={route.name} />;
  }

  if (route.name === "team") {
    return (
      <>
        <StoryPage
          audience="hiring"
          chapters={TEAM_CHAPTERS}
          ctaEyebrow={TEAM_STORY_CTA_EYEBROW}
          ctaLabel={TEAM_STORY_CTA_LABEL}
          era={TEAM_STORY_ERA}
          intro={TEAM_STORY_INTRO}
          scrollHint={TEAM_STORY_SCROLL_HINT}
          tagline={TEAM_STORY_TAGLINE}
          timelineStart={TEAM_STORY_START}
          timelineEnd={TEAM_STORY_END}
          onBookCall={() => setBookingOpen(true)}
          contact={{
            email: CONTACT_EMAIL,
          }}
        />

        <BookingOverlay
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          email={CONTACT_EMAIL}
        />
      </>
    );
  }

  if (route.name === "notFound") {
    return null;
  }

  return (
    <>
      <LandingPage email={CONTACT_EMAIL} onBookCall={() => setBookingOpen(true)} />

      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        email={CONTACT_EMAIL}
      />
    </>
  );
}
