import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { addEvent, toggleSavedEvent, sendInstantNotification } from "@/app/actions";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let savedEventIds: string[] = [];
    if (userId) {
      const saved = await prisma.savedEvent.findMany({
        where: { userId },
        select: { eventId: true }
      });
      savedEventIds = saved.map(s => s.eventId);
    }

    return NextResponse.json({ success: true, events, savedEventIds });
  } catch (error) {
    console.error("Mobile Get Events Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, ...eventData } = data;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 401 });
    }

    // Call our existing robust server action logic!
    const result = await addEvent({
      ...eventData,
      startDateISO: eventData.startTime ? new Date(eventData.startTime).toISOString() : null,
    });

    if (result.success && result.event) {
      // Auto-save the event for the creator
      await toggleSavedEvent(userId, result.event.id);
      
      // Send Instant Push Notification
      await sendInstantNotification(userId, eventData.title);

      return NextResponse.json({ success: true, event: result.event });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Mobile Post Event Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
