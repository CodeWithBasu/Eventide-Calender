"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { eventsData, type Event } from "@/lib/events-data"
import { downloadICS } from "@/lib/generate-ics"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sun,
  Moon,
  ChevronDown,
  Search,
  CalendarPlus,
  Database,
  Heart,
  User,
  MapPin,
  Clock,
  ExternalLink,
  Users,
  FileDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const continents = ["Asia", "Europe", "Latin America", "North America", "Oceania", "Africa", "Middle East", "Online"]
const eventTypes = ["conference", "workshop", "meetup", "festival", "online"] as const

export default function DesignEventsCalendar() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null)
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [savedEvents, setSavedEvents] = useState<string[]>([])
  const [showOnlySaved, setShowOnlySaved] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setIsDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    const savedUser = localStorage.getItem("demoUser")
    if (savedUser) {
      setIsLoggedIn(true)
      setUserEmail(savedUser)
    }
    const savedEventIds = localStorage.getItem("savedEvents")
    if (savedEventIds) {
      setSavedEvents(JSON.parse(savedEventIds))
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        toast({
          title: "Save your favorite events",
          description: 'Sign in to save events and access your personalized "My Events" view.',
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, toast])

  const handleMonthSelect = (month: string) => {
    const element = document.getElementById(month.toLowerCase())
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.pushState(null, "", `#${month.toLowerCase()}`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleAddToCalendar = (event: Event, month: string) => {
    const year = 2026
    const monthIndex = months.indexOf(month)
    const startDate = new Date(year, monthIndex, event.startDay)
    const endDate = new Date(year, monthIndex, event.endDay + 1)

    downloadICS({
      name: event.name,
      startDate,
      endDate,
      location: `${event.location} ${event.flag}`,
      url: event.url,
      description: event.edition ? `${event.edition} - ${event.time}` : event.time,
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Event submission:", { authEmail, authPassword })
    alert("This is a demo. To enable submissions, connect a database.")
    setAuthDialogOpen(false)
    setAuthEmail("")
    setAuthPassword("")
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo: just store email in localStorage
    localStorage.setItem("demoUser", authEmail)
    setIsLoggedIn(true)
    setUserEmail(authEmail)
    setAuthDialogOpen(false)
    setAuthEmail("")
    setAuthPassword("")
  }

  const handleSignOut = () => {
    localStorage.removeItem("demoUser")
    setIsLoggedIn(false)
    setUserEmail("")
    setShowOnlySaved(false)
  }

  const toggleSaveEvent = (event: Event) => {
    if (!isLoggedIn) {
      setAuthDialogOpen(true)
      return
    }

    const eventId = `${event.month}-${event.name}-${event.startDay}`
    const newSavedEvents = savedEvents.includes(eventId)
      ? savedEvents.filter((id) => id !== eventId)
      : [...savedEvents, eventId]

    setSavedEvents(newSavedEvents)
    localStorage.setItem("savedEvents", JSON.stringify(newSavedEvents))
  }

  const isEventSaved = (event: Event) => {
    const eventId = `${event.month}-${event.name}-${event.startDay}`
    return savedEvents.includes(eventId)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setEventDialogOpen(true)
  }

  const formatDateRange = (event: Event) => {
    const year = 2026
    const monthIndex = months.indexOf(event.month)
    const startDate = new Date(year, monthIndex, event.startDay)
    const endDate = new Date(year, monthIndex, event.endDay)

    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }

    if (event.startDay === event.endDay) {
      return startDate.toLocaleDateString("en-US", options)
    }
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`
  }

  const filteredEvents = eventsData.filter((event) => {
    const matchesContinent = !selectedContinent || event.continent === selectedContinent
    const matchesEventType = !selectedEventType || event.eventType === selectedEventType
    const matchesSearch =
      !searchQuery ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSaved = !showOnlySaved || isEventSaved(event)

    return matchesContinent && matchesEventType && matchesSearch && matchesSaved
  })

  const today = new Date()
  const currentMonth = months[today.getMonth()]
  const currentDay = today.getDate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 bg-background border-b border-border z-50">
        <div className="px-6 py-4 pb-0">
          <nav className="flex flex-col gap-4">
            {/* Row 1: Title and dark mode toggle */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">
                  <a href="/" className="hover:underline font-medium leading-7">
                    Design Events Guide 2026
                  </a>
                </h1>
                <p className="text-sm text-muted-foreground">Your guide to UX/UI, motion and graphic design events</p>
              </div>
              {/* Dark mode toggle */}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} aria-label="Toggle dark mode" />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Left side: Search and filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default">
                      Choose a month
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {months.map((month) => (
                      <DropdownMenuItem key={month} onClick={() => handleMonthSelect(month)}>
                        {month}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default">
                      {selectedContinent || "Filter by Continent"}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedContinent(null)}>All Continents</DropdownMenuItem>
                    {continents.map((continent) => (
                      <DropdownMenuItem key={continent} onClick={() => setSelectedContinent(continent)}>
                        {continent}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default">
                      {selectedEventType
                        ? selectedEventType.charAt(0).toUpperCase() + selectedEventType.slice(1)
                        : "Event Type"}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedEventType(null)}>All Types</DropdownMenuItem>
                    {eventTypes.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => setSelectedEventType(type)}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="default">
                      Submit Your Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{authMode === "signin" ? "Sign In" : "Create Account"}</DialogTitle>
                      <DialogDescription>
                        {authMode === "signin"
                          ? "Sign in to save events and access them across devices."
                          : "Create an account to save events and access them across devices."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="authEmail">Email</Label>
                        <Input
                          id="authEmail"
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authPassword">Password</Label>
                        <Input
                          id="authPassword"
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full">
                          {authMode === "signin" ? "Sign In" : "Create Account"}
                        </Button>
                      </DialogFooter>
                      <div className="text-center text-sm text-muted-foreground">
                        {authMode === "signin" ? (
                          <>
                            Don't have an account?{" "}
                            <button
                              type="button"
                              className="underline hover:text-foreground"
                              onClick={() => setAuthMode("signup")}
                            >
                              Sign up
                            </button>
                          </>
                        ) : (
                          <>
                            Already have an account?{" "}
                            <button
                              type="button"
                              className="underline hover:text-foreground"
                              onClick={() => setAuthMode("signin")}
                            >
                              Sign in
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                        <User className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          For demo purposes, you can still sign in with any email and password to test the saved events
                          feature.
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md bg-muted text-sm text-muted-foreground">
                        <Database className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          To enable real authentication, connect a database (Supabase, Neon, etc.) with auth support.
                        </p>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Right side: Print, My Events, User */}
              <div className="flex items-center gap-4 flex-wrap">
                <Button variant="outline" size="icon" onClick={handlePrint} aria-label="Download PDF">
                  <FileDown className="h-4 w-4" />
                </Button>

                {isLoggedIn && (
                  <Button
                    variant={showOnlySaved ? "default" : "outline"}
                    size="default"
                    onClick={() => setShowOnlySaved(!showOnlySaved)}
                  >
                    <Heart className="h-4 w-4" />
                    My Events ({savedEvents.length})
                  </Button>
                )}

                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="default">
                        <User className="h-4 w-4" />
                        {userEmail}
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" size="default" onClick={() => setAuthDialogOpen(true)}>
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </nav>

          <div className="flex mt-4">
            <div className="w-[180px] shrink-0" />
            <div className="flex-1 grid grid-cols-7 border-border border-b-0">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className="bg-background p-2 text-center font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl">{selectedEvent.name}</DialogTitle>
                    {selectedEvent.edition && (
                      <span className="inline-block mt-1 text-xs bg-muted px-2 py-0.5 rounded">
                        {selectedEvent.edition}
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                    {selectedEvent.eventType}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium">{formatDateRange(selectedEvent)}, 2026</p>
                    <p className="text-muted-foreground">{selectedEvent.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium">
                      {selectedEvent.location} {selectedEvent.flag}
                    </p>
                    {selectedEvent.venue && <p className="text-muted-foreground">{selectedEvent.venue}</p>}
                  </div>
                </div>

                {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Speakers</p>
                      <p className="text-muted-foreground">{selectedEvent.speakers.join(", ")}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => handleAddToCalendar(selectedEvent, selectedEvent.month)}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                {isLoggedIn && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => toggleSaveEvent(selectedEvent)}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${isEventSaved(selectedEvent) ? "fill-current text-red-500" : ""}`}
                    />
                    {isEventSaved(selectedEvent) ? "Saved" : "Save Event"}
                  </Button>
                )}
                <Button asChild className="flex-1">
                  <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <main className="px-6 py-8">
        {months.map((month) => {
          const generateMonthCalendar = (month: string) => {
            const year = 2026
            const monthIndex = months.indexOf(month)
            const firstDay = new Date(year, monthIndex, 1)
            const lastDay = new Date(year, monthIndex + 1, 0)
            const daysInMonth = lastDay.getDate()

            let startDay = firstDay.getDay()
            startDay = startDay === 0 ? 6 : startDay - 1

            const calendar: { date: number | null; events: Event[] }[] = []

            for (let i = 0; i < startDay; i++) {
              calendar.push({ date: null, events: [] })
            }

            for (let day = 1; day <= daysInMonth; day++) {
              const dayEvents = filteredEvents.filter(
                (event) => event.month === month && day >= event.startDay && day <= event.endDay,
              )
              calendar.push({ date: day, events: dayEvents })
            }

            const remainingCells = (7 - (calendar.length % 7)) % 7
            for (let i = 0; i < remainingCells; i++) {
              calendar.push({ date: null, events: [] })
            }

            return calendar
          }

          const monthData = generateMonthCalendar(month)

          const isToday = (date: number | null) => {
            return date !== null && month === currentMonth && date === currentDay
          }

          return (
            <div key={month} id={month.toLowerCase()} className="mb-16 flex gap-8">
              <div className="w-[180px] shrink-0 sticky top-[170px] self-start h-fit">
                <h2 className="text-4xl font-thin">{month}</h2>
              </div>

              <div className="flex-1 grid grid-cols-7 gap-px bg-border border border-border">
                {monthData.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-background p-2 min-h-[120px] transition-colors hover:bg-accent/50 ${
                      isToday(day.date) ? "ring-2 ring-inset ring-primary" : ""
                    }`}
                  >
                    {day.date && (
                      <>
                        <h3 className={`mb-2 font-mono font-light text-7xl ${isToday(day.date) ? "text-primary" : ""}`}>
                          {day.date}
                        </h3>
                        <div className="space-y-2">
                          {day.events.map((event, eventIndex) => {
                            const eventId = `${event.month}-${event.name}-${event.startDay}`
                            const isSaved = isEventSaved(event)

                            return (
                              <div
                                key={eventIndex}
                                onClick={() => handleEventClick(event)}
                                className="block text-xs p-2 border-l-2 border-primary bg-muted/50 hover:bg-muted transition-all hover:pl-3 hover:border-primary cursor-pointer group relative"
                              >
                                <div className="font-medium leading-tight">{event.name}</div>
                                {event.edition && (
                                  <span className="inline-block mt-1 text-[10px] bg-background px-1 py-0.5 rounded">
                                    {event.edition}
                                  </span>
                                )}
                                <div className="text-muted-foreground mt-1">{event.time}</div>
                                <div className="text-muted-foreground">
                                  {event.location} {event.flag}
                                </div>

                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddToCalendar(event, month)
                                    }}
                                    className="p-1 hover:bg-background rounded"
                                    title="Add to calendar"
                                  >
                                    <CalendarPlus className="h-3 w-3" />
                                  </button>
                                  {isLoggedIn && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleSaveEvent(event)
                                      }}
                                      className={`p-1 hover:bg-background rounded ${isSaved ? "opacity-100" : ""}`}
                                      title={isSaved ? "Remove from saved" : "Save event"}
                                    >
                                      <Heart className={`h-3 w-3 ${isSaved ? "fill-current text-red-500" : ""}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </main>

      <style jsx global>{`
        @media print {
          header {
            position: static;
          }
          button,
          select {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
