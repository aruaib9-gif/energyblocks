"use client";

import { useActionState } from "react";
import { addAdmin, updatePassword, type FormState } from "@/app/admin/actions";
import { adminField } from "./ui";

function Msg({ state }: { state: FormState }) {
  if (state.ok) return <p className="rounded-xl bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">{state.ok}</p>;
  if (state.error) return <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>;
  return null;
}

function Input({ label, name, type = "text", error, autoComplete }: { label: string; name: string; type?: string; error?: string; autoComplete?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required autoComplete={autoComplete} aria-invalid={!!error} className={adminField} />
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
    </label>
  );
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAdmin, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4 p-5">
      <Input label="Name" name="name" error={fe.name} />
      <Input label="Email" name="email" type="email" error={fe.email} autoComplete="off" />
      <Input label="Temporary password" name="password" type="password" error={fe.password} autoComplete="new-password" />
      <Msg state={state} />
      <button disabled={pending} className="btn-primary w-full py-2.5 disabled:opacity-60">
        {pending ? "Adding…" : "Give admin access"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4 p-5">
      <Input label="Current password" name="current" type="password" error={fe.current} autoComplete="current-password" />
      <Input label="New password" name="next" type="password" error={fe.next} autoComplete="new-password" />
      <Msg state={state} />
      <button disabled={pending} className="btn-outline w-full py-2.5 disabled:opacity-60">
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
