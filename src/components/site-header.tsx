"use client";

import { useEffect, useState } from "react";
import { company, navLinks } from "@/lib/content";
import { Icon } from "./icons";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="container-x flex h-[52px] items-center gap-8 px-6 lg:px-0">
        <a href="#top" aria-label="Energy Blocks Construction Ltd — home">
          <Logo />
        </a>
        <nav aria-label="Primary" className="hidden flex-1 items-center gap-6 text-sm text-foreground/80 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-5 md:flex">
          <a href={company.phoneHref} className="text-sm font-medium hover:text-brand-light">
            Call us
          </a>
          <a href="#contact" className="btn-primary py-1.5">
            Start a project
          </a>
        </div>
        <button
          type="button"
          className="ml-auto rounded-full p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} className="size-5" />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-background px-6 pb-6 md:hidden">
          <ul className="flex flex-col divide-y divide-line">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block py-3 text-[15px]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">
            Start a project
          </a>
        </nav>
      )}
    </header>
  );
}
