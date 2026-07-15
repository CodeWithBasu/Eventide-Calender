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
    // @ts-ignore - Experimental PWA Widgets API
    widgets: [
      {
        name: "Upcoming Design Events",
        description: "View the next upcoming design events right on your widget board.",
        tag: "upcoming-events-widget",
        ms_ac_template: "/widgets/upcoming-events-template.json",
        data: "/api/widgets/upcoming-events",
        type: "application/json",
        icons: [
          {
            src: "/icon.png",
            sizes: "any",
            type: "image/png"
          }
        ]
      }
    ]
  }
}
