import { EventCard } from "@/components/event-card"

interface Event {
  name: string
  edition?: string
  time: string
  location: string
  url: string
  continent: string
}

interface Day {
  date: number | null
  events: Event[]
  isCurrentMonth: boolean
}

interface CalendarDayProps {
  day: Day
}

export function CalendarDay({ day }: CalendarDayProps) {
  return (
    <div className="min-h-[120px] border-r last:border-r-0 p-2 bg-white">
      {day.date && (
        <>
          <div className="font-semibold text-sm mb-2">{day.date}</div>
          <div className="space-y-2">
            {day.events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
