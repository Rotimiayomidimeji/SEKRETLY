import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  poweredByHeader: false,
  async headers() {
    return [
      // the UI kit's images and icons rarely change: phones keep them for a month instead of asking every visit
      {
        source: "/:dir(sk|brand|icons)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }],
      },
      // the service worker must always be fresh so updates reach phones
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
      // admin pages: never indexed, never framed, never kept in a shared cache
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
