"use client";

import { useEffect, useState, type FormEvent } from "react";
import { company } from "@/lib/content";
import { BRIEF_EVENT } from "./hero";
import { Icon } from "./icons";

const serviceOptions = [
  "Construction",
  "Welding & Fabrication",
  "Procurement & Supply Chain",
  "Marine Support",
  "Vessel Hire & Leasing",
  "Project Support",
  "Manpower",
  "Facility Maintenance",
  "NDT & Inspection",
  "Security & workforce systems",
  "Something else",
];

const field =
  "w-full rounded-xl border border-line bg-background/60 px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-brand/60 focus:bg-card";

// No mail backend is configured, so the form composes an email in the visitor's mail client.
export function ContactForm() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onBrief = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setMessage(detail);
      setTimeout(() => document.getElementById("contact-name")?.focus({ preventScroll: true }), 600);
    };
    window.addEventListener(BRIEF_EVENT, onBrief);
    return () => window.removeEventListener(BRIEF_EVENT, onBrief);
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const subject = `Project enquiry: ${get("service")} — ${get("company") || get("name")}`;
    const body = [
      `Name: ${get("name")}`,
      `Company: ${get("company")}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Service: ${get("service")}`,
      `Location: ${get("location")}`,
      "",
      get("message"),
    ].join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="card self-start p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Your name</span>
          <input id="contact-name" name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Company</span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Phone</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+234" className={field} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Service</span>
          <select name="service" defaultValue="Construction" className={field}>
            {serviceOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Site location</span>
          <input name="location" placeholder="e.g. Warri, Delta State" className={field} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium">What does the project need?</span>
          <textarea
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scope, timeline, quantities, standards…"
            className={`${field} resize-y`}
          />
        </label>
      </div>
      <button type="submit" className="btn-primary mt-6 w-full">
        Send project brief <Icon name="arrowRight" />
      </button>
      <p className="mt-3 text-center text-xs text-muted" role="status">
        {sent
          ? `Your email app should open with the brief ready to send. If it didn't, write to ${company.email}.`
          : `Opens your email app with the brief filled in. Prefer the phone? Call ${company.phone}.`}
      </p>
    </form>
  );
}
