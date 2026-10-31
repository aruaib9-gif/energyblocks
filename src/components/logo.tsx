// The three red swooshes from the Energy Blocks company profile, redrawn as SVG.
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <g fill="#e3222b">
        <path d="M9 12.5C15 6 25 4 37 4c-8 2-14 5.5-18.5 10.5H8.6Z" />
        <path d="M5 23c6-6.5 16-8.5 28-8.5-8 2-14 5.5-18.5 10.5H4.6Z" />
        <path d="M1 33.5C7 27 17 25 29 25c-8 2-14 5.5-18.5 10.5H.6Z" />
      </g>
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span
        className={`flex flex-col leading-none font-bold tracking-wide ${
          inverted ? "text-white" : "text-brand-light"
        }`}
      >
        <span className="text-[13px]">ENERGY BLOCKS</span>
        <span className="text-[9.5px] tracking-[0.12em] opacity-90">CONSTRUCTION LTD</span>
      </span>
    </span>
  );
}
