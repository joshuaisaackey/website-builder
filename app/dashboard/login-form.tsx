"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Incorrect password.");
        return;
      }

      router.refresh();
      router.replace("/dashboard");
    } catch {
      setError("Unable to verify the password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Password
        <input
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="ui-input"
          placeholder="Enter admin password"
        />
      </label>
      {error ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(180,106,50,0.26)] hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Checking..." : "Unlock Dashboard"}
        </button>
      </div>
    </form>
  );
}
