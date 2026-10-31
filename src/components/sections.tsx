import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  capabilities,
  company,
  faqs,
  included,
  locations,
  milestones,
  mobilisation,
  oldWays,
  policies,
  securitySystems,
  services,
  standards,
  stats,
  steps,
  teams,
  worries,
} from "@/lib/content";
import { clientLogos, photos } from "@/lib/media";
import { categories } from "@/lib/shop/meta";
import { ContactForm } from "./contact-form";
import { Icon, WhatsAppIcon, type IconName } from "./icons";
import { Logo, LogoMark } from "./logo";

function Photo({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  preload = false,
  delay = 0,
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
  delay?: number;
}) {
  return (
    <div
      data-reveal="photo"
      style={{ "--i": delay } as React.CSSProperties}
      className={`relative overflow-hidden rounded-2xl border border-line bg-background-alt ${className}`}
    >
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} placeholder="blur" className="object-cover" />
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  lead,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div data-stagger className={center ? "mx-auto max-w-170 text-center" : "max-w-170"}>
      <p className="eyebrow">
        <span aria-hidden="true" className="eyebrow-rule" />
        {eyebrow}
      </p>
      <h2 className="display mt-4 text-[34px] leading-[1.08] sm:text-[42px]">{title}</h2>
      {lead && <p className="mt-4 text-[17px] leading-[1.6] text-foreground/80">{lead}</p>}
    </div>
  );
}

