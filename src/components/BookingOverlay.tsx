import { useEffect, useRef, useState } from "react";

type BookingOverlayProps = {
  open: boolean;
  onClose: () => void;
  email: string;
};

export function BookingOverlay({ open, onClose, email }: BookingOverlayProps) {
  const [loading, setLoading] = useState(true);
  const embedRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);

    const timeout = window.setTimeout(() => setLoading(false), 8000);

    let currentIframe: HTMLIFrameElement | null = null;
    let loadHandler: (() => void) | null = null;

    const attachListener = () => {
      const iframe = embedRef.current?.querySelector("iframe");
      if (!iframe) return;
      if (currentIframe === iframe) return;

      if (currentIframe && loadHandler) {
        currentIframe.removeEventListener("load", loadHandler);
      }

      currentIframe = iframe;
      loadHandler = () => {
        setLoading(false);
      };

      currentIframe.addEventListener("load", loadHandler);
    };

    const observer = new MutationObserver(() => attachListener());
    if (embedRef.current) {
      observer.observe(embedRef.current, { childList: true, subtree: true });
    }
    attachListener();

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      if (currentIframe && loadHandler) {
        currentIframe.removeEventListener("load", loadHandler);
      }
    };
  }, [open, onClose]);

  // Focus trap and restore
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement;
    closeBtnRef.current?.focus();
    return () => {
      if (prevFocusRef.current instanceof HTMLElement) {
        prevFocusRef.current.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const onTabTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const scope =
        embedRef.current?.closest(".booking-panel") || document.body;
      const focusable = Array.from(
        scope.querySelectorAll<HTMLElement>(
          'button, a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keydown", onTabTrap, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onTabTrap, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-panel">
        <div className="booking-head">
          <div>
            <p className="booking-eyebrow">reserve a 1-on-1 meeting</p>
            <h2 className="booking-title">Choose a time that works for you.
            </h2>
          </div>
          <button
            type="button"
            className="booking-close"
            onClick={onClose}
            aria-label="Close booking dialog"
            ref={closeBtnRef}
          >
            Close
          </button>
        </div>

        <div
          className="booking-body"
          ref={embedRef}
        >
          {loading && (
            <div className="booking-loading" role="status" aria-live="polite">
              <div className="booking-loadingInner">
                <div className="spinner" />
                <span>Loading calendar…</span>
              </div>
            </div>
          )}
          <iframe
            className="booking-embed"
            title="Cal.com booking embed"
            src={`https://cal.com/milaforge/intro?embed=true&primary_color=8dd0ff`}
            allowFullScreen
            aria-busy={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default BookingOverlay;
