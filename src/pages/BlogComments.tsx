import { useEffect, useId, useRef } from "react";
import {
  BLOG_COMMENTS_ATTRIBUTES,
  BLOG_COMMENTS_SCRIPT_SRC,
} from "./blogComments";

type BlogCommentsProps = {
  postSlug: string;
};

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const headingId = useId();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let active = true;
    const script = document.createElement("script");

    mount.replaceChildren();
    mount.dataset.utterancesState = "loading";

    script.src = BLOG_COMMENTS_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";

    Object.entries(BLOG_COMMENTS_ATTRIBUTES).forEach(([name, value]) => {
      script.setAttribute(name, value);
    });

    script.addEventListener("load", () => {
      if (active) mount.dataset.utterancesState = "ready";
    });
    script.addEventListener("error", () => {
      if (active) mount.dataset.utterancesState = "failed";
    });

    mount.appendChild(script);

    return () => {
      active = false;
      mount.replaceChildren();
      delete mount.dataset.utterancesState;
    };
  }, [postSlug]);

  return (
    <section className="blog-comments" aria-labelledby={headingId}>
      <h2 id={headingId}>Comments</h2>
      <div className="blog-commentsEmbed" ref={mountRef} />
    </section>
  );
}
