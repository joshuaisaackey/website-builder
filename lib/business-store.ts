import { normalizeHostname } from "@/lib/business";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { BusinessRecord } from "@/lib/types";

export async function findBusinessBySlug(slug: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BusinessRecord | null) ?? null;
}

export async function findBusinessSlugByDomain(domain: string) {
  const normalizedDomain = normalizeHostname(domain);

  if (!normalizedDomain) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const requestUrl = new URL("/rest/v1/businesses", supabaseUrl);
  requestUrl.searchParams.set("select", "slug");
  requestUrl.searchParams.set("domain", `eq.${normalizedDomain}`);
  requestUrl.searchParams.set("limit", "1");

  const response = await fetch(requestUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const records = (await response.json()) as Array<{ slug?: string }>;
  return records[0]?.slug ?? null;
}
