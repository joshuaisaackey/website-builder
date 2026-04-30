import { normalizeHostname } from "@/lib/business";
import {
  getSupabasePublicClient,
  isSupabasePublicClientConfigured,
  logSupabaseError,
} from "@/lib/supabase";
import type { BusinessRecord } from "@/lib/types";

export async function findBusinessBySlug(slug: string) {
  try {
    if (!isSupabasePublicClientConfigured()) {
      logSupabaseError(
        "findBusinessBySlug missing configuration",
        new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."),
      );
      return null;
    }

    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      logSupabaseError(`findBusinessBySlug failed for slug "${slug}"`, error);
      return null;
    }

    return (data as BusinessRecord | null) ?? null;
  } catch (error) {
    logSupabaseError(`findBusinessBySlug threw for slug "${slug}"`, error);
    return null;
  }
}

export async function findBusinessSlugByDomain(domain: string) {
  const normalizedDomain = normalizeHostname(domain);

  if (!normalizedDomain) {
    return null;
  }

  try {
    if (!isSupabasePublicClientConfigured()) {
      logSupabaseError(
        "findBusinessSlugByDomain missing configuration",
        new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."),
      );
      return null;
    }

    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("slug")
      .eq("domain", normalizedDomain)
      .limit(1)
      .maybeSingle();

    if (error) {
      logSupabaseError(`findBusinessSlugByDomain failed for domain "${normalizedDomain}"`, error);
      return null;
    }

    return data?.slug ?? null;
  } catch (error) {
    logSupabaseError(`findBusinessSlugByDomain threw for domain "${normalizedDomain}"`, error);
    return null;
  }
}
