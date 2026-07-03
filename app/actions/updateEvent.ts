"use server"


import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function updateEventDate(eventId: string, newStartDay: number, newMonth: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return { success: false, error: "Event not found" }
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
