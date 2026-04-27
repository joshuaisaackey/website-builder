import type { BusinessFormPayload, BusinessRecord, MenuItem } from "@/lib/types";

function normalizeMenuItems(menuItems: MenuItem[]) {
  return menuItems
    .map((item) => ({
      name: item.name.trim(),
      price: item.price.trim(),
    }))
    .filter((item) => item.name.length > 0 && item.price.length > 0);
}

export function sanitizeBusinessPayload(payload: BusinessFormPayload) {
  const businessName = payload.businessName.trim();
  const businessType = payload.businessType.trim() || "Local Business";
  const description = payload.description.trim();
  const domain = normalizeDomain(payload.domain);
  const city = payload.city.trim();
  const phone = payload.phone.trim();
  const services = payload.services
    .map((service) => service.trim())
    .filter((service) => service.length > 0);
  const menuItems = normalizeMenuItems(payload.menuItems);

  if (!businessName || !city || !phone) {
    throw new Error("Business name, city, and phone are required.");
  }

  return {
    id: payload.id,
    business_name: businessName,
    business_type: businessType,
    description,
    domain,
    city,
    phone,
    services,
    menu_items: menuItems,
  };
}

export function slugifyBusinessName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "business";
}

export function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[?#].*$/, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
}

export function normalizeHostname(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
}

export function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mapEmbedUrl(location: string) {
  const query = encodeURIComponent(location);
  return `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

export function sortBusinesses(records: BusinessRecord[]) {
  return [...records].sort(
    (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}
