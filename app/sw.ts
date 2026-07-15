import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

/// <reference lib="webworker" />
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: any

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// --- Web Push Notifications ---

self.addEventListener("push", (event: any) => {
  if (event.data) {
    try {
      const data = event.data.json();
      event.waitUntil(
        self.registration.showNotification(data.title || "Eventide", {
          body: data.body || "",
          icon: "/icon.png",
          data: { url: data.url || "/" },
        })
      );
    } catch (e) {
      console.error("Failed to parse push data", e);
    }
  }
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients: any[]) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// --- PWA Widgets API Implementation ---

async function updateWidget(widget: any) {
  if (widget.tag === "upcoming-events-widget") {
    try {
      const response = await fetch("/api/widgets/upcoming-events");
      const data = await response.json();
      
      const payload = {
        data: JSON.stringify(data)
      };

      if ("widgets" in self) {
        await (self as any).widgets.updateByTag("upcoming-events-widget", payload);
      }
    } catch (err) {
      console.error("Failed to update widget", err);
    }
  }
}

self.addEventListener("widgetinstall", (event: any) => {
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener("widgetresume", (event: any) => {
  event.waitUntil(updateWidget(event.widget));
});
