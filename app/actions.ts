"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return events;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function addEvent(data: any) {
  try {
    const event = await prisma.event.create({
      data: {
        name: data.title,
        date: "TBD", // Simplification
        startDay: 1, // Need to parse from actual data
        endDay: 1,
        location: "Online",
        flag: "🌍",
        category: data.category,
        color: data.color,
        url: "#",
        time: `${data.startTime} - ${data.endTime}`,
        tags: data.tags.join(",")
      }
    });
    revalidatePath("/");
    return { success: true, event };
  } catch (error) {
    console.error("Failed to add event:", error);
    return { success: false, error: "Failed to add event" };
  }
}

export async function toggleSavedEvent(userId: string, eventId: string) {
  try {
    // Check if already saved
    const existing = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existing) {
      await prisma.savedEvent.delete({
        where: { id: existing.id }
      });
      revalidatePath("/");
      return { success: true, saved: false };
    } else {
      await prisma.savedEvent.create({
        data: { userId, eventId }
      });
      revalidatePath("/");
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error("Failed to toggle saved event:", error);
    return { success: false, error: "Failed to toggle saved event" };
  }
}

export async function getSavedEvents(userId: string) {
  try {
    const saved = await prisma.savedEvent.findMany({
      where: { userId },
      select: { eventId: true }
    });
    return saved.map(s => s.eventId);
  } catch (error) {
    console.error("Failed to fetch saved events:", error);
    return [];
  }
}
