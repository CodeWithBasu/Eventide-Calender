import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import webpush from "web-push";

const prisma = new PrismaClient();

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@eventide.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

const OFFSETS = [
  { label: "24 hours", minutes: 24 * 60 },
  { label: "5 hours", minutes: 5 * 60 },
  { label: "2 hours", minutes: 2 * 60 },
  { label: "1 hour", minutes: 60 },
  { label: "15 minutes", minutes: 15 },
];

export async function GET(req: Request) {
  // Security check: Only allow requests with a specific auth header or if they come from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Check for each offset
    for (const offset of OFFSETS) {
      const targetStart = new Date(now.getTime() + offset.minutes * 60000);
      const targetEnd = new Date(targetStart.getTime() + 15 * 60000); // 15 minute window

      // Find events starting within this 15 min window
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDateTime: {
            gte: targetStart,
            lt: targetEnd,
          },
        },
        include: {
          savedBy: {
            include: {
              user: {
                include: {
                  pushSubscriptions: true,
                },
              },
            },
          },
        },
      });

      for (const event of upcomingEvents) {
        const payload = JSON.stringify({
          title: `Reminder: ${event.name}`,
          body: `Starts in ${offset.label} at ${event.location}!`,
          url: event.url || "https://eventide-calendar.vercel.app/",
        });

        for (const saved of event.savedBy) {
          for (const sub of saved.user.pushSubscriptions) {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
              );
            } catch (err: any) {
              // If subscription is invalid/expired, remove it
              if (err.statusCode === 410 || err.statusCode === 404) {
                await prisma.pushSubscription.delete({ where: { id: sub.id } });
              } else {
                console.error("Push failed for user", saved.user.id, err);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cron executed successfully" });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
