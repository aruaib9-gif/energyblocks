"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <Icon name="ban" className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Admin couldn&rsquo;t load</h1>
        <p className="mt-2 text-sm text-muted">
          The server hit an error — most often the database isn&rsquo;t configured or reachable. Check that
          MONGODB_URI and SESSION_SECRET are set in your hosting environment and that Atlas Network Access allows
          your host, then try again.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Try again <Icon name="refresh" />
        </button>
        {error.digest && <p className="mt-4 text-xs text-muted">Reference: {error.digest} (search for it in your server logs)</p>}
      </div>
    </main>
  );
}
