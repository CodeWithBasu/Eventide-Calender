import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        savedBy: {
          include: {
            user: {
              include: {
                pushSubscriptions: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const users = await prisma.user.findMany({
      include: {
        pushSubscriptions: true
      },
      take: 5
    });

    return NextResponse.json({
      serverTime: new Date().toISOString(),
      recentEvents: events,
      recentUsers: users,
      envVars: {
        hasVapidPublic: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
        vapidSubject: process.env.VAPID_SUBJECT,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
