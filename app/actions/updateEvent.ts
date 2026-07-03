"use server"

import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"

export async function updateEventDate(eventId: string, newStartDay: number, newMonth: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || event.userEmail !== session.user.email) {
      return { success: false, error: "Event not found or unauthorized" }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        startDay: newStartDay,
        month: newMonth
      }
    })

    return { success: true, event: updatedEvent }
  } catch (error) {
    console.error("Failed to update event date:", error)
    return { success: false, error: "Failed to update event date" }
  }
}
