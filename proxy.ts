import { NextResponse, type NextRequest } from "next/server";
import { normalizeHostname } from "@/lib/business";
import { findBusinessSlugByDomain } from "@/lib/business-store";

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

export async function proxy(request: NextRequest) {
  const hostname = normalizeHostname(request.nextUrl.hostname);

  if (isLocalHostname(hostname)) {
    return NextResponse.next();
  }

  const businessSlug = await findBusinessSlugByDomain(hostname);

  if (!businessSlug) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/site/${businessSlug}`;
  rewriteUrl.search = "";

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|dashboard|site|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)",
  ],
};
