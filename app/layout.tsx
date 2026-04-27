import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Builder",
  description: "Generate simple small business websites from a single dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
