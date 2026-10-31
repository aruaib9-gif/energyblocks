"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { trackOrder, type TrackState } from "../checkout/actions";

const field = "mt-1.5 w-full rounded-xl border border-line bg-background/50 px-3.5 py-2.5 text-[15px] outline-none focus:border-brand/60 focus:bg-card";

export default function TrackPage() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, {});
  return (
    <div className="container-x px-6 pt-14 lg:px-0">
      <div className="mx-auto max-w-md">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand text-white">
          <Icon name="truck" className="size-6" />
        </span>
        <h1 className="display mt-5 text-[34px]">Track your order</h1>
        <p className="mt-2 text-muted">Enter the order number from your confirmation and the email you ordered with.</p>
        <form action={action} className="card mt-8 space-y-4 p-6">
          <label className="block text-sm font-medium">
            Order number
            <input name="number" required defaultValue={state.number} placeholder="EB-XXXXXXX" className={`${field} uppercase`} />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required defaultValue={state.email} autoComplete="email" className={field} />
          </label>
          {state.error && (
            <p role="alert" className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
              {state.error}
            </p>
          )}
          <button disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
            {pending ? "Looking up…" : <>Track order <Icon name="arrowRight" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
