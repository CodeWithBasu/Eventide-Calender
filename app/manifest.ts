import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eventide Calendar",
    short_name: "Eventide",
    description: "Your comprehensive guide to design events, conferences, and festivals worldwide in 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#14b8a6", // Teal color from the new 3D icon
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
