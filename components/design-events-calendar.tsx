"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { eventsData, type Event } from "@/lib/events-data"
import { downloadICS } from "@/lib/generate-ics"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggleButton } from "./theme-toggle"
import { useSession, signIn, signOut } from "next-auth/react"
import { getEvents, addEvent, toggleSavedEvent, getSavedEvents } from "@/app/actions"
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
  Edit,
  List as ListIcon,
  LayoutGrid,
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
  const { data: session, status } = useSession()
  const [savedEvents, setSavedEvents] = useState<string[]>([])
  const [showOnlySaved, setShowOnlySaved] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  
  // Add Event State
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [localEvents, setLocalEvents] = useState<Event[]>(eventsData)
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [addEventDate, setAddEventDate] = useState<{ month: string; day: number } | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "Meeting",
    color: "Blue",
    tags: [] as string[],
  })

  const { toast } = useToast()

  useEffect(() => {
    getEvents().then((data) => {
      if (data.length > 0) {
        setLocalEvents(data as any)
      } else {
        // Fallback to static if db empty during testing
        setLocalEvents(eventsData)
      }
    })
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      getSavedEvents(session.user.id).then(setSavedEvents)
    } else {
      setSavedEvents([])
    }
  }, [session])

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
    if (!session && status !== "loading") {
      const timer = setTimeout(() => {
        toast({
          title: "Save your favorite events",
          description: 'Sign in to save events and access your personalized "My Events" view.',
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [session, status, toast])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: authEmail,
        password: authPassword,
      })

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "You have been successfully signed in.",
        })
        setAuthDialogOpen(false)
        setAuthEmail("")
        setAuthPassword("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  const openAddEventDialog = (day: number, month: string) => {
    setEditingEventId(null)
    setAddEventDate({ day, month })
    setNewEvent({ 
      title: "", 
      description: "", 
      startTime: "", 
      endTime: "", 
      category: "Meeting", 
      color: "Blue", 
      tags: [] 
    })
    setAddEventDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id || null)
    setAddEventDate({ month: event.month, day: event.startDay })
    
    let startTime = ""
    let endTime = ""
    if (event.time && event.time.includes(" - ")) {
      const parts = event.time.split(" - ")
      startTime = parts[0].replace(" ", "T")
      endTime = parts[1].replace(" ", "T")
    }

    setNewEvent({
      title: event.name,
      description: event.description || "",
      startTime,
      endTime,
      category: event.eventType || "Meeting",
      color: event.color || "Blue",
      tags: event.tags || [],
    })
    
    setEventDialogOpen(false)
    setAddEventDialogOpen(true)
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await addEvent(newEvent as any)

    if (res.success && res.event) {
      setLocalEvents((prev) => [res.event as any, ...prev])
      setAddEventDialogOpen(false)
      setNewEvent({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "Meeting",
        color: "Blue",
        tags: [],
      })
      toast({
        title: "Event created successfully",
        description: "Your custom event has been added to the calendar.",
      })
    } else {
      toast({
        title: "Error creating event",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleSaveEvent = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to save events.",
        variant: "destructive",
      })
      setAuthDialogOpen(true)
      return
    }

    // Optimistic UI update
    setSavedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId)
      } else {
        return [...prev, eventId]
      }
    })

    // Server action
    const res = await toggleSavedEvent(session.user.id as string, eventId)
    if (!res.success) {
      // Revert if failed
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      })
      getSavedEvents(session.user.id as string).then(setSavedEvents)
    } else {
      toast({
        title: res.saved ? "Event saved" : "Event removed",
        description: res.saved
          ? "This event has been added to your saved events."
          : "This event has been removed from your saved events.",
      })
    }
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

  const filteredEvents = localEvents.filter((event) => {
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
                <ThemeToggleButton variant="circle-blur" start="top-right" />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Left side: Search and filters */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* View Toggle */}
                <div className="flex bg-[#121214] p-1 rounded-md border border-[#2a2a2c]">
                  <button 
                    onClick={() => setViewMode("calendar")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Calendar
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ListIcon className="h-4 w-4" />
                    List
                  </button>
                </div>

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
                    <form onSubmit={handleLogin} className="space-y-4">
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Loading..." : authMode === "signin" ? "Sign In" : "Create Account"}
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
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Right side: Print, My Events, User */}
              <div className="flex items-center gap-4 flex-wrap">
                <Button variant="outline" size="icon" onClick={handlePrint} aria-label="Download PDF">
                  <FileDown className="h-4 w-4" />
                </Button>

                {session && (
                  <Button
                    variant={showOnlySaved ? "default" : "outline"}
                    size="default"
                    onClick={() => setShowOnlySaved(!showOnlySaved)}
                  >
                    <Heart className="h-4 w-4" />
                    My Events ({savedEvents.length})
                  </Button>
                )}

                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="default">
                        <User className="h-4 w-4" />
                        {session.user?.email}
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
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

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium">
                      {selectedEvent.location} {selectedEvent.flag}
                    </p>
                    {selectedEvent.venue && <p className="text-muted-foreground">{selectedEvent.venue}</p>}
                  </div>
                </div>
              )}

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
                {selectedEvent.isCustom && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditEvent(selectedEvent)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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

      <Dialog open={addEventDialogOpen} onOpenChange={setAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 bg-[#0f0f11] border-[#2a2a2c] text-foreground">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold text-gray-100">Add Event for {addEventDate?.month} {addEventDate?.day}</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1.5">
              Create a custom event for this day. It will appear on your calendar immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEventSubmit} className="space-y-5 pt-2">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-200">Title</Label>
              <Input
                required
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
                className="bg-[#121214] border-[#2a2a2c] h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-200">Description</Label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
                className="flex min-h-[90px] w-full rounded-md border border-[#2a2a2c] bg-[#121214] px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Start / End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-200">Start Time</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="bg-[#121214] border-[#2a2a2c] h-11 w-full [color-scheme:dark] pr-3 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-200">End Time</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="bg-[#121214] border-[#2a2a2c] h-11 w-full [color-scheme:dark] pr-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Category / Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-200">Category</Label>
                <div className="relative">
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-[#2a2a2c] bg-[#121214] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-gray-200 appearance-none"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Personal">Personal</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-200">Color</Label>
                <div className="relative flex items-center">
                  <select
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-[#2a2a2c] bg-[#121214] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none text-gray-200"
                  >
                    <option value="Blue">Blue</option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Orange">Orange</option>
                    <option value="Purple">Purple</option>
                  </select>
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-[4px] pointer-events-none"
                    style={{
                      backgroundColor:
                        newEvent.color === "Blue" ? "#3b82f6" :
                        newEvent.color === "Red" ? "#ef4444" :
                        newEvent.color === "Green" ? "#22c55e" :
                        newEvent.color === "Orange" ? "#f97316" :
                        "#a855f7",
                    }}
                  ></div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2.5">
              <Label className="text-[13px] font-semibold text-gray-200">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {["Important", "Urgent", "Work", "Personal", "Team", "Client"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = newEvent.tags.includes(tag)
                        ? newEvent.tags.filter((t) => t !== tag)
                        : [...newEvent.tags, tag]
                      setNewEvent({ ...newEvent, tags })
                    }}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                      newEvent.tags.includes(tag)
                        ? "bg-white text-black"
                        : "bg-transparent text-gray-300 border border-[#2a2a2c] hover:bg-[#1f1f22]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-[#2a2a2c] text-white hover:bg-[#1f1f22] hover:text-white"
                onClick={() => setAddEventDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-gray-200">
                Create
              </Button>
            </div>
          </form>
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

              {viewMode === "calendar" ? (
                <div className="flex-1 grid grid-cols-7 gap-px bg-border border border-border">
                  {monthData.map((day, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (day.date) openAddEventDialog(day.date, month)
                      }}
                      className={`bg-background p-2 min-h-[120px] transition-colors hover:bg-accent/50 ${day.date ? "cursor-pointer" : ""} ${
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEventClick(event)
                                  }}
                                  className={`block text-xs p-2.5 border-l-[3px] rounded-r-md transition-all hover:pl-3.5 cursor-pointer group relative shadow-sm ${
                                    event.color === "Blue" ? "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20" :
                                    event.color === "Red" ? "border-red-500 bg-red-500/10 hover:bg-red-500/20" :
                                    event.color === "Green" ? "border-green-500 bg-green-500/10 hover:bg-green-500/20" :
                                    event.color === "Orange" ? "border-orange-500 bg-orange-500/10 hover:bg-orange-500/20" :
                                    event.color === "Purple" ? "border-purple-500 bg-purple-500/10 hover:bg-purple-500/20" :
                                    "border-primary bg-primary/5 hover:bg-primary/10"
                                  }`}
                                >
                                  <div className={`font-semibold leading-tight mb-0.5 ${
                                    event.color === "Blue" ? "text-blue-400" :
                                    event.color === "Red" ? "text-red-400" :
                                    event.color === "Green" ? "text-green-400" :
                                    event.color === "Orange" ? "text-orange-400" :
                                    event.color === "Purple" ? "text-purple-400" :
                                    "text-foreground"
                                  }`}>{event.name}</div>
                                  {event.edition && (
                                    <span className="inline-block mt-1 text-[10px] bg-background px-1 py-0.5 rounded">
                                      {event.edition}
                                    </span>
                                  )}
                                  <div className="mt-1 flex items-center text-muted-foreground/80">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{event.time}</span>
                                  </div>
                                  {event.location && (
                                    <div className="text-muted-foreground mt-1 flex items-center justify-between">
                                      <span>{event.location} {event.flag}</span>
                                    </div>
                                  )}

                                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              ) : (
                <div className="flex-1 space-y-6">
                  {(() => {
                    const monthEvents = filteredEvents.filter(e => e.month === month)
                    monthEvents.sort((a, b) => a.startDay - b.startDay)

                    const grouped = monthEvents.reduce((acc, event) => {
                      const day = event.startDay
                      if (!acc[day]) acc[day] = []
                      acc[day].push(event)
                      return acc
                    }, {} as Record<number, Event[]>)

                    if (Object.keys(grouped).length === 0) {
                      return <div className="text-center py-12 border border-[#2a2a2c] border-dashed rounded-xl bg-[#0f0f11] text-muted-foreground">No events for {month}</div>
                    }

                    return Object.keys(grouped).map(dayStr => {
                      const day = parseInt(dayStr)
                      const dateObj = new Date(`${month} ${day}, 2026`)
                      const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                      const eventsForDay = grouped[day]

                      return (
                        <div key={day} className="space-y-3">
                          <h3 className="text-[13px] text-muted-foreground font-medium pl-1">{dateStr}</h3>
                          <div className="space-y-2">
                            {eventsForDay.map((event, idx) => {
                              const dotColor = 
                                event.color === "Blue" ? "bg-blue-500" :
                                event.color === "Red" ? "bg-red-500" :
                                event.color === "Green" ? "bg-green-500" :
                                event.color === "Orange" ? "bg-orange-500" :
                                event.color === "Purple" ? "bg-purple-500" :
                                "bg-primary"

                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => handleEventClick(event)}
                                  className="flex items-start justify-between p-4 rounded-xl border border-[#2a2a2c] bg-[#0f0f11] hover:border-border transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-[9px] h-[9px] rounded-full mt-1.5 shrink-0 ${dotColor}`}></div>
                                    <div>
                                      <h4 className="text-[15px] font-semibold text-gray-100">
                                        {event.name} 
                                        {event.edition && <span className="text-xs ml-2 bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">{event.edition}</span>}
                                      </h4>
                                      {event.description && (
                                        <p className="text-[13px] text-gray-400 mt-1 max-w-2xl">{event.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                                        <div className="flex items-center text-[12px] text-gray-400">
                                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                                          {event.time}
                                        </div>
                                        {event.tags && event.tags.length > 0 && (
                                          <div className="flex items-center gap-1.5">
                                            {event.tags.map(tag => (
                                              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-[#2a2a2c] text-gray-300">
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="shrink-0 ml-4 hidden sm:block">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#2a2a2c] text-gray-300 font-medium capitalize">
                                      {event.eventType || "Event"}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
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
