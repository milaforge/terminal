import { useEffect, useState } from "react";
import Terminal from "@components/terminal";
import BookingOverlay from "@components/BookingOverlay";
import StoryPage from "@components/story";
import BlogPage from "./pages/BlogPage";
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
  return hash === "" || hash === "#" || hash.startsWith("#/story");
}

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const location = useAppLocation();
  const route = parseAppRoute(location.pathname);
  const isStory = shouldShowStoryRoute(location.hash);

  useEffect(() => {
    if (route.name !== "book" || !route.legacy) return;

    const slug = route.slug ? `${encodeURIComponent(route.slug)}/` : "";
    window.history.replaceState(
      null,
      "",
      `${import.meta.env.BASE_URL}book/${slug}${location.search}${location.hash}`,
    );
  }, [location.hash, location.search, route]);

  if (route.name === "book") {
    return <BlogPage slug={route.slug} />;
  }

  return (
    <>
      {isStory ? (
        <StoryPage
          onBookCall={() => setBookingOpen(true)}
          contact={{
            email: CONTACT_EMAIL,
          }}
        />
      ) : (
        <Terminal
          contact={{
            email: CONTACT_EMAIL,
          }}
          onBookCall={() => setBookingOpen(true)}
        />
      )}

      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        email={CONTACT_EMAIL}
      />
    </>
  );
}
