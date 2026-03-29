import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Geist } from "next/font/google";

import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GoBank — Private Banking",
    template: "%s — GoBank",
  },
  description:
    "Secure, multi-currency banking with atomic transfers. Built on Go.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "GoBank — Private Banking",
    description: "Secure multi-currency banking with atomic transfers.",
    type: "website",
  },
  // Prevent search engines from indexing auth/private routes
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080809",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${cormorant.variable} ${dmMono.variable} ${geist.variable} bg-obsidian-950 text-ash-100 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
