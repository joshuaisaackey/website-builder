import Link from "next/link";

export default function BusinessNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="max-w-lg rounded-[2rem] border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
          Website not found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          This business page does not exist yet.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Go back to the dashboard, create a business, and use the preview button to open its live
          page.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
