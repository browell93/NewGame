import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingdoms of Ash",
  description:
    "A browser-first multiplayer medieval city and war strategy game foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