export function StandardsStrip() {
  return (
    <div className="border-y border-line px-6 py-5">
      <div data-stagger className="container-x flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <span className="eyebrow mr-2">Standards we work to</span>
        {standards.map((s) => (
          <span key={s.code} className="flex items-center gap-2 text-[14.5px] text-foreground/85">
            <span className="rounded-full border border-line bg-card px-2 py-0.5 text-[10.5px] font-semibold tracking-wide">
              {s.code}
            </span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PhotoBand() {
  const shots: { src: StaticImageData; alt: string; className: string }[] = [
    {
      src: photos.wellheadCrew,
      alt: "Crew in coveralls working around a red wellhead assembly",
      className: "row-span-2",
    },
    {
      src: photos.drillingRig,
      alt: "Crew working on a drilling rig floor",
      className: "",
    },
    {
      src: photos.rebarPiling,
      alt: "Workers guiding a rebar cage into a pile on site",
      className: "row-span-2",
    },
    {
      src: photos.offshorePlatform,
      alt: "Offshore oil and gas platform",
      className: "",
    },
    {
      src: photos.fabrication,
      alt: "Steel being cut during fabrication, sparks flying",
      className: "max-md:hidden",
    },
    {
      src: photos.constructionSite,
      alt: "Multi-storey construction site with a concrete mixer truck",
      className: "max-md:hidden",
    },
  ];
  return (
    <section aria-label="Energy Blocks at work" className="px-6 pt-4 pb-16">
      <div className="container-x grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:grid-cols-4">
        {shots.map((p, i) => (
          <Photo
            key={p.alt}
            src={p.src}
            alt={p.alt}
            delay={i}
            className={`h-full ${p.className}`}
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ))}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <Photo
            src={photos.constructionSite}
            alt="Construction crew and concrete mixer on a multi-storey build"
            className="aspect-[4/5] w-full max-w-md"
          />
          <div
            data-parallax="-0.12"
            className="absolute right-0 -bottom-8 w-[58%] rounded-2xl shadow-[0_24px_48px_-24px_rgba(19,33,58,0.45)] ring-4 ring-background max-sm:hidden"
          >
            <Photo
              src={photos.pipeMaintenance}
              alt="Two technicians in respirators servicing a flanged pipeline"
              className="aspect-[3/2]"
              sizes="(min-width: 1024px) 30vw, 60vw"
            />
          </div>
        </div>
        <div>
          <Heading
            eyebrow="About us"
            title={
              <>
                Engineering expertise, <span className="serif-accent">delivered on time.</span>
              </>
            }
            lead="Established in Nigeria (RC 4240111), Energy Blocks leverages years of engineering expertise across construction, fabrication, project support, marine support, vessel hire & leasing, specialised engineering, and procurement & supply chain management."
          />
          <p data-reveal className="mt-4 max-w-170 text-[16px] leading-[1.65] text-foreground/75">
            Our solutions, supplies and services are designed to protect, improve, restore and facilitate the
            achievement of every project target for our customers. Our dedicated team and proven safety engineering
            methodologies deliver superior results at the client&rsquo;s budget — and on better timelines.
          </p>
          <a data-reveal href="#services" className="btn-outline mt-7">
            Explore our services <Icon name="arrowRight" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Worries() {
  return (
    <section className="px-6 py-24 sm:py-28">
      <Heading
        center
        eyebrow="The 2 a.m. list"
        title="The questions that keep project owners awake."
        lead="You know the list. It shows up the night before a deadline. Energy Blocks works through it while you sleep."
      />
      <ul data-stagger className="card mx-auto mt-12 max-w-3xl divide-y divide-line">
        {worries.map((w) => (
          <li key={w.a} className="flex items-center justify-between gap-6 px-6 py-3.5">
            <span className="text-[15.5px]">&ldquo;{w.q}&rdquo;</span>
            <span className="serif-accent shrink-0 text-xl">{w.a}</span>
          </li>
        ))}
      </ul>
      <p data-reveal className="mt-8 text-center font-serif text-lg italic text-muted">
        Sleep. The site&rsquo;s running.
      </p>
    </section>
  );
}

export function OldWays() {
  return (
    <section className="section bg-background-alt">
      <Heading
        center
        eyebrow="The old ways"
        title={
          <>
            You&rsquo;ve had three options.
            <br />
            None of them worked.
          </>
        }
      />
      <div
        data-stagger
        className="card mx-auto mt-12 grid max-w-5xl overflow-hidden md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-line"
      >
        {oldWays.map((o) => (
          <div key={o.tag} className="p-6">
            <Icon name={o.icon} className="size-4.5 text-muted" />
            <p className="eyebrow mt-4">{o.tag}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{o.title}</h3>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/80">{o.body}</p>
          </div>
        ))}
      </div>
      <p data-reveal="zoom" className="mt-10 text-center">
        <a href="#contact" className="serif-accent text-2xl hover:underline">
          Or call Energy Blocks.
        </a>
      </p>
    </section>
  );
}

export function Numbers() {
  return (
    <section className="section">
      <Heading
        center
        eyebrow="The numbers"
        title="Don't wait for the money. Start the build."
        lead="Most projects stall before the first block is laid — waiting on funds, chasing deposits, sourcing crews. We carry that cost, so your project starts now and pays its way as it rises."
      />
      <div
        data-stagger
        className="card mx-auto mt-12 grid max-w-5xl overflow-hidden sm:grid-cols-2 lg:grid-cols-4 divide-line max-sm:divide-y sm:max-lg:[&>*:nth-child(-n+2)]:border-b sm:max-lg:[&>*:nth-child(odd)]:border-r lg:divide-x *:border-line"
      >
        {stats.map((s) => (
          <div key={s.value} className="px-6 py-8 text-center">
            <p data-count={s.value} className="display text-[52px] leading-none tabular-nums">
              {s.value}
            </p>
            <p className="mx-auto mt-4 max-w-56 text-[14.5px] leading-[1.55] text-foreground/80">{s.label}</p>
            {s.note && <p className="serif-accent mt-3 text-lg">{s.note}</p>}
          </div>
        ))}
      </div>
      <p data-reveal className="mx-auto mt-10 max-w-140 text-center text-[16px] leading-[1.6] text-foreground/80">
        How can we start without a deposit? Our offices in Lagos, Port Harcourt, Warri and Abuja hold the people,
        equipment and supply lines already. You pay as each milestone is met.
      </p>
      <div data-reveal className="mt-6 text-center">
        <a href="#payment" className="btn-outline">
          See how milestone payment works <Icon name="arrowRight" />
        </a>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="section">
      <div className="container-x">
        <Heading
          eyebrow="What we handle"
          title="One contractor on site. Not five."
          lead="Construction, fabrication, supplies, people and vessels under one contract and one point of accountability. Fewer handovers, fewer invoices, and no gaps between them."
        />
        <div data-stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {services.map((s) => (
            <article key={s.title} className="card lift group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <Icon name={s.icon} className={`size-4.5 ${s.highlight ? "text-brand-light" : "text-foreground/70"}`} />
                <h3 className="mt-2.5 text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-1 text-[13px] text-muted">{s.sub}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowWeWork() {
  return (
    <section id="how" className="section bg-background-alt">
      <div className="container-x">
        <Heading eyebrow="How we work" title="You set the goal. We do the rest." />
        <div
          data-stagger
          className="card mt-10 grid overflow-hidden md:grid-cols-3 md:divide-x max-md:divide-y divide-line"
        >
          {steps.map((s, i) => (
            <div key={s.title} className="p-6">
              <div className="flex items-start justify-between">
                <Icon name={s.icon} className="size-4.5 text-brand-light" />
                <span className="font-serif text-3xl italic leading-none text-foreground/25">{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/80">{s.body}</p>
            </div>
          ))}
        </div>
        <ul data-stagger className="mt-12 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <li key={c.title} className="flex gap-3">
              <Icon name={c.icon} className="mt-0.5 size-4.5 shrink-0 text-foreground/70" />
              <div>
                <h3 className="text-[15px] font-semibold">{c.title}</h3>
                <p className="mt-1 text-[14.5px] leading-[1.6] text-muted">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Mobilisation() {
  return (
    <section className="section">
      <Heading
        center
        eyebrow="The first 72 hours"
        title="Mobilising is the part we do for you."
        lead="No months of procurement, no deposit invoice, no crew to assemble from scratch. You sign; we move."
      />
      <Photo
        src={photos.excavators}
        alt="Excavators ready to mobilise at sunset"
        className="mx-auto mt-12 aspect-[16/7] max-w-3xl"
        sizes="(min-width: 768px) 768px, 100vw"
      />
      <div data-scrub className="relative mx-auto mt-4 max-w-3xl">
        <span
          aria-hidden="true"
          className="scrub-line absolute top-4 bottom-4 -left-3 w-[3px] rounded-full bg-gradient-to-b from-accent to-highlight max-sm:hidden"
        />
        <ol data-stagger className="card divide-y divide-line">
          {mobilisation.map((m) => (
            <li key={m.when} className="grid grid-cols-[84px_1fr] gap-4 px-6 py-5">
              <span className="pt-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-muted">{m.when}</span>
              <div>
                <h3 className="text-[16px] font-semibold">{m.title}</h3>
                <p className="mt-1 text-[14.5px] leading-[1.6] text-foreground/75">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div data-reveal className="mt-8 text-center">
        <a href="#contact" className="btn-primary">
          Start hour zero <Icon name="arrowRight" />
        </a>
        <p className="mt-3 text-sm text-muted">Mobilisation is included. So is changing the plan.</p>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <div className="card lift p-5">
      <Icon name={icon} className="size-4.5 text-brand-light" />
      <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-[1.6] text-foreground/75">{body}</p>
    </div>
  );
}

export function Teams() {
  return (
    <section id="teams" className="section">
      <div className="container-x">
        <Heading
          eyebrow="The specialists behind the work"
          title={
            <>
              When the job gets specialist, <span className="text-brand-light">a specialist steps in.</span>
            </>
          }
          lead="Field engineers, weld inspectors, marine crews, NDT technicians and procurement teams that integrate with yours — from technical drawings to final QA/QC sign-off."
        />
        <div data-stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <FeatureCard key={t.title} {...t} />
          ))}
        </div>
        <figure data-reveal="zoom" className="card mx-auto mt-12 max-w-2xl px-8 py-10 text-center">
          <p className="eyebrow">A note from the team</p>
          <blockquote className="mt-5 font-serif text-[22px] leading-[1.45] italic">
            &ldquo;Our entire team is committed to operational excellence — making us a dependable partner in the
            Nigerian energy landscape. We deliver superior results at our clients&rsquo; budget rates, and on better
            timelines.&rdquo;
          </blockquote>
          <figcaption className="mt-5 text-sm text-muted">— the Energy Blocks team, {company.rc}</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function Coverage() {
  return (
    <section className="section bg-background-alt">
      <div className="container-x">
        <Heading
          eyebrow="Where we operate"
          title="Local offices. Nationwide reach."
          lead="Four bases across Nigeria mean the crew, kit and materials are already close to your site — and every major port is covered for marine work."
        />
        <div data-stagger className="mt-12 grid gap-5 md:grid-cols-2">
          {locations.map((l) => (
            <div key={l.code} className="card lift flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-[10.5px] font-bold text-white">
                {l.code}
              </span>
              <div>
                <h3 className="text-[16px] font-semibold">{l.city}</h3>
                <p className="mt-1 text-[14.5px] leading-[1.6] text-foreground/75">{l.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const tickerWords = ["We build now", "You pay later", "₦0 to start", "On site in 72 hours", "Pay per milestone"];

export function Ticker() {
  const row = (echo: boolean) =>
    [0, 1, 2].flatMap((n) =>
      tickerWords.map((w, i) => (
        <span key={`${n}-${w}`} className="flex shrink-0 items-center gap-6 sm:gap-10">
          <span className={echo ? "text-white/25" : i % 2 ? "text-highlight" : "text-white"}>{w}</span>
          {echo ? (
            <span className="size-2 shrink-0 rounded-full bg-white/25" />
          ) : (
            <LogoMark className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" />
          )}
        </span>
      )),
    );
  return (
    <section aria-label="We build now, you pay later" data-scrub className="overflow-hidden py-16 sm:py-20">
      {/* A strip of caution tape stretched across the page */}
      <div className="-mx-8 -rotate-2 bg-ink font-semibold tracking-[-0.03em] whitespace-nowrap uppercase shadow-[0_30px_60px_-30px_rgba(10,26,54,0.6)]">
        <div aria-hidden="true" className="hazard-stripe h-2.5" />
        <div className="py-6 sm:py-8">
          <div aria-hidden="true" className="ticker-row flex w-max gap-6 text-[40px] leading-none sm:gap-10 sm:text-[64px]">
            {row(false)}
          </div>
          <div aria-hidden="true" className="ticker-row reverse mt-4 flex w-max gap-6 text-[22px] leading-none sm:gap-10 sm:text-[30px]">
            {row(true)}
          </div>
        </div>
        <div aria-hidden="true" className="hazard-stripe h-2.5" />
      </div>
    </section>
  );
}

export function Payment() {
  return (
    <section id="payment" className="section">
      <Heading
        center
        eyebrow="Build on credit"
        title={
          <>
            Your building goes up first. <span className="serif-accent">The bill comes after.</span>
          </>
        }
        lead="We fund the mobilisation — equipment, crews and materials — so you don't need capital up front. You pay in stages, only for milestones already delivered and signed off by you."
      />
      <div
        data-reveal
        className="card mx-auto mt-12 grid max-w-5xl overflow-hidden md:grid-cols-2 md:divide-x max-md:divide-y divide-line"
      >
        <div className="p-6 sm:p-7">
          <p className="eyebrow">Example building project</p>
          <ul data-stagger className="mt-4 space-y-3">
            {milestones.map((m) => (
              <li key={m.stage} className="flex items-baseline justify-between gap-4 text-[15px]">
                <span>
                  {m.stage}
                  <span className="block text-[13px] text-muted">{m.detail}</span>
                </span>
                <span className="shrink-0 font-semibold">{m.pay}</span>
              </li>
            ))}
          </ul>
          <hr className="my-6 border-line" />
          <p className="text-[15px] leading-[1.6]">
            Payments align with your revenue inflows, smoothing cash flow and minimising working-capital strain.{" "}
            <span className="serif-accent">No surprises.</span>
          </p>
          <a href="#contact" className="btn-primary mt-6 w-full">
            Get a milestone plan for your project <Icon name="arrowRight" />
          </a>
          <p className="mt-3 text-center text-xs text-muted">
            Payment schedules are formalised only once you&rsquo;re fully mobilised.
          </p>
        </div>
        <div className="p-6 sm:p-7">
          <p className="eyebrow">Everything included</p>
          <ul data-stagger className="mt-4 space-y-3">
            {included.map((i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px]">
                <Icon name="check" className="mt-1 size-3.5 shrink-0 text-brand-light" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Clients() {
  return (
    <section id="clients" className="section bg-background-alt">
      <div className="container-x">
        <Heading
          center
          eyebrow="Who we've delivered for"
          title="Trusted across the energy value chain."
          lead="Upstream, midstream and downstream operators, EPC contractors, telecoms and infrastructure leaders."
        />
        <ul
          data-stagger
          className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6"
        >
          {clientLogos.map((c) => (
            <li key={c.name} className="grid h-24 place-items-center bg-white px-5 py-4">
              <Image
                src={c.logo}
                alt={c.name}
                sizes="160px"
                className="h-14 w-auto max-w-full object-contain grayscale-[35%] transition hover:grayscale-0"
              />
            </li>
          ))}
          <li className="grid h-24 place-items-center bg-card px-4 text-center">
            <a href="#contact" className="serif-accent text-lg hover:underline">
              Your project next.
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function Policies() {
  return (
    <section className="section">
      <div className="container-x">
        <Heading
          eyebrow="Health, safety & environment"
          title={
            <>
              Safe crews. Clean sites. <span className="text-brand-light">No exceptions.</span>
            </>
          }
          lead="Proven safety engineering methodologies sit behind every job. Every person we deploy is insured, inducted and held to the same rules."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid grid-cols-2 gap-5">
            <Photo
              src={photos.towerClimber}
              alt="Technician in full fall-protection harness climbing a lattice tower"
              className="aspect-[3/4] lg:aspect-auto lg:h-full"
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
            <Photo
              src={photos.ppeKit}
              delay={2}
              alt="Hard hat, gloves, boots, goggles and hi-vis vest laid out"
              className="aspect-[3/4] lg:aspect-auto lg:h-full"
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
          </div>
          <div data-stagger className="grid gap-5">
            {policies.map((p) => (
              <FeatureCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Security() {
  return (
    <section id="security" className="section bg-background-alt">
      <div className="container-x">
        <div className="grid items-end gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Heading
            eyebrow="Safety · Security & workforce systems"
            title={
              <>
                Protect the site. <span className="serif-accent">Know who&rsquo;s on it.</span>
              </>
            }
            lead="Under our safety practice, we support organisations with integrated security and workforce management solutions — from the gate and the turnstile to the control room."
          />
          <a data-reveal="right" href="#contact" className="btn-primary justify-self-start lg:justify-self-end">
            Secure your site <Icon name="arrowRight" />
          </a>
        </div>
        <div
          data-stagger
          className="card mt-12 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:border-line *:border-b sm:*:border-r"
        >
          {securitySystems.map((s) => (
            <div key={s.title} className="-mr-px -mb-px p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon name={s.icon} className="size-4.5" />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-foreground/75">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Marketplace() {
  return (
    <section id="shop" className="section">
      <div className="container-x">
        <div className="grid items-end gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Heading
            eyebrow="Marketplace"
            title={
              <>
                The kit we install, <span className="serif-accent">delivered to you.</span>
              </>
            }
            lead="Fire extinguishers and alarms, CCTV and access control, PPE and site tools — order online, pay securely with Paystack and track delivery to anywhere in Nigeria."
          />
          <Link data-reveal="right" href="/shop" className="btn-primary justify-self-start lg:justify-self-end">
            Shop the marketplace <Icon name="arrowRight" />
          </Link>
        </div>
        <div data-stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="card lift group flex items-center gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon name={c.icon} className="size-5.5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{c.label}</span>
                <span className="block text-sm text-muted">{c.blurb}</span>
              </span>
              <Icon name="arrowRight" className="ml-auto shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="section">
      <div className="mx-auto max-w-180">
        <Heading eyebrow="Questions" title="Asked, answered." />
        <div data-stagger className="mt-10 divide-y divide-line border-b border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4.5 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon name="plus" className="size-3.5 shrink-0 text-muted transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-[1.65] text-foreground/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const items: {
    icon: IconName;
    label: string;
    value: string;
    href?: string;
  }[] = [
    { icon: "pin", label: "Head office", value: company.headOffice },
    { icon: "pin", label: "Branch office", value: company.branchOffice },
    {
      icon: "phone",
      label: "Phone",
      value: company.phone,
      href: company.phoneHref,
    },
    {
      icon: "mail",
      label: "Email",
      value: company.email,
      href: `mailto:${company.email}`,
    },
  ];
  return (
    <section id="contact" className="section bg-background-alt">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <Heading
            eyebrow="Start a project"
            title={
              <>
                Tell us the job. <span className="serif-accent">We build first.</span>
              </>
            }
            lead="Share the scope, the site and the timeline. We'll come back with a milestone plan — and no deposit request."
          />
          <ul data-stagger className="mt-10 space-y-5">
            {items.map((i) => (
              <li key={i.label} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-accent ring-1 ring-line">
                  <Icon name={i.icon} />
                </span>
                <div>
                  <p className="eyebrow">{i.label}</p>
                  {i.href ? (
                    <a href={i.href} className="mt-1 block text-[15px] font-medium hover:text-brand-light">
                      {i.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[15px] font-medium">{i.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Photo
            src={photos.siteTeam}
            alt="Two Energy Blocks engineers in hard hats reviewing a laptop at a port"
            className="mt-10 aspect-[3/2] max-lg:hidden"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </div>
        <div data-reveal="right">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink px-6 py-24 text-center text-white">
      <div aria-hidden="true" className="hazard-stripe absolute inset-x-0 top-0 h-2" />
      <div aria-hidden="true" data-parallax="0.18" className="absolute inset-x-0 -inset-y-24 -z-10">
        <Image
          src={photos.teamSilhouette}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover opacity-30"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
      <div data-stagger>
        <LogoMark className="mx-auto h-8 w-8" />
        <h2 className="mt-8 text-[38px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[48px]">
          Your project can&rsquo;t wait for cash flow.
          <br />
          <span className="font-serif italic text-[#8ab4f0]">We build now. You pay later.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-115 text-[16px] leading-[1.6] text-white/70">
          Seventy-two hours from now, your site could be set up, your crew inducted and your materials on the ground —
          without a naira paid up front.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="btn-primary">
            Start a project <Icon name="arrowRight" />
          </a>
          <a href={company.phoneHref} className="btn border border-white/25 text-white hover:border-white/60">
            Talk to a person <Icon name="arrowRight" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink px-6 pb-10 text-white/70">
      <div
        data-stagger
        className="container-x grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Logo inverted />
          <p className="mt-4 text-sm leading-[1.6]">
            A wholly indigenous Nigerian engineering, construction and energy services company.
          </p>
          <p className="mt-3 text-xs text-white/50">{company.rc}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">Services</p>
          <ul className="mt-4 space-y-2 text-sm">
            {services.slice(0, 8).map((s) => (
              <li key={s.title}>
                <a href="#services" className="hover:text-white">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">Offices</p>
          <p className="mt-4 text-sm leading-[1.6]">
            <span className="text-white">Lagos</span> — {company.headOffice}
          </p>
          <p className="mt-3 text-sm leading-[1.6]">
            <span className="text-white">Port Harcourt</span> — {company.branchOffice}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={company.phoneHref} className="hover:text-white">
                {company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="hover:text-white">
                {company.email}
              </a>
            </li>
            <li>
              <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45">
        <p>© Energy Blocks Construction Ltd. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="rounded-full border border-white/15 px-3 py-1.5 text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            Marketplace
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-white/70 transition-colors hover:border-highlight/60 hover:text-highlight"
          >
            <Icon name="lock" className="size-3.5" /> Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={company.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Energy Blocks on WhatsApp"
      className="fixed right-5 bottom-5 z-50 grid size-13 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon />
    </a>
  );
}
