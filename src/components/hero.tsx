"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { photos } from "@/lib/media";
import { Icon } from "./icons";
import { LogoMark } from "./logo";

export const BRIEF_EVENT = "eb:brief";

const placeholders = [
  "a 40-man crew in Warri by Monday…",
  "pipe spools fabricated to API spec…",
  "a standby vessel for six weeks…",
  "PSV and ESD valve recertification…",
  "a warehouse built, paid by milestone…",
];

// A scripted example of how a request moves through mobilisation. Shown as a sample, not live data.
const demo = {
  request: "We need pipe spools fabricated and a certified crew at our Port Harcourt site.",
  lines: [
    { tag: "Scoped", text: "Spool drawings reviewed — ASTM / API spec confirmed", done: true },
    { tag: "Crew", text: "12 welders, 2 weld inspectors, 1 HSE supervisor inducted", done: true },
    { tag: "Supply", text: "Pipe, flanges & consumables sourced — JIT to site", done: true },
    { tag: "On site", text: "Mobilised to Trans-Amadi in 72 hours. ₦0 deposit.", done: true },
    { tag: "Next", text: "Milestone 1 sign-off: spool fit-up & NDT", done: false },
  ],
};

export function Hero() {
  const [brief, setBrief] = useState("");
  const [ph, setPh] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % placeholders.length), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStep((n) => (n + 1) % demo.lines.length), 2200);
    return () => clearInterval(t);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(BRIEF_EVENT, { detail: brief.trim() }));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="top" className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_0%,rgba(11,71,168,0.08),transparent_70%)]"
      />
      <div aria-hidden="true" className="blueprint-grid pointer-events-none absolute inset-0" />
      <span
        aria-hidden="true"
        data-parallax="-0.25"
        className="pointer-events-none absolute -right-10 top-28 hidden select-none text-[260px] leading-none font-bold tracking-[-0.06em] text-foreground/4.5 lg:block"
      >
        EB
      </span>

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="intro">
          <p className="inline-flex items-center gap-2 rounded-full bg-highlight px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-ink uppercase">
            <Icon name="hardhat" className="size-3.5" /> Construction on credit
          </p>
          <h1 className="display mt-5 text-[48px] leading-[0.98] sm:text-[66px] lg:text-[76px]">
            We build now.
            <br />
            <span className="serif-accent">You pay later.</span>
          </h1>
          <p className="mt-6 max-w-130 text-[19px] leading-[1.5] font-medium text-foreground">
            No deposit. No waiting for funds. Your project starts today — and you pay
            from the progress, not before it.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2 text-[13px] font-semibold">
            {["₦0 to start", "Pay per milestone", "On site in 72 hours"].map((t) => (
              <li key={t} className="flex items-center gap-1.5 rounded-full border border-brand/25 bg-card px-3 py-1.5 text-brand">
                <Icon name="check" className="size-3.5" /> {t}
              </li>
            ))}
          </ul>

          <form onSubmit={submit} className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-brand/50">
            <LogoMark className="h-5 w-5 shrink-0" />
            <label htmlFor="hero-brief" className="sr-only">
              Describe your project
            </label>
            <input
              id="hero-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={`We need ${placeholders[ph]}`}
              className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted/80"
            />
            <button type="submit" aria-label="Send brief" className="rounded-full p-1.5 text-muted hover:bg-brand-soft hover:text-brand-light">
              <Icon name="enter" />
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-primary">
              Start building today <Icon name="arrowRight" />
            </a>
            <a href="#payment" className="btn-outline">
              How pay-later works <Icon name="arrowRight" />
            </a>
          </div>

          <p className="mt-12 text-sm text-muted">
            Delivering for operators from ExxonMobil to Dangote Group —{" "}
            <span className="font-serif italic text-brand-light">on time.</span>
          </p>
        </div>

        <div className="relative min-w-0 lg:pb-20 lg:pl-12">
          <div data-parallax="-0.06" className="intro-photo relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-background-alt shadow-[0_40px_80px_-40px_rgba(19,33,58,0.5)] max-lg:aspect-[4/3]">
            <Image
              src={photos.engineersBlueprint}
              alt="An Energy Blocks engineer and technician reviewing technical drawings in the workshop"
              fill
              preload
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="scale-[1.06] object-cover object-[50%_30%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <span className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-highlight px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
              <Icon name="hardhat" className="size-3.5" /> On site in 72 hours
            </span>
          </div>

          <div className="card intro-late relative mx-4 -mt-16 p-4 shadow-[0_30px_60px_-30px_rgba(19,33,58,0.45)] lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:mt-0 lg:w-[72%]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <LogoMark className="h-4 w-4" /> Mobilisation desk
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span className="size-1.5 rounded-full bg-brand" /> sample request
              </span>
            </div>
            <p className="mt-3 truncate rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand-strong">
              &ldquo;{demo.request}&rdquo;
            </p>
            <div className="mt-3 flex h-12 items-center gap-3" aria-live="off">
              {(() => {
                const l = demo.lines[step];
                return (
                  <div key={l.tag} className="animate-rise flex items-center gap-3 text-sm">
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ${
                        l.done ? "bg-brand text-white" : "border border-accent text-accent"
                      }`}
                    >
                      {l.done ? <Icon name="check" className="size-3.5" /> : <span className="size-1.5 rounded-full bg-accent" />}
                    </span>
                    <span className="line-clamp-2">
                      <span className="mr-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{l.tag}</span>
                      {l.text}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {demo.lines.map((l, i) => (
                <span
                  key={l.tag}
                  className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand" : "bg-line"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
