"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BusinessSiteTemplate } from "@/components/business-site-template";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardInset, CardSoft } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { slugifyBusinessName } from "@/lib/business";
import type {
  BusinessFormPayload,
  BusinessRecord,
  BusinessSiteData,
  MenuItem,
} from "@/lib/types";

type BusinessFormProps = {
  initialBusiness: BusinessRecord | null;
  businesses: BusinessRecord[];
};

type FormState = {
  id?: string;
  businessName: string;
  businessType: string;
  description: string;
  domain: string;
  city: string;
  phone: string;
  servicesText: string;
  menuItems: MenuItem[];
};

function toFormState(business: BusinessRecord | null): FormState {
  if (!business) {
    return {
      businessName: "",
      businessType: "Local Business",
      description: "",
      domain: "",
      city: "",
      phone: "",
      servicesText: "",
      menuItems: [{ name: "", price: "" }],
    };
  }

  return {
    id: business.id,
    businessName: business.business_name,
    businessType: business.business_type ?? "Local Business",
    description: business.description ?? "",
    domain: business.domain ?? "",
    city: business.city,
    phone: business.phone,
    servicesText: business.services.join("\n"),
    menuItems:
      business.menu_items.length > 0 ? business.menu_items : [{ name: "", price: "" }],
  };
}

function toPayload(form: FormState): BusinessFormPayload {
  return {
    id: form.id,
    businessName: form.businessName,
    businessType: form.businessType,
    description: form.description,
    domain: form.domain,
    city: form.city,
    phone: form.phone,
    services: form.servicesText.split("\n"),
    menuItems: form.menuItems,
  };
}

function toPreviewBusiness(form: FormState): BusinessSiteData {
  return {
    id: form.id,
    slug: undefined,
    business_name: form.businessName.trim() || "Your Business",
    business_type: form.businessType.trim() || "Local Business",
    description:
      form.description.trim() ||
      "A simple, professional website built to help visitors understand what you offer and contact you quickly.",
    domain: form.domain.trim(),
    city: form.city.trim() || "Your City",
    phone: form.phone.trim() || "(555) 555-5555",
    services: form.servicesText
      .split("\n")
      .map((service) => service.trim())
      .filter(Boolean),
    menu_items: form.menuItems
      .map((item) => ({
        name: item.name.trim(),
        price: item.price.trim(),
      }))
      .filter((item) => item.name && item.price),
  };
}

function toPreviewBusinessFromPayload(payload: BusinessFormPayload): BusinessSiteData {
  return {
    id: payload.id,
    slug: undefined,
    business_name: payload.businessName.trim() || "Your Business",
    business_type: payload.businessType.trim() || "Local Business",
    description:
      payload.description.trim() ||
      "A simple, professional website built to help visitors understand what you offer and contact you quickly.",
    domain: payload.domain.trim(),
    city: payload.city.trim() || "Your City",
    phone: payload.phone.trim() || "(555) 555-5555",
    services: payload.services.map((service) => service.trim()).filter(Boolean),
    menu_items: payload.menuItems
      .map((item) => ({
        name: item.name.trim(),
        price: item.price.trim(),
      }))
      .filter((item) => item.name && item.price),
  };
}

