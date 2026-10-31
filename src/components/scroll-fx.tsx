"use client";

import { useEffect, useLayoutEffect } from "react";

// Drives every scroll effect on the page from one place:
//   [data-reveal]      fades/clips in once it enters the viewport (variants in globals.css)
//   [data-stagger]     reveals its direct children one after another
//   [data-count]       counts its number up (or ₦ down to zero) when revealed
//   [data-parallax=n]  drifts at n × its distance from the viewport centre
//   [data-scrub]       gets --p (0 → 1) as it travels through the viewport
// The layout's inline script sets html[data-fx] before first paint; without JS or with
// reduced motion it is never set, so content simply renders in place.

const nf = new Intl.NumberFormat("en-NG");

function countUp(el: HTMLElement) {
  const raw = el.dataset.count ?? el.textContent ?? "";
  const m = raw.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return;
  const [, pre, num, post] = m;
  const to = Number(num);
  // "₦0" counts down from a typical deposit, so the zero lands as the punchline.
  const from = to === 0 ? 2_500_000 : 0;
  const start = performance.now();
  const dur = to === 0 ? 1600 : 1200;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = `${pre}${nf.format(Math.round(from + (to - from) * e))}${post}`;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = raw;
  };
  requestAnimationFrame(tick);
}

export function ScrollFx() {
  // React's dev remount clears attributes the inline script put on <html>; put them back.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.removeAttribute("data-fx");
      return;
    }
    root.setAttribute("data-fx", "");
    root.setAttribute("data-fx-ready", "");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty("--i", String(Math.min(i, 10)));
      });
    });

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.setAttribute("data-shown", "");
          if (!reduced) el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          reveal.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal], [data-stagger]").forEach((el) => reveal.observe(el));

    // Highlight the nav link for the section in view.
    const links = new Map<string, HTMLAnchorElement[]>();
    document.querySelectorAll<HTMLAnchorElement>('header a[href^="#"]').forEach((a) => {
      const id = a.hash.slice(1);
      if (id && id !== "top" && id !== "contact") links.set(id, [...(links.get(id) ?? []), a]);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          links.get(entry.target.id)?.forEach((a) => a.toggleAttribute("data-active", entry.isIntersecting));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });

    const parallax = reduced ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const scrub = reduced ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      root.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
      root.toggleAttribute("data-scrolled", window.scrollY > 8);
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax || 0.1);
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      }
      for (const el of scrub) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--p", p.toFixed(4));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      reveal.disconnect();
      spy.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div aria-hidden="true" className="scroll-progress" />;
}
