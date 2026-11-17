"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Sign-in failed.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Could not reach the sign-in service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form-fields" onSubmit={submit}>
      <div className="admin-field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required maxLength={120} disabled={!configured || pending} />
      </div>
      <div className="admin-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} disabled={!configured || pending} />
      </div>
      {message && <p className="admin-message" role="alert">{message}</p>}
      <button className="button button-primary" type="submit" disabled={!configured || pending}>
        {pending ? <>Checking <LoaderCircle className="spin" size={15} /></> : <>Sign in <ArrowRight size={15} /> </>}
      </button>
    </form>
  );
}
