import { CalendarDay } from "@/components/calendar-day"

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

interface Week {
  days: Day[]
}

interface Month {
  id: string
  name: string
  year: number
  weeks: Week[]
}

interface CalendarMonthProps {
  month: Month
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function CalendarMonth({ month }: CalendarMonthProps) {
  return (
    <section id={month.id} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold mb-6">{month.name}</h2>

      <div className="border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-sm font-medium text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {month.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.days.map((day, dayIndex) => (
              <CalendarDay key={dayIndex} day={day} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
