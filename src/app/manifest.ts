import type { MetadataRoute } from "next";

/* Lets people "Add to Home screen" and open GADDA like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GADDA Mattresses",
    short_name: "GADDA",
    description: "Three honest mattresses, made in India. Delivery included, 100 nights to decide.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f3ee",
    theme_color: "#ffffff",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shop mattresses", url: "/mattresses" },
      { name: "Find my match", url: "/sleep-quiz" },
      { name: "Track order", url: "/track-order" },
    ],
  };
}
