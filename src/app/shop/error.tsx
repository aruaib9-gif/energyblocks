"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { company } from "@/lib/content";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x px-6 pt-16 lg:px-0">
      <div className="card mx-auto max-w-lg px-8 py-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-highlight text-ink">
          <Icon name="wrench" className="size-6" />
        </span>
        <h1 className="display mt-5 text-[28px]">The marketplace is briefly unavailable.</h1>
        <p className="mt-3 text-muted">
          We couldn&rsquo;t load this page. Please try again in a moment — or call{" "}
          <a href={company.phoneHref} className="font-medium text-brand">
            {company.phone}
          </a>{" "}
          to order directly.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again <Icon name="refresh" />
          </button>
          <Link href="/" className="btn-outline">
            Back to main site
          </Link>
        </div>
        {error.digest && <p className="mt-6 text-xs text-muted">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
