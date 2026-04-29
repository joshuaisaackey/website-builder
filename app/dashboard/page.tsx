import Link from "next/link";
import { isAdminPasswordConfigured, isDashboardAuthenticated } from "@/lib/admin-auth";
import { sortBusinesses } from "@/lib/business";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { BusinessRecord } from "@/lib/types";
import { loginToDashboard, logoutFromDashboard } from "./actions";
import { BusinessForm } from "./business-form";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    id?: string;
    error?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedId = params?.id;
  const authError = params?.error;

  if (!isAdminPasswordConfigured()) {
    return (
      <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-3xl">
          <div className="ui-card rounded-[1.75rem] px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Dashboard Locked
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Configure `ADMIN_PASSWORD` to access the dashboard.
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              Add `ADMIN_PASSWORD` to your environment file, then reload `/dashboard`.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-soft"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isAuthenticated = await isDashboardAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,_#fbf7f1_0%,_#f3efe7_100%)] px-4 py-6 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-border/70 bg-white/90 px-8 py-12 shadow-[0_24px_90px_rgba(90,57,34,0.12)] backdrop-blur md:px-14 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Dashboard Access
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Enter the admin password to open the dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              This route is protected by the `ADMIN_PASSWORD` environment variable.
            </p>

            {authError === "invalid-password" ? (
              <div className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Incorrect password. Try again.
              </div>
            ) : null}

            <form action={loginToDashboard} className="mt-8 max-w-md space-y-4">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  className="ui-input"
                  placeholder="Enter admin password"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(180,106,50,0.26)] hover:bg-accent-dark"
                >
                  Unlock Dashboard
                </button>
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-medium text-foreground hover:bg-soft"
                >
                  Back Home
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    );
  }

  let businesses: BusinessRecord[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    businesses = sortBusinesses((data ?? []) as BusinessRecord[]);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load businesses. Check your Supabase connection.";
  }

  const initialBusiness = businesses.find((business) => business.id === selectedId) ?? null;

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="ui-card mb-6 rounded-[1.75rem] px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Business Builder
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Create a clean, conversion-focused business website
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                Add the basics once, preview instantly, and publish a fast live page for each
                business.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-soft"
              >
                Back Home
              </Link>
              <form action={logoutFromDashboard}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-soft"
                >
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        <BusinessForm
          key={selectedId ?? "new-business"}
          initialBusiness={initialBusiness}
          businesses={businesses}
        />
      </div>
    </main>
  );
}
