"use client";

import { useActionState } from "react";
import { updateOrder, type FormState } from "@/app/admin/actions";
import { nextStatuses, orderStatusLabels } from "@/lib/shop/meta";
import type { Order } from "@/lib/shop/schema";
import { adminField } from "./ui";

export function OrderUpdateForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrder, {});
  const options = nextStatuses[order.status];
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4 p-5">
      <input type="hidden" name="orderId" value={order.id} />
      <label className="block text-sm font-medium">
        Move to
        <select name="status" defaultValue="" className={adminField} disabled={options.length === 0}>
          <option value="">{options.length ? "Keep current status" : "No further steps"}</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabels[s]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Courier
          <input name="courier" defaultValue={order.courier} placeholder="e.g. GIG Logistics, own van" className={adminField} aria-invalid={!!fe.courier} />
          {fe.courier && <span className="mt-1 block text-xs text-accent">{fe.courier}</span>}
        </label>
        <label className="block text-sm font-medium">
          Courier tracking no.
          <input name="trackingNumber" defaultValue={order.trackingNumber} className={adminField} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Note <span className="font-normal text-muted">(shown to the customer with this update)</span>
        <textarea name="note" rows={2} className={adminField} placeholder="e.g. Driver will call 30 minutes before arrival" />
      </label>
      {state.error && <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">{state.ok}</p>}
      <button disabled={pending} className="btn-primary w-full py-2.5 disabled:opacity-60">
        {pending ? "Saving…" : "Update order"}
      </button>
    </form>
  );
}
