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
