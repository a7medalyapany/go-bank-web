import type { MetadataRoute } from "next";

// Next.js generates /robots.txt from this file at build time.
// Disallows all authenticated/private routes from search engine crawlers.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/dashboard",
          "/accounts",
          "/transfers",
          "/settings",
          "/verify-email",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
