import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyLite | SYD → DPS Flight Search",
  description: "A lightweight flight search app for Sydney to Bali (Denpasar) and beyond.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900">{children}</body>
    </html>
  );
}
