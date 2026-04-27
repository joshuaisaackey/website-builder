import { LinkButton } from "@/components/ui/button";
import { Card, CardInset, CardSoft } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { formatPhoneHref, mapEmbedUrl } from "@/lib/business";
import type { BusinessSiteData } from "@/lib/types";

type BusinessSiteTemplateProps = {
  business: BusinessSiteData;
  compact?: boolean;
};

export function BusinessSiteTemplate({
  business,
  compact = false,
}: BusinessSiteTemplateProps) {
  const businessType = business.business_type || "Local Business";
  const description =
    business.description ||
    "A simple, professional website built to help visitors understand what you offer and contact you quickly.";
  const reviews = [
    {
      name: "Jordan R.",
      quote: `Fast communication, clear details, and a great experience with ${business.business_name}.`,
    },
    {
      name: "Taylor M.",
      quote: "Everything felt simple and professional from the first call to the final order.",
    },
    {
      name: "Casey L.",
      quote: `Would absolutely recommend ${business.business_name} to anyone in ${business.city}.`,
    },
  ];

  const shellClassName = compact ? "text-[14px]" : "";
  const heroCardClassName = compact
    ? "overflow-hidden p-5 md:p-6 shadow-[0_18px_48px_rgba(48,31,18,0.10)]"
    : "overflow-hidden p-6 md:p-10 lg:p-14 shadow-[0_30px_100px_rgba(48,31,18,0.12)]";
  const containerClassName = compact
    ? "gap-4 px-0 pb-0"
    : "gap-6 px-4 pb-10 md:gap-8 md:px-6 md:pb-14";

  return (
    <div className={shellClassName}>
      <section className={compact ? "px-0 py-0" : "px-4 py-4 md:px-6 md:py-6"}>
        <Card
          className={`mx-auto max-w-6xl border border-border bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(248,240,230,0.98)_52%,_rgba(244,230,213,0.92)_100%)] ${heroCardClassName}`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(180,106,50,0.16),_transparent_68%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
                {businessType} in {business.city}
              </p>
              <h1
                className={`mt-4 font-semibold tracking-tight text-balance ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl lg:text-7xl"}`}
              >
                {business.business_name} delivers polished service in {business.city}.
              </h1>
              <p
                className={`mt-5 max-w-2xl leading-8 text-muted ${compact ? "text-sm md:text-base" : "text-base md:text-lg lg:text-xl"}`}
              >
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton
                  href={formatPhoneHref(business.phone)}
                  size={compact ? "md" : "lg"}
                  className={compact ? "" : "min-h-14 px-8 text-base"}
                >
                  Call Now
                </LinkButton>
                <LinkButton
                  href="#contact"
                  variant="secondary"
                  size={compact ? "md" : "lg"}
                  className={compact ? "" : "min-h-14 px-8 text-base"}
                >
                  View Contact Info
                </LinkButton>
              </div>
              <div className="mt-8 grid max-w-2xl gap-3 text-sm text-foreground/75 sm:grid-cols-3">
                {[
                  ["Fast response", "Call and conversion-first layout"],
                  ["Premium feel", "Warm visuals with generous spacing"],
                  ["Mobile ready", "Readable sections and large tap targets"],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[1.25rem] border border-white/70 bg-white/60 px-4 py-4 backdrop-blur">
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-1 leading-6 text-muted">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:w-[390px] lg:grid-cols-1">
              {[
                ["Trusted locally", `Chosen by customers across ${business.city} for clear, reliable service.`],
                ["Built to convert", "Strong hierarchy keeps the phone CTA visible and easy to act on."],
                ["Easy to scan", "Services, offers, reviews, and contact details stay clean on mobile."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_16px_40px_rgba(48,31,18,0.06)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <div className={`mx-auto grid max-w-6xl ${containerClassName}`}>
        <section className="grid gap-6 md:grid-cols-2">
          <Section eyebrow="Services" title="What we offer" className="shadow-sm md:p-8">
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {business.services.length > 0 ? (
                business.services.map((service, index) => (
                  <CardSoft
                    key={service}
                    className="bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(246,237,226,0.9)_100%)] px-5 py-5 text-sm text-foreground/85"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-accent shadow-sm">
                      {index + 1}
                    </div>
                    {service}
                  </CardSoft>
                ))
              ) : (
                <p className="text-sm text-muted">No services added yet.</p>
              )}
            </div>
          </Section>

          <Section eyebrow="Offerings" title="Featured options" className="shadow-sm md:p-8">
            <div className="mt-6 grid gap-3">
              {business.menu_items.length > 0 ? (
                business.menu_items.map((item) => (
                  <CardSoft
                    key={`${item.name}-${item.price}`}
                    className="flex items-center justify-between gap-4 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(246,237,226,0.9)_100%)] px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">Featured option</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-accent-dark shadow-sm">
                      {item.price}
                    </span>
                  </CardSoft>
                ))
              ) : (
                <p className="text-sm text-muted">No menu items added yet.</p>
              )}
            </div>
          </Section>
        </section>

        <Section
          eyebrow="Reviews"
          title="Local customers trust us"
          description="Rated 5.0 by happy customers"
          className="shadow-sm md:p-8"
          headingClassName="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <CardSoft
                key={review.name}
                className="bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(246,237,226,0.88)_100%)] p-5"
              >
                <div className="text-base text-accent">★★★★★</div>
                <p className="mt-3 text-sm leading-7 text-muted">{review.quote}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">{review.name}</p>
              </CardSoft>
            ))}
          </div>
        </Section>

        <Card
          id="contact"
          className="grid gap-6 p-6 shadow-sm md:grid-cols-[0.9fr_1.1fr] md:p-8 lg:gap-8 lg:p-10"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Contact
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Contact us today</h2>
            <div className="mt-6 grid gap-4">
              <CardSoft className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Phone
                </p>
                <a
                  className="mt-2 inline-block text-lg font-semibold text-foreground hover:text-accent"
                  href={formatPhoneHref(business.phone)}
                >
                  {business.phone}
                </a>
              </CardSoft>
              <CardSoft className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Location
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">{business.city}</p>
              </CardSoft>
              <CardSoft className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Business
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">{business.business_name}</p>
              </CardSoft>
            </div>
            <LinkButton
              href={formatPhoneHref(business.phone)}
              className={compact ? "mt-6" : "mt-6 min-h-14 px-8 text-base"}
              size={compact ? "md" : "lg"}
            >
              Call Now
            </LinkButton>
          </div>

          <CardSoft className="overflow-hidden">
            <CardInset className="rounded-none border-x-0 border-t-0 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Map</p>
              <p className="text-sm text-muted">
                Find {business.business_name} in {business.city}
              </p>
            </CardInset>
            <iframe
              title={`${business.business_name} map`}
              src={mapEmbedUrl(business.city)}
              loading="lazy"
              className="h-[320px] w-full md:h-full md:min-h-[360px]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </CardSoft>
        </Card>
      </div>
    </div>
  );
}
