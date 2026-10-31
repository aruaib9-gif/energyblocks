import { orderStatusLabels, paymentStatusLabels } from "@/lib/shop/meta";

export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const statusTone: Record<string, string> = {
  pending_payment: "bg-[#fef3c7] text-[#92400e]",
  paid: "bg-brand-soft text-brand-strong",
  processing: "bg-[#e0e7ff] text-[#3730a3]",
  shipped: "bg-[#cffafe] text-[#155e75]",
  out_for_delivery: "bg-[#ccfbf1] text-[#115e59]",
  delivered: "bg-[#dcfce7] text-[#166534]",
  cancelled: "bg-[#f1f5f9] text-[#475569]",
};

export function OrderStatusPill({ status }: { status: keyof typeof orderStatusLabels }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusTone[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}

const paymentTone: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  initialized: "bg-[#fef3c7] text-[#92400e]",
  paid: "bg-[#dcfce7] text-[#166534]",
  success: "bg-[#dcfce7] text-[#166534]",
  failed: "bg-[#fee2e2] text-[#991b1b]",
  abandoned: "bg-[#f1f5f9] text-[#475569]",
  refunded: "bg-[#ede9fe] text-[#5b21b6]",
};

export function PaymentPill({ status }: { status: string }) {
  const label =
    status in paymentStatusLabels
      ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
      : status === "initialized"
        ? "Started"
        : status[0].toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${paymentTone[status] ?? ""}`}>
      {label}
    </span>
  );
}

export const adminField =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand/60 aria-invalid:border-accent";

export function Panel({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-line bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
