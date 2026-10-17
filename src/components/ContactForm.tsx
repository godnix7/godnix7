"use client";

import { useState } from "react";

const field = "w-full bg-transparent border-b border-bone/25 py-3 text-lg outline-none focus:border-ember transition-colors placeholder:text-sand/50";

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
      <div className="py-6">
        <p className="serif text-5xl text-ember">Thank you.</p>
        <p className="mt-3 text-bone/80">Message received — I&apos;ll reply soon.</p>
        <button onClick={() => setStatus("idle")} className="label mt-6 hover:!text-ember">Send another</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-7">
      <input required name="name" placeholder="Your name" className={field} />
      <input required name="email" type="email" placeholder="Email" className={field} />
      <textarea required name="message" rows={3} placeholder="What are we building?" className={`${field} resize-none`} />
      <button disabled={status === "sending"} className="rounded-full bg-ember text-ink px-8 py-3 font-medium hover:bg-bone transition-colors disabled:opacity-50">
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>
      {status === "error" && <p className="mono text-xs text-ember">Couldn&apos;t send. Try emailing me directly.</p>}
    </form>
  );
}
