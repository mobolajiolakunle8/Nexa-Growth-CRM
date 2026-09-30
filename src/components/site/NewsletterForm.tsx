"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json()) as { error?: string };
    if (response.ok) {
      setState("done");
      setMessage("You are subscribed. Watch for the next product digest.");
      setEmail("");
    } else {
      setState("error");
      setMessage(payload.error ?? "Could not subscribe.");
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-aqua-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-xl bg-aqua-400 px-5 py-3 text-sm font-semibold text-brand-950 transition hover:bg-white disabled:opacity-60"
        >
          {state === "loading" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${
            state === "error" ? "text-coral-400" : "text-aqua-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
