import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omapala Admin Panel",
  description: "Internal operations console for Omapala admins."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

