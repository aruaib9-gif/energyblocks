import type { OrderEvent } from "@/lib/shop/schema";
import { fulfilmentSteps, orderStatusLabels, type OrderStatusKey } from "@/lib/shop/meta";
import { Icon, type IconName } from "../icons";

const stepIcons: Record<string, IconName> = {
  paid: "wallet",
  processing: "boxes",
  shipped: "truck",
  out_for_delivery: "pin",
  delivered: "check",
};

const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
export const formatDate = (ms: number) => dateFmt.format(ms);

/** The customer-facing delivery journey: paid → prepared → dispatched → out for delivery → delivered. */
export function StatusTimeline({ status, events }: { status: OrderStatusKey; events: OrderEvent[] }) {
  const reached = fulfilmentSteps.indexOf(status);
  const when = (s: string) => events.findLast((e) => e.status === s)?.createdAt;

  return (
    <ol className="relative grid gap-0 sm:grid-cols-5">
      {fulfilmentSteps.map((s, i) => {
        const done = i <= reached;
        const current = i === reached;
        const at = when(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 sm:flex-col sm:items-center sm:gap-3 sm:pb-0 sm:text-center">
            {i < fulfilmentSteps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-10 left-5 h-[calc(100%-2.5rem)] w-0.5 sm:top-5 sm:left-[calc(50%+1.5rem)] sm:h-0.5 sm:w-[calc(100%-3rem)] ${
                  i < reached ? "bg-brand" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative grid size-10 shrink-0 place-items-center rounded-full ${
                done ? "bg-brand text-white" : "border-2 border-line bg-card text-muted"
              } ${current ? "ring-4 ring-brand/20" : ""}`}
            >
              <Icon name={stepIcons[s]} className="size-4.5" />
            </span>
            <div className="pt-1.5 sm:pt-0">
              <p className={`text-sm font-semibold ${done ? "" : "text-muted"}`}>{orderStatusLabels[s]}</p>
              {at && done && <p className="mt-0.5 text-xs text-muted">{formatDate(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
