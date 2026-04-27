import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fbf7f1_0%,_#f3efe7_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-border/70 bg-white/85 px-8 py-14 text-center shadow-[0_24px_90px_rgba(90,57,34,0.12)] backdrop-blur md:px-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Business Builder
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Build a business website in minutes.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
            Create a clean landing page for any local business with a simple dashboard and instant
            preview.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-[0_20px_40px_rgba(180,106,50,0.26)] hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </section>
      </div>
    </main>
  );
}
