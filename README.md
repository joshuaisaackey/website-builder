## Business Builder

This project is a mini Wix-style website generator built inside the existing Next.js app. You fill in a dashboard form, save the data to Supabase, and each business gets its own live route at `/site/[slug]`.

### Stack

- Next.js App Router
- Tailwind CSS v4
- Supabase for storage
- Vercel for deployment

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Create a Supabase project at https://supabase.com.

4. In the Supabase dashboard:
- Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
- Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`.

5. Open the Supabase SQL editor and run the contents of [supabase/schema.sql](/home/isaac/my-builder/supabase/schema.sql:1).

6. Start the app:

```bash
npm run dev
```

7. Open `http://localhost:3000/dashboard`, create a business, and click the preview button to open `/site/[slug]`.

## How Supabase Is Connected

- The server-side client lives in [lib/supabase.ts](/home/isaac/my-builder/lib/supabase.ts:1).
- The dashboard saves data through [app/api/businesses/route.ts](/home/isaac/my-builder/app/api/businesses/route.ts:1).
- The public business page loads data in [app/site/[slug]/page.tsx](/home/isaac/my-builder/app/site/[slug]/page.tsx:1).
- This app uses the service role key only on the server. Do not expose that key in client components.

## Data Model

The `businesses` table stores:

- `business_name`
- `slug`
- `business_type`
- `description`
- `domain`
- `city`
- `phone`
- `services` as a Postgres `text[]`
- `menu_items` as `jsonb`
- timestamps for creation and updates

## Main Routes

- `/` simple landing page
- `/dashboard` create and update businesses
- `/site/[slug]` public business website

## Slugs

Each business gets a URL-safe slug generated from the business name.

- `BrightPath Consulting` becomes `/site/brightpath-consulting`.
- If another business already uses that slug, the app adds a suffix like `brightpath-consulting-2`.
- Slugs are generated on save and enforced as unique in Supabase.
- Public business pages are resolved only by `/site/[slug]`, not by UUID.

## Custom Domains

Each business can optionally store a custom domain like `example.com`.

- Enter the domain in the dashboard without `https://` or paths.
- The app normalizes domains by lowercasing, removing `www.`, and removing ports.
- Incoming requests are checked in [proxy.ts](/home/isaac/my-builder/proxy.ts:1).
- If the request hostname matches a saved business domain, the request is rewritten to `/site/[slug]`.
- If no domain matches, the app falls back to normal routing, including direct `/site/[slug]` URLs.

For production, point the custom domain DNS to your deployed Vercel project and add the domain in Vercel project settings.

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the repository into Vercel.
3. In Vercel project settings, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy the project.
5. Open `/dashboard`, save a business, and use the generated `/site/[slug]` page.

## Notes

- The site template is intentionally simple and mobile-friendly.
- The map uses a Google Maps embed URL generated from the business location field.
- Preview is enabled after the business has been saved once.
