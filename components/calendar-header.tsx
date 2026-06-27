"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CalendarHeaderProps {
  selectedContinent: string
  onContinentChange: (continent: string) => void
  currentMonth: string
  onMonthChange: (month: string) => void
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const continents = [
  { value: "all", label: "Filter by Continent" },
  { value: "Asia", label: "Asia" },
  { value: "Europe", label: "Europe" },
  { value: "Latin America", label: "Latin America" },
  { value: "North America", label: "North America" },
  { value: "Oceania", label: "Oceania" },
  { value: "Africa", label: "Africa" },
  { value: "Middle East", label: "Middle East" },
  { value: "Online", label: "Online" },
]

export function CalendarHeader({
  selectedContinent,
  onContinentChange,
  currentMonth,
  onMonthChange,
}: CalendarHeaderProps) {
  const handleMonthSelect = (month: string) => {
    onMonthChange(month)
    window.location.hash = month.toLowerCase()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Design Events Guide 2025</h1>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={currentMonth} onValueChange={handleMonthSelect}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedContinent} onValueChange={onContinentChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {continents.map((continent) => (
                  <SelectItem key={continent.value} value={continent.value}>
                    {continent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="default" size="sm" asChild>
              <a href="https://airtable.com/shr82c2fTb8UgKtXC" target="_blank" rel="noopener noreferrer">
                Submit Your Event
              </a>
            </Button>

            <Button variant="outline" size="sm" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
