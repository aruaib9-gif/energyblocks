"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

// Floating "back to top" control. The ring fills with reading progress (--progress is set on
// <html> by ScrollFx) and the button rises in once the visitor is past the hero.
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    document.querySelector<HTMLElement>("#top a, #top button, #top input")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`back-to-top group fixed right-5 bottom-22 z-50 grid size-13 place-items-center rounded-full bg-ink text-white shadow-[0_12px_30px_-10px_rgba(10,26,54,0.7)] transition-[opacity,translate,background-color] duration-500 hover:bg-brand ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="26" cy="26" r="23" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
        <circle
          cx="26"
          cy="26"
          r="23"
          fill="none"
          stroke="var(--highlight)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={100}
          className="back-to-top-ring"
        />
      </svg>
      <Icon name="arrowRight" className="size-5 -rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
