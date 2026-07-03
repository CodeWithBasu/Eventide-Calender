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

    const duration = event.endDay - event.startDay
    const newEndDay = newStartDay + duration
    const newDateStr = `${newMonth} ${newStartDay}${newEndDay !== newStartDay ? ` - ${newEndDay}` : ""}`

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        startDay: newStartDay,
        endDay: newEndDay,
        month: newMonth,
        date: newDateStr
      }
    })

    return { success: true, event: updatedEvent }
  } catch (error) {
    console.error("Failed to update event date:", error)
    return { success: false, error: "Failed to update event date" }
  }
}
