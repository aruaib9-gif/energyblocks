import "server-only";
import { company } from "../content";
import { formatNaira, orderStatusLabels, type OrderStatusKey } from "./meta";
import type { Order, OrderItem } from "./schema";

// Transactional email via Resend (https://resend.com/docs/api-reference/emails/send-email).
//   RESEND_API_KEY      re_…
//   EMAIL_FROM          e.g. "Energy Blocks <orders@energyblocks.com>" — the domain must be verified in Resend
//   ADMIN_NOTIFY_EMAIL  where new-order alerts go (comma-separate several addresses)
// Without a key, development prints emails to the server console; production logs a warning.
// Sending never throws: an email failure must not break checkout or order updates.

type Mail = { to: string | string[]; subject: string; html: string; text: string };

export async function sendEmail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Energy Blocks <onboarding@resend.dev>";
  if (!key) {
    if (process.env.NODE_ENV === "production") console.warn(`[email] RESEND_API_KEY not set — skipped "${mail.subject}"`);
    else console.info(`[email:dev] to=${String(mail.to)} subject="${mail.subject}"\n${mail.text}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text, reply_to: company.email }),
      cache: "no-store",
    });
    if (!res.ok) console.error(`[email] Resend ${res.status} for "${mail.subject}": ${await res.text()}`);
  } catch (e) {
    console.error(`[email] failed to send "${mail.subject}"`, e);
  }
}

/* ---------- Templates ---------- */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#eef2f9;font-family:Helvetica,Arial,sans-serif;color:#13213a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d5e0f2">
<tr><td style="height:6px;background:repeating-linear-gradient(-45deg,#ffc72c 0 10px,#0a1a36 10px 20px);background-color:#ffc72c"></td></tr>
<tr><td style="padding:28px 32px 8px"><p style="margin:0;font-weight:700;font-size:13px;letter-spacing:1px;color:#0b47a8">ENERGY BLOCKS</p>
<h1 style="margin:14px 0 0;font-size:24px;line-height:1.25">${title}</h1></td></tr>
<tr><td style="padding:8px 32px 28px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:18px 32px;background:#0a1a36;color:#a9b4c8;font-size:12px;line-height:1.6">
Energy Blocks Construction Ltd · ${esc(company.rc)}<br>${esc(company.phone)} · ${esc(company.email)}</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="display:inline-block;background:#0b47a8;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${esc(label)}</a></p>`;

function itemsTable(order: Order, items: OrderItem[]) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.quantity} × ${esc(i.name)}</td><td align="right" style="padding:6px 0">${formatNaira(i.priceKobo * i.quantity)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #d5e0f2;border-bottom:1px solid #d5e0f2;margin:16px 0">
${rows}
<tr><td style="padding:6px 0;color:#44506a">Delivery</td><td align="right" style="padding:6px 0;color:#44506a">${order.deliveryKobo ? formatNaira(order.deliveryKobo) : "Free"}</td></tr>
<tr><td style="padding:8px 0;font-weight:700">Total paid</td><td align="right" style="padding:8px 0;font-weight:700">${formatNaira(order.totalKobo)}</td></tr></table>`;
}

const itemsText = (order: Order, items: OrderItem[]) =>
  items.map((i) => `  ${i.quantity} × ${i.name} — ${formatNaira(i.priceKobo * i.quantity)}`).join("\n") +
  `\n  Delivery — ${order.deliveryKobo ? formatNaira(order.deliveryKobo) : "Free"}\n  Total — ${formatNaira(order.totalKobo)}`;

export function orderConfirmationEmail(order: Order, items: OrderItem[], orderUrl: string): Mail {
  const first = order.name.split(" ")[0];
  return {
    to: order.email,
    subject: `Order ${order.number} confirmed — thank you, ${first}`,
    html: layout(
      `Thank you, ${esc(first)}. Your order is confirmed.`,
      `<p>We&rsquo;ve received your payment for order <strong>${esc(order.number)}</strong> and our team is preparing it now.</p>
${itemsTable(order, items)}
<p style="margin:0"><strong>Delivering to</strong><br>${esc(order.name)}<br>${esc(order.address)}<br>${esc(order.city)}, ${esc(order.state)}</p>
${button(orderUrl, "Track your order")}
<p style="margin:0;color:#44506a;font-size:13px">You can also track it any time with order number ${esc(order.number)} and this email address.</p>`,
    ),
    text: `Thank you, ${first}. Your order ${order.number} is confirmed.\n\n${itemsText(order, items)}\n\nDelivering to: ${order.address}, ${order.city}, ${order.state}\n\nTrack your order: ${orderUrl}\n\nEnergy Blocks · ${company.phone}`,
  };
}

const statusLines: Partial<Record<OrderStatusKey, string>> = {
  processing: "Our team is picking and packing your items.",
  shipped: "Your order has left our warehouse.",
  out_for_delivery: "Your order is out for delivery and should arrive today.",
  delivered: "Your order has been delivered. Thank you for buying from Energy Blocks.",
  cancelled: "Your order has been cancelled. If you were charged, our team will process your refund.",
};

export function statusUpdateEmail(order: Order, status: OrderStatusKey, note: string, orderUrl: string): Mail {
  const label = orderStatusLabels[status];
  const courier =
    order.courier || order.trackingNumber
      ? `<p style="margin:12px 0 0">${order.courier ? `Courier: <strong>${esc(order.courier)}</strong><br>` : ""}${order.trackingNumber ? `Tracking number: <strong>${esc(order.trackingNumber)}</strong>` : ""}</p>`
      : "";
  return {
    to: order.email,
    subject: `Order ${order.number}: ${label}`,
    html: layout(
      esc(label),
      `<p>${statusLines[status] ?? `Your order ${esc(order.number)} has been updated.`}</p>
${note ? `<p style="background:#dbe6f7;border-radius:12px;padding:12px 14px;color:#083683">${esc(note)}</p>` : ""}
${courier}
${button(orderUrl, "View order status")}`,
    ),
    text: `Order ${order.number}: ${label}\n\n${statusLines[status] ?? ""}${note ? `\n\nNote: ${note}` : ""}${order.courier ? `\nCourier: ${order.courier}` : ""}${order.trackingNumber ? `\nTracking: ${order.trackingNumber}` : ""}\n\nView order: ${orderUrl}`,
  };
}

export function adminNewOrderEmail(order: Order, items: OrderItem[], adminUrl: string): Mail | null {
  const to = (process.env.ADMIN_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return null;
  return {
    to,
    subject: `New paid order ${order.number} — ${formatNaira(order.totalKobo)}`,
    html: layout(
      `New order ${esc(order.number)}`,
      `<p><strong>${esc(order.name)}</strong> · ${esc(order.email)} · ${esc(order.phone)}<br>${esc(order.address)}, ${esc(order.city)}, ${esc(order.state)}</p>
${itemsTable(order, items)}
${order.notes ? `<p>Customer notes: “${esc(order.notes)}”</p>` : ""}
${order.stockIssue ? `<p style="color:#e3222b"><strong>Stock shortfall:</strong> an item ran out before payment completed.</p>` : ""}
${button(adminUrl, "Open in admin")}`,
    ),
    text: `New paid order ${order.number} from ${order.name} (${order.email}, ${order.phone})\n${order.address}, ${order.city}, ${order.state}\n\n${itemsText(order, items)}\n\n${adminUrl}`,
  };
}
