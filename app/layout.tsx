import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Finance | Private Household Vault",
  description: "Local-first household finance pilot. Development build: use fictional test figures only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
