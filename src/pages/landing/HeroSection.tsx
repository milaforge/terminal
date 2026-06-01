import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { LandingSectionProps } from "./types";

type HeroSectionProps = LandingSectionProps & {
  trustlineState: HeroTrustlineState;
  onTrustlineComplete: () => void;
};

export type HeroTrustlineState = "idle" | "typing" | "complete";

const trustline =
  "Products stall when nobody owns technical decisions, delivery, and long-term reliability.";
const trustlineTypingMs = 32;

export function HeroSection({
  hidden,
  trustlineState,
  onTrustlineComplete,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleTrustline, setVisibleTrustline] = useState("");

  useEffect(() => {
    if (trustlineState === "idle") {
      setVisibleTrustline("");
      return;
    }

    if (trustlineState === "complete") {
      setVisibleTrustline(trustline);
      return;
    }

    if (shouldReduceMotion) {
      setVisibleTrustline(trustline);
      onTrustlineComplete();
      return;
    }

    let nextLength = 1;
    setVisibleTrustline(trustline.slice(0, nextLength));

    const intervalId = window.setInterval(() => {
      nextLength += 1;
      setVisibleTrustline(trustline.slice(0, nextLength));

      if (nextLength >= trustline.length) {
        window.clearInterval(intervalId);
        onTrustlineComplete();
      }
    }, trustlineTypingMs);

    return () => window.clearInterval(intervalId);
  }, [onTrustlineComplete, shouldReduceMotion, trustlineState]);

  return (
    <section
      id="hero"
      className="landing-slide landing-hero"
      aria-labelledby="landing-title"
      hidden={hidden}
    >
      <div className="landing-heroCenter">
        <div className="landing-heroCopy">
          <h1 id="landing-title" className="landing-title">
            <span>You don&apos;t need another developer.</span>
            <span>You need someone who owns execution.</span>
          </h1>
          <p className="landing-heroTrustline">
            <span aria-hidden="true">{visibleTrustline}</span>
            {trustlineState !== "idle" ? (
              <span className="landing-srOnly">{trustline}</span>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
