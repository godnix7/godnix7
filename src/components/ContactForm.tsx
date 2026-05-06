"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "153e8ed9-09b3-4928-8336-6cbbdcc5d916");

    try {
      // Using Web3Forms for easy, no-backend email handling
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white p-10 md:p-16 border border-black/5 shadow-sm">
        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-20"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
              <Send size={24} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold tracking-tighter text-[#121212]">MESSAGE SENT</h3>
            <p className="text-[#888] font-mono text-xs uppercase tracking-widest">I'll get back to you as soon as possible.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 text-xs font-mono underline hover:text-blue-500 transition-colors text-[#121212]"
            >
              SEND ANOTHER
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-[#888] uppercase tracking-[0.5em]">Name</p>
              <input
                required
                name="name"
                type="text"
                placeholder="Nischay Kademane"
                className="w-full bg-transparent border-b border-black/10 py-4 focus:border-blue-500 outline-none text-xl font-light transition-all placeholder:text-black/5 text-[#121212]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-mono text-[#888] uppercase tracking-[0.5em]">Email Address</p>
              <input
                required
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-black/10 py-4 focus:border-blue-500 outline-none text-xl font-light transition-all placeholder:text-black/5 text-[#121212]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-mono text-[#888] uppercase tracking-[0.5em]">Message</p>
              <textarea
                required
                name="message"
                rows={4}
                placeholder="Let's collaborate on something great..."
                className="w-full bg-transparent border-b border-black/10 py-4 focus:border-blue-500 outline-none text-xl font-light transition-all resize-none placeholder:text-black/5 text-[#121212]"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="group flex items-center gap-6 pt-8 text-[#121212] disabled:opacity-50"
            >
              <span className="text-sm font-bold tracking-[0.5em] uppercase">
                {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
              </span>
              <div className="w-12 h-[1px] bg-black/10 group-hover:w-20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </button>

            {status === "error" && (
              <p className="text-red-500 text-xs font-mono mt-4">Failed to send. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
