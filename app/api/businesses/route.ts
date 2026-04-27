import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sanitizeBusinessPayload, slugifyBusinessName } from "@/lib/business";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { BusinessFormPayload } from "@/lib/types";

async function generateUniqueSlug(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  businessName: string,
  currentBusinessId?: string,
) {
  const baseSlug = slugifyBusinessName(businessName);

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || data.id === currentBusinessId) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BusinessFormPayload;
    const supabase = getSupabaseServerClient();
    const business = sanitizeBusinessPayload(payload);

    if (business.id) {
      const { data: existingBusiness, error: existingBusinessError } = await supabase
        .from("businesses")
        .select("id, slug")
        .eq("id", business.id)
        .single();

      if (existingBusinessError) {
        throw existingBusinessError;
      }

      const slug = await generateUniqueSlug(supabase, business.business_name, business.id);
      const { data, error } = await supabase
        .from("businesses")
        .update({
          slug,
          business_name: business.business_name,
          business_type: business.business_type,
          description: business.description,
          domain: business.domain,
          city: business.city,
          phone: business.phone,
          services: business.services,
          menu_items: business.menu_items,
        })
        .eq("id", business.id)
        .select("id, slug")
        .single();

      if (error) {
        throw error;
      }

      revalidatePath("/dashboard");
      revalidatePath(`/site/${data.slug}`);
      if (existingBusiness.slug !== data.slug) {
        revalidatePath(`/site/${existingBusiness.slug}`);
      }

      return NextResponse.json({ id: data.id, slug: data.slug, mode: "updated" });
    }

    const slug = await generateUniqueSlug(supabase, business.business_name);
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        slug,
        business_name: business.business_name,
        business_type: business.business_type,
        description: business.description,
        domain: business.domain,
        city: business.city,
        phone: business.phone,
        services: business.services,
        menu_items: business.menu_items,
      })
      .select("id, slug")
      .single();

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath(`/site/${data.slug}`);

    return NextResponse.json({ id: data.id, slug: data.slug, mode: "created" }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong while saving the business.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
