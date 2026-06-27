// Utility function to generate ICS calendar file for event export
export function generateICSFile(event: {
  name: string
  startDate: Date
  endDate: Date
  location: string
  url: string
  description?: string
}): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n")
  }

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@designevents.guide`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Design Events Guide//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${escapeText(event.name)}
LOCATION:${escapeText(event.location)}
URL:${event.url}
DESCRIPTION:${escapeText(event.description || `Learn more at ${event.url}`)}
END:VEVENT
END:VCALENDAR`
}

export function downloadICS(event: {
  name: string
  startDate: Date
  endDate: Date
  location: string
  url: string
  description?: string
}): void {
  const icsContent = generateICSFile(event)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${event.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
