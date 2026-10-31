import { Hero } from "@/components/hero";
import {
  About,
  Clients,
  Contact,
  Coverage,
  Faq,
  FinalCta,
  HowWeWork,
  Marketplace,
  Mobilisation,
  Numbers,
  OldWays,
  PhotoBand,
  Payment,
  Policies,
  Security,
  Services,
  SiteFooter,
  StandardsStrip,
  Teams,
  Ticker,
  WhatsAppButton,
  Worries,
} from "@/components/sections";
import { BackToTop } from "@/components/back-to-top";
import { ScrollFx } from "@/components/scroll-fx";
import { SiteHeader } from "@/components/site-header";
import { company } from "@/lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: company.name,
  url: "https://www.energyblocks.com",
  email: company.email,
  telephone: "+2348034113355",
  areaServed: "NG",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "KM 48, Lekki Epe Expressway",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Plot 150 Oginigba Road, Trans-Amadi Industrial Layout",
      addressLocality: "Port Harcourt",
      addressRegion: "Rivers State",
      addressCountry: "NG",
    },
  ],
  sameAs: [company.facebook],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      {/* clip, not hidden: stops reveal offsets causing sideways scroll without breaking sticky */}
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <PhotoBand />
        <StandardsStrip />
        <Worries />
        <OldWays />
        <Numbers />
        <About />
        <Services />
        <HowWeWork />
        <Mobilisation />
        <Teams />
        <Coverage />
        <Ticker />
        <Payment />
        <Clients />
        <Policies />
        <Security />
        <Marketplace />
        <Faq />
        <Contact />
      </main>
      <FinalCta />
      <SiteFooter />
      <WhatsAppButton />
      <BackToTop />
      <ScrollFx />
    </>
  );
}
