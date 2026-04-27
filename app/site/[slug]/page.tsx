import { notFound } from "next/navigation";
import { BusinessSiteTemplate } from "@/components/business-site-template";
import { findBusinessBySlug } from "@/lib/business-store";

export const dynamic = "force-dynamic";

type BusinessSitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BusinessSitePage({ params }: BusinessSitePageProps) {
  const { slug } = await params;
  const business = await findBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen text-foreground">
      <BusinessSiteTemplate business={business} />
    </main>
  );
}
