import Link from "next/link";
import { sortBusinesses } from "@/lib/business";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { BusinessRecord } from "@/lib/types";
import { BusinessForm } from "./business-form";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedId = params?.id;

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
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground hover:bg-soft"
            >
              Back Home
            </Link>
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
