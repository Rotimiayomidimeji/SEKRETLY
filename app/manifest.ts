import type { MetadataRoute } from "next";

// Lets phones install Sekretly to the home screen (and is required for push on iPhone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sekretly",
    short_name: "Sekretly",
    description: "Anonymous messages and party games with your people.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#0c0811",
    theme_color: "#0c0811",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