function upsertBusiness(
  records: BusinessRecord[],
  business: BusinessSiteData & { id: string; updated_at: string; created_at?: string },
) {
  const existing = records.find((record) => record.id === business.id);
  const nextRecord: BusinessRecord = {
    id: business.id,
    slug: business.slug,
    business_name: business.business_name,
    business_type: business.business_type,
    description: business.description,
    domain: business.domain,
    city: business.city,
    phone: business.phone,
    services: business.services,
    menu_items: business.menu_items,
    created_at: existing?.created_at ?? business.created_at ?? new Date().toISOString(),
    updated_at: business.updated_at,
  };

  const withoutCurrent = records.filter((record) => record.id !== business.id);
  return [nextRecord, ...withoutCurrent].sort(
    (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

export function BusinessForm({ initialBusiness, businesses }: BusinessFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialBusiness));
  const [savedBusinesses, setSavedBusinesses] = useState<BusinessRecord[]>(businesses);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<
    { id: string; slug: string; mode: "created" | "updated" } | null
  >(
    initialBusiness
      ? { id: initialBusiness.id, slug: initialBusiness.slug, mode: "updated" }
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<number | null>(null);
  const skipAutosaveRef = useRef(true);
  const lastSavedSnapshotRef = useRef(JSON.stringify(toPayload(toFormState(initialBusiness))));

  const previewBusiness = useMemo(() => toPreviewBusiness(form), [form]);
  const generatedSlug = useMemo(() => {
    const businessName = form.businessName.trim();
    return businessName ? slugifyBusinessName(businessName) : "";
  }, [form.businessName]);
  const previewSlug = result?.slug ?? initialBusiness?.slug;
  const selectedLabel = useMemo(() => {
    const name = form.businessName.trim();
    return name ? `Editing ${name}` : "New business";
  }, [form.businessName]);

  function updateMenuItem(index: number, field: keyof MenuItem, value: string) {
    setForm((current) => ({
      ...current,
      menuItems: current.menuItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addMenuItem() {
    setForm((current) => ({
      ...current,
      menuItems: [...current.menuItems, { name: "", price: "" }],
    }));
  }

  function removeMenuItem(index: number) {
    setForm((current) => ({
      ...current,
      menuItems:
        current.menuItems.length === 1
          ? [{ name: "", price: "" }]
          : current.menuItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  const persistForm = useCallback(async (payload: BusinessFormPayload) => {
    setIsSaving(true);
    setSaveState("saving");
    setError(null);

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as
        | { id: string; slug: string; mode: "created" | "updated" }
        | { error: string };

      if (!response.ok || !("id" in data)) {
        throw new Error("error" in data ? data.error : "Unable to save the business.");
      }

      const nextUpdatedAt = new Date().toISOString();
      setForm((current) => ({ ...current, id: data.id }));
      setResult(data);
      setSaveState("saved");
      lastSavedSnapshotRef.current = JSON.stringify({ ...payload, id: data.id });
      const previewRecord = {
        ...toPreviewBusinessFromPayload({ ...payload, id: data.id }),
        id: data.id,
        slug: data.slug,
        updated_at: nextUpdatedAt,
      };
      setSavedBusinesses((current) => upsertBusiness(current, previewRecord));
      if (!payload.id) {
        router.replace(`/dashboard?id=${data.id}`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to save the business.",
      );
      setSaveState("dirty");
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistForm(toPayload(form));
  }

  useEffect(() => {
    const payload = toPayload(form);
    const canAutosave = Boolean(
      payload.businessName.trim() && payload.city.trim() && payload.phone.trim(),
    );
    const snapshot = JSON.stringify(payload);

    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    if (snapshot === lastSavedSnapshotRef.current) {
      setSaveState("saved");
      return;
    }

    setSaveState(canAutosave ? "dirty" : "idle");

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    if (!canAutosave) {
      return;
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void persistForm(payload);
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form, persistForm]);

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
      <Card className="p-4 md:p-5">
        <div className="rounded-[1.5rem] bg-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Workspace
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {selectedLabel}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Use the sections on the right to build a simple, professional site that drives calls.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-3 text-sm">
            <span className="font-medium text-foreground">Autosave:</span>{" "}
            <span className="text-muted">
              {saveState === "saving"
                ? "Saving changes..."
                : saveState === "saved"
                  ? "All changes saved."
                  : saveState === "dirty"
                    ? "Changes will save automatically."
                    : "Fill in the required fields to start saving."}
            </span>
          </div>
          {previewSlug ? (
            <LinkButton
              href={`/site/${previewSlug}`}
              target="_blank"
              className="mt-5 flex w-full"
              size="lg"
            >
              Preview Website
            </LinkButton>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-white px-4 py-4 text-center text-sm text-muted">
              Save this business to unlock preview
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          {[
            ["Business Info", "Name, type, location, phone, and domain"],
            ["Services", "List services, features, categories, or benefits"],
            ["Offerings", "Feature products, packages, pricing, or calls to action"],
          ].map(([title, copy]) => (
            <CardInset key={title} className="px-4 py-4">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
            </CardInset>
          ))}
        </div>

        <CardInset className="mt-5 p-4">
          <h3 className="text-sm font-semibold text-foreground">Saved businesses</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Reopen any saved record or jump to its live site.
          </p>
          <div className="mt-4 grid gap-3">
            {savedBusinesses.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-surface p-4 text-sm text-muted">
                No businesses saved yet.
              </div>
            ) : (
              savedBusinesses.map((business) => (
                <CardSoft key={business.id} className="p-4">
                  <p className="text-sm font-semibold text-foreground">{business.business_name}</p>
                  <p className="mt-1 text-sm text-muted">{business.city}</p>
                  <p className="mt-1 text-xs text-muted">
                    {business.domain ? business.domain : "No custom domain"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {business.slug ? `/site/${business.slug}` : "Save this record to generate a slug"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <LinkButton
                      href={`/dashboard?id=${business.id}`}
                      variant="secondary"
                      className="flex-1 rounded-full"
                      size="sm"
                    >
                      Edit
                    </LinkButton>
                    {business.slug ? (
                      <LinkButton
                        href={`/site/${business.slug}`}
                        target="_blank"
                        className="flex-1 rounded-full"
                        size="sm"
                      >
                        View
                      </LinkButton>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1 rounded-full"
                        size="sm"
                        disabled
                      >
                        No slug yet
                      </Button>
                    )}
                  </div>
                </CardSoft>
              ))
            )}
          </div>
        </CardInset>
      </Card>

      <Card className="p-5 md:p-7">
        <div className="flex flex-col gap-3 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Dashboard
          </p>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Build your business page
              </h1>
              <p className="mt-2 text-sm text-muted">
                Clear sections, generous spacing, and a fast path to preview and publish.
              </p>
            </div>
            <span className="rounded-full bg-soft px-4 py-2 text-sm font-medium text-accent-dark">
              {selectedLabel}
            </span>
          </div>
        </div>

        <form className="mt-6 grid gap-6" onSubmit={handleSubmit}>
          <Section
            title="Business Info"
            description="Add the core details visitors need to trust and contact the business quickly."
          >
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Business name
                <input
                  required
                  value={form.businessName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, businessName: event.target.value }))
                  }
                  className="ui-input"
                  placeholder="BrightPath Consulting"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Slug
                <input
                  readOnly
                  value={generatedSlug}
                  className="ui-input bg-soft text-muted"
                  placeholder="brightpath-consulting"
                />
                <span className="text-xs leading-5 text-muted">
                  Generated from the business name. If that slug is already taken, a numeric suffix
                  is added automatically when you save.
                </span>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Business type
                  <select
                    required
                    value={form.businessType}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, businessType: event.target.value }))
                    }
                    className="ui-input"
                  >
                    <option>Local Business</option>
                    <option>Contractor</option>
                    <option>Consultant</option>
                    <option>Salon or Spa</option>
                    <option>Fitness or Wellness</option>
                    <option>Healthcare</option>
                    <option>Retail Store</option>
                    <option>Restaurant or Food</option>
                    <option>Professional Services</option>
                    <option>Real Estate</option>
                    <option>Automotive</option>
                    <option>Education or Coaching</option>
                    <option>Nonprofit</option>
                    <option>Event or Venue</option>
                    <option>Custom Website</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  City or location
                  <input
                    required
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, city: event.target.value }))
                    }
                    className="ui-input"
                    placeholder="Austin, Texas"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Phone number
                  <input
                    required
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="ui-input"
                    placeholder="(512) 555-0123"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Custom domain
                  <input
                    value={form.domain}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, domain: event.target.value }))
                    }
                    className="ui-input"
                    placeholder="example.com"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Website description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="ui-input min-h-28 resize-y rounded-[1.25rem]"
                  placeholder="Trusted local experts for repairs, installs, coaching, or service."
                />
              </label>
            </div>
          </Section>

          <Section
            title="Services"
            description="Add one service, product category, feature, or benefit per line. Keep them short and easy to scan."
          >
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Services list
              <textarea
                value={form.servicesText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, servicesText: event.target.value }))
                }
                className="ui-input min-h-40 resize-y rounded-[1.25rem]"
                placeholder={"Free estimates\nEmergency appointments\nCustom packages\nOnline booking"}
              />
            </label>
          </Section>

          <Section
            title="Offerings"
            description="Feature products, service packages, pricing, memberships, consultations, or any key calls to action."
            headingClassName="mb-5 flex items-start justify-between gap-4"
            actions={
              <Button
                type="button"
                onClick={addMenuItem}
                variant="secondary"
                size="sm"
                className="rounded-full"
              >
                Add item
              </Button>
            }
          >
            <div className="grid gap-4">
              {form.menuItems.map((item, index) => (
                <CardSoft key={`${index}-${item.name}`} className="p-4">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                    <input
                      value={item.name}
                      onChange={(event) => updateMenuItem(index, "name", event.target.value)}
                      className="ui-input"
                      placeholder="Starter package"
                    />
                    <input
                      value={item.price}
                      onChange={(event) => updateMenuItem(index, "price", event.target.value)}
                      className="ui-input"
                      placeholder="$99 or Call for quote"
                    />
                    <Button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      variant="secondary"
                      className="rounded-full text-muted"
                    >
                      Remove
                    </Button>
                  </div>
                </CardSoft>
              ))}
            </div>
          </Section>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {result ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Business {result.mode === "created" ? "created" : "updated"} successfully.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={isSaving}
              className="shadow-[0_12px_30px_rgba(31,111,235,0.18)]"
              size="lg"
            >
              {isSaving ? "Saving..." : form.id ? "Save now" : "Create business"}
            </Button>

            {previewSlug ? (
              <LinkButton
                href={`/site/${previewSlug}`}
                target="_blank"
                variant="secondary"
                className="border-accent bg-soft text-accent hover:bg-white"
                size="lg"
              >
                Preview website
              </LinkButton>
            ) : (
              <span className="inline-flex items-center justify-center rounded-2xl border border-dashed border-border px-6 py-4 text-sm text-muted">
                Save first to enable preview
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Live Preview
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preview updates instantly</h2>
              <p className="mt-1 text-sm text-muted">
                This uses your current form state and saves automatically in the background.
              </p>
            </div>
            {previewSlug ? (
              <LinkButton href={`/site/${previewSlug}`} target="_blank" variant="secondary" size="sm">
                Open page
              </LinkButton>
            ) : null}
          </div>
        </div>
        <div className="max-h-[calc(100vh-8rem)] overflow-auto bg-[#edf3ff] p-3 md:p-4">
          <div className="rounded-[1.75rem] border border-border bg-background p-3 shadow-sm">
            <BusinessSiteTemplate business={previewBusiness} compact />
          </div>
        </div>
      </Card>
    </div>
  );
}
