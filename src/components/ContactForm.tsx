"use client";

import { useState } from "react";

const field =
  "w-full bg-card border border-line rounded-lg px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition placeholder:text-muted/60";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    fd.append("access_key", "153e8ed9-09b3-4928-8336-6cbbdcc5d916");
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success")
    return (
      <div className="rounded-xl border border-line bg-card p-8">
        <p className="text-2xl font-semibold">Message sent</p>
        <p className="mt-2 text-muted">Thanks for reaching out. I&apos;ll reply as soon as I can.</p>
        <button onClick={() => setStatus("idle")} className="mt-5 text-sm text-accent font-medium hover:underline">Send another</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Name</span>
          <input required name="name" placeholder="Jane Doe" className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input required name="email" type="email" placeholder="jane@company.com" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Message</span>
        <textarea required name="message" rows={5} placeholder="Tell me about the project or role…" className={`${field} resize-none`} />
      </label>
      <button
        disabled={status === "sending"}
        className="rounded-lg bg-ink text-paper px-6 py-3 text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {status === "error" && <p className="text-sm text-red-700">Couldn&apos;t send. Please email me directly instead.</p>}
    </form>
  );
}
