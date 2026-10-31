import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Lab | Software Factory Pilot",
  description: "A preview-only starter for a personal financial management product.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
