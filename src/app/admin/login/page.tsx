"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { login, type FormState } from "../actions";

const field = "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand/60";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="w-full max-w-sm">
        <Logo />
        <form action={action} className="card mt-6 space-y-4 p-7 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold">Marketplace admin</h1>
            <p className="mt-1 text-sm text-muted">Sign in to manage products, orders and payments.</p>
          </div>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="username" className={field} />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input name="password" type="password" required autoComplete="current-password" className={field} />
          </label>
          {state.error && (
            <p role="alert" className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
              {state.error}
            </p>
          )}
          <button disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
            {pending ? "Signing in…" : <>Sign in <Icon name="lock" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
