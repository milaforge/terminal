import { useState } from "react";
import Screen from "@components/Screen";
import BookingOverlay from "@components/BookingOverlay";
import BlogPage from "./pages/BlogPage";

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || "onboarding@failuresmith.xyz";

function safeDecodePathPart(part?: string) {
  if (!part) return undefined;
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

function getRoute(pathname: string) {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base === "/" ? "" : base.replace(/\/$/, "");
  const path = cleanBase && pathname.startsWith(cleanBase)
    ? pathname.slice(cleanBase.length) || "/"
    : pathname;
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "blog") {
    return {
      name: "blog" as const,
      slug: safeDecodePathPart(parts[1]),
    };
  }

  return { name: "home" as const };
}

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const route = getRoute(
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  if (route.name === "blog") {
    return <BlogPage slug={route.slug} />;
  }

  return (
    <>
      <Screen
        contact={{
          email: CONTACT_EMAIL,
        }}
        onBookCall={() => setBookingOpen(true)}
      />

      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        email={CONTACT_EMAIL}
      />
    </>
  );
}
