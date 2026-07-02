"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { eventsData, type Event } from "@/lib/events-data"
import { downloadICS } from "@/lib/generate-ics"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SmoothInput } from "@/components/ui/smooth-input"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { ThemeToggleButton } from "./theme-toggle"
import { useSession, signIn, signOut } from "next-auth/react"
import { getEvents, addEvent, toggleSavedEvent, getSavedEvents, registerUser, updateEvent, deleteEvent } from "@/app/actions"
import { Label } from "@/components/ui/label"
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  Menu,
  List as ListIcon,
  LayoutGrid,
  Settings,
  CheckCircle2,
  Filter,
  Globe,
  Tag,
  LogOut,
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { EventideLogo } from "@/components/ui/text-swiper"
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect"

const dayColors = [
  [[34, 197, 94]],   // 0: Monday (Green)
  [[59, 130, 246]],  // 1: Tuesday (Blue)
  [[234, 179, 8]],   // 2: Wednesday (Yellow)
  [[236, 72, 153]],  // 3: Thursday (Pink)
  [[165, 42, 42]],   // 4: Friday (Brown)
  [[168, 85, 247]],  // 5: Saturday (Purple)
  [[239, 68, 68]],   // 6: Sunday (Red)
]

const CrosshairIcon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
    </svg>
  );
};

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
  const [hoveredDateCell, setHoveredDateCell] = useState<string | null>(null)
  const { data: session, status, update: updateSession } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
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
  const [editEventData, setEditEventData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "Meeting",
    color: "Blue",
    tags: [] as string[],
  })

  const { toast } = useToast()

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

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
    if (status === "authenticated" && (session?.user as any)?.id) {
      getSavedEvents((session.user as any).id).then(setSavedEvents)
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setCropImageSrc(e.target?.result as string)
      setIsCropDialogOpen(true)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const generateCroppedImage = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return

    setIsAvatarUploading(true)
    try {
      const image = new Image()
      image.src = cropImageSrc
      await new Promise((resolve) => (image.onload = resolve))

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const MAX_SIZE = 200
      canvas.width = MAX_SIZE
      canvas.height = MAX_SIZE

      if (ctx) {
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          MAX_SIZE,
          MAX_SIZE
        )
      }

      const base64String = canvas.toDataURL('image/jpeg', 0.8)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      })
      
      if (res.ok) {
        await updateSession()
        toast({ title: "Success", description: "Avatar updated successfully." })
        setIsCropDialogOpen(false)
        setCropImageSrc(null)
      } else {
        toast({ title: "Error", description: "Failed to update avatar.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" })
    } finally {
      setIsAvatarUploading(false)
    }
  }

  const handleMonthSelect = (month: string) => {
    const element = document.getElementById(month.toLowerCase())
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.pushState(null, "", `#${month.toLowerCase()}`)
    }
  }

  const handleScrollToToday = () => {
    const today = new Date()
    const currentMonth = months[today.getMonth()]
    const element = document.getElementById(currentMonth.toLowerCase())
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 200
      window.scrollTo({ top: y, behavior: "smooth" })
      window.history.pushState(null, "", `#${currentMonth.toLowerCase()}`)
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
      if (authMode === "signup") {
        const res = await registerUser({ email: authEmail, password: authPassword })
        if (!res.success) {
          toast({
            title: "Registration Failed",
            description: res.error,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

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



  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await addEvent({
      ...newEvent,
      month: addEventDate?.month,
      startDay: addEventDate?.day,
      endDay: addEventDate?.day,
    })
    setIsLoading(false)
    
    if (result.success) {
      toast({
        title: "Event Added",
        description: "Your event was successfully added.",
      })
      setAddEventDialogOpen(false)
      getEvents().then((data) => {
        if (data.length > 0) setLocalEvents(data as any)
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add event.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent?.id) return
    setIsLoading(true)
    const result = await updateEvent(selectedEvent.id, {
      ...editEventData,
      month: selectedEvent.month,
      startDay: selectedEvent.startDay,
      endDay: selectedEvent.endDay,
    })
    setIsLoading(false)
    
    if (result.success) {
      toast({ title: "Event Updated", description: "Your event was successfully updated." })
      setEventDialogOpen(false)
      getEvents().then((data) => { if (data.length > 0) setLocalEvents(data as any) })
    } else {
      toast({ title: "Error", description: result.error || "Failed to update event.", variant: "destructive" })
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return
    setIsLoading(true)
    const result = await deleteEvent(selectedEvent.id)
    setIsLoading(false)
    
    if (result.success) {
      toast({ title: "Event Deleted", description: "Your event was successfully deleted." })
      setEventDialogOpen(false)
      getEvents().then((data) => { if (data.length > 0) setLocalEvents(data as any) })
    } else {
      toast({ title: "Error", description: result.error || "Failed to delete event.", variant: "destructive" })
    }
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
      category: event.category || "Meeting", 
      color: event.color || "Blue", 
      tags: typeof event.tags === "string" ? event.tags.split(",").filter(Boolean) : ((event.tags as unknown as string[]) || []),
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
    
    if (status !== "authenticated" || !(session?.user as any)?.id) {
      toast({ title: "Authentication Required", description: "Please sign in to save events." })
      return
    }

    const isCurrentlySaved = savedEvents.includes(eventId)
    
    // Optimistic update
    if (isCurrentlySaved) {
      setSavedEvents(prev => prev.filter(id => id !== eventId))
    } else {
      setSavedEvents(prev => [...prev, eventId])
    }
    
    const res = await toggleSavedEvent((session.user as any).id as string, eventId)
    if (!res.success) {
      // Revert if failed
      getSavedEvents((session.user as any).id as string).then(setSavedEvents)
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      })
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
    
    let st = "", et = ""
    try {
      const parts = event.time.split(" - ")
      if (parts.length === 2) {
        st = parts[0]
        et = parts[1]
      }
    } catch(e) {}
    
    setEditEventData({
      title: event.name || "",
      description: event.description || "",
      startTime: st,
      endTime: et,
      category: event.category || "Meeting",
      color: event.color || "Blue",
      tags: Array.isArray(event.tags) ? event.tags : (event.tags ? (event.tags as string).split(",") : [])
    })

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
    <div className="min-h-screen bg-background text-foreground relative">
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust your Avatar</DialogTitle>
            <DialogDescription>Move and scale the image to fit the circle.</DialogDescription>
          </DialogHeader>
          <div className="relative h-[300px] w-full bg-black/10 rounded-lg overflow-hidden">
            {cropImageSrc && (
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="py-4">
            <Label>Zoom</Label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropDialogOpen(false)} disabled={isAvatarUploading}>Cancel</Button>
            <Button onClick={generateCroppedImage} disabled={isAvatarUploading}>
              {isAvatarUploading ? "Saving..." : "Save Avatar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProgressiveBlur position="bottom" className="fixed bottom-0 z-40 pointer-events-none" height="100px" />
      <header className="sticky top-0 bg-background border-b border-border z-50">
        <div className="px-6 py-4 pb-0">
          <nav className="flex flex-col gap-4">
            {/* Row 1: Title and dark mode toggle */}
            <div className="flex items-start justify-between">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-start"
              >
                <EventideLogo />
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm text-muted-foreground mt-0.5"
                >
                  Curated events for creative professionals and visionaries.
                </motion.p>
              </motion.div>
              {/* Dark mode toggle and Mobile Menu */}
              <div className="flex items-center gap-2">
                <ThemeToggleButton variant="polygon" start="top-left" blur={true} />
                
                <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="lg:hidden" 
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0 bg-[#1c1c1e] border-none text-gray-200 rounded-r-2xl sm:rounded-r-3xl overflow-y-auto">
                    <SheetHeader className="p-4 border-b border-[#2c2c2e]/50 flex flex-row items-center justify-between space-y-0 text-left">
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      <Button variant="ghost" size="icon" className="hover:bg-[#2c2c2e] -ml-2" onClick={() => setIsMobileSheetOpen(false)}>
                        <Menu className="h-6 w-6 text-gray-300" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-[#2c2c2e] -mr-2">
                        <Settings className="h-5 w-5 text-gray-400" />
                      </Button>
                    </SheetHeader>

                    <div className="py-2">
                      {/* Views */}
                      <div className="px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                        <button onClick={() => { setViewMode("calendar"); setIsMobileSheetOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all">
                          <div className="flex items-center gap-4">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-lg">Calendar</span>
                          </div>
                          {viewMode === "calendar" && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                        </button>
                        <button onClick={() => { setViewMode("list"); setIsMobileSheetOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all mt-1">
                          <div className="flex items-center gap-4">
                            <ListIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-lg">List</span>
                          </div>
                          {viewMode === "list" && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                        </button>
                      </div>

                      <div className="h-px bg-[#2c2c2e]/50 my-2 border-t border-dashed border-[#444]/30 mx-4" />

                      {/* Filters / Selectors */}
                      <div className="px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '150ms' }}>
                        <button onClick={() => { handleScrollToToday(); setIsMobileSheetOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all mb-2 bg-[#2a2a2c]/50 border border-[#333]">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-[4px] shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                              {new Date().getDate()}
                            </div>
                            <span className="text-lg">Go to Today</span>
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all">
                              <div className="flex items-center gap-4">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <span className="text-lg">Month</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <span>{months[0]}</span>
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] bg-[#2c2c2e] border-none text-gray-200">
                            {months.map((m) => (
                              <DropdownMenuItem key={m} onClick={() => { handleMonthSelect(m); setIsMobileSheetOpen(false); }} className="focus:bg-[#3c3c3e] focus:text-white">
                                {m}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all mt-1">
                              <div className="flex items-center gap-4">
                                <Globe className="h-5 w-5 text-blue-400" />
                                <span className="text-lg">Continent</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-[120px]">
                                <span className="truncate">{selectedContinent || "All"}</span>
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] bg-[#2c2c2e] border-none text-gray-200">
                            <DropdownMenuItem onClick={() => { setSelectedContinent(null); setIsMobileSheetOpen(false); }} className="focus:bg-[#3c3c3e] focus:text-white">All Continents</DropdownMenuItem>
                            {continents.map((continent) => (
                              <DropdownMenuItem key={continent} onClick={() => { setSelectedContinent(continent); setIsMobileSheetOpen(false); }} className="focus:bg-[#3c3c3e] focus:text-white">
                                {continent}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all mt-1">
                              <div className="flex items-center gap-4">
                                <Tag className="h-5 w-5 text-blue-400" />
                                <span className="text-lg">Event Type</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-[120px]">
                                <span className="truncate">{selectedEventType ? selectedEventType.charAt(0).toUpperCase() + selectedEventType.slice(1) : "All"}</span>
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] bg-[#2c2c2e] border-none text-gray-200">
                            <DropdownMenuItem onClick={() => { setSelectedEventType(null); setIsMobileSheetOpen(false); }} className="focus:bg-[#3c3c3e] focus:text-white">All Types</DropdownMenuItem>
                            {eventTypes.map((type) => (
                              <DropdownMenuItem key={type} onClick={() => { setSelectedEventType(type); setIsMobileSheetOpen(false); }} className="focus:bg-[#3c3c3e] focus:text-white">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="h-px bg-[#2c2c2e]/50 my-2 border-t border-dashed border-[#444]/30 mx-4" />

                      {/* Accounts / Profile */}
                      <div className="px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
                        {session ? (
                          <>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all cursor-pointer group">
                              <div className="flex items-center gap-4" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-8 w-8 rounded-full border border-border shrink-0 bg-blue-600">
                                  <AvatarImage src={session.user?.image || ""} className="object-cover" />
                                  <AvatarFallback className="bg-blue-600 text-white"><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-lg leading-tight truncate">My Profile {isAvatarUploading && "(Saving...)"}</span>
                                  <span className="text-xs text-muted-foreground truncate">{session.user?.email}</span>
                                </div>
                              </div>
                              <LogOut className="h-4 w-4 text-gray-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); signOut(); setIsMobileSheetOpen(false); }} />
                            </div>
                            
                            <button onClick={() => { setShowOnlySaved(!showOnlySaved); setIsMobileSheetOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all mt-2">
                              <div className="flex items-center gap-4">
                                <div className="h-6 w-6 rounded-full bg-[#916eff] flex items-center justify-center shrink-0">
                                  <Heart className="h-3 w-3 text-white fill-white" />
                                </div>
                                <span className="text-lg">My Events ({savedEvents.length})</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { setAuthDialogOpen(true); setIsMobileSheetOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-lg">Sign In</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          </button>
                        )}
                      </div>

                      <div className="h-px bg-[#2c2c2e]/50 my-2 border-t border-dashed border-[#444]/30 mx-4" />

                      {/* Actions */}
                      <div className="px-4 py-2 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '250ms' }}>
                        <button onClick={() => { setAddEventDialogOpen(true); setIsMobileSheetOpen(false); }} className="w-full flex items-center p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all">
                          <CalendarPlus className="h-5 w-5 text-gray-400 mr-4" />
                          <span className="text-lg">Submit Event</span>
                        </button>
                        <button onClick={() => { handlePrint(); setIsMobileSheetOpen(false); }} className="w-full flex items-center p-3 rounded-xl hover:bg-[#2c2c2e] active:scale-[0.98] transition-all">
                          <FileDown className="h-5 w-5 text-gray-400 mr-4" />
                          <span className="text-lg">Save PDF</span>
                        </button>
                      </div>

                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2 lg:mt-0">
              {/* Left side: Search and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
                {/* View Toggle */}
                <div className="flex bg-muted dark:bg-[#121214] p-1 rounded-md border border-border dark:border-[#2a2a2c] w-full sm:w-auto">
                  <button 
                    onClick={() => setViewMode("calendar")}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Calendar
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ListIcon className="h-4 w-4" />
                    List
                  </button>
                </div>

                <div className="relative w-full sm:w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <SmoothInput
                    type="search"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm py-1.5 h-9"
                    wrapperClassName="w-full border border-input rounded-md"
                  />
                </div>

                <Button variant="outline" size="default" className="w-full sm:w-auto" onClick={handleScrollToToday}>
                  <div className="flex items-center justify-center w-4 h-4 mr-2 bg-blue-500 text-white text-[9px] font-bold rounded-[3px] shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    {new Date().getDate()}
                  </div>
                  Today
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="w-full sm:w-auto justify-between">
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
                    <Button variant="outline" size="default" className="w-full sm:w-auto justify-between">
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
                    <Button variant="outline" size="default" className="w-full sm:w-auto justify-between">
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
                        <SmoothInput
                          id="authEmail"
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                          wrapperClassName="border border-input rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authPassword">Password</Label>
                        <SmoothInput
                          id="authPassword"
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Enter your password"
                          wrapperClassName="border border-input rounded-md"
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
                  <>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="default" className="pl-2 gap-2" disabled={isAvatarUploading}>
                          <Avatar className="w-6 h-6 border border-border">
                            <AvatarImage src={session.user?.image || ""} className="object-cover" />
                            <AvatarFallback className="bg-blue-600 text-[10px] text-white"><User className="h-3 w-3" /></AvatarFallback>
                          </Avatar>
                          {session.user?.email}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          {isAvatarUploading ? "Uploading..." : "Change Avatar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button variant="outline" size="default" onClick={() => setAuthDialogOpen(true)}>
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </nav>

          <div className="flex mt-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            <div className="hidden lg:block w-[180px] shrink-0" />
            <div className="flex-1 grid grid-cols-7 border-border border-b-0">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className={`bg-background p-1 sm:p-2 text-center font-medium text-[10px] sm:text-sm ${day === "Sunday" ? "text-red-500" : ""}`}>
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 bg-[#0f0f11] border-[#2a2a2c] text-foreground">
          {selectedEvent && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold text-gray-100">Event Details</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-1.5">
                  View and edit event details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateEventSubmit} className="space-y-5 pt-2">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-gray-200">Title</Label>
                  <SmoothInput
                    required
                    type="text"
                    value={editEventData.title}
                    onChange={(e) => setEditEventData({ ...editEventData, title: e.target.value })}
                    wrapperClassName="border border-[#2a2a2c] rounded-md"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-gray-200">Description</Label>
                  <textarea
                    value={editEventData.description}
                    onChange={(e) => setEditEventData({ ...editEventData, description: e.target.value })}
                    className="flex min-h-[90px] w-full rounded-md border border-[#2a2a2c] bg-[#121214] px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>

                {/* Start Time and End Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-200">Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={editEventData.startTime}
                      onChange={(e) => setEditEventData({ ...editEventData, startTime: e.target.value })}
                      className="bg-[#121214] border-[#2a2a2c] h-11 w-full [color-scheme:dark] pr-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-200">End Time</Label>
                    <Input
                      type="datetime-local"
                      value={editEventData.endTime}
                      onChange={(e) => setEditEventData({ ...editEventData, endTime: e.target.value })}
                      className="bg-[#121214] border-[#2a2a2c] h-11 w-full [color-scheme:dark] pr-3 text-sm"
                    />
                  </div>
                </div>

                {/* Category and Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-200">Category</Label>
                    <div className="relative">
                      <select
                        value={editEventData.category}
                        onChange={(e) => setEditEventData({ ...editEventData, category: e.target.value })}
                        className="w-full bg-[#121214] border border-[#2a2a2c] text-sm rounded-md h-11 px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {eventTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        <option value="Meeting">Meeting</option>
                        <option value="Personal">Personal</option>
                        <option value="Task">Task</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-gray-200">Color</Label>
                    <div className="relative">
                      <select
                        value={editEventData.color}
                        onChange={(e) => setEditEventData({ ...editEventData, color: e.target.value })}
                        className="w-full bg-[#121214] border border-[#2a2a2c] text-sm rounded-md h-11 pl-9 pr-3 appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="Blue">Blue</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Orange">Orange</option>
                        <option value="Purple">Purple</option>
                      </select>
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            editEventData.color === "Blue" ? "#3b82f6" :
                            editEventData.color === "Red" ? "#ef4444" :
                            editEventData.color === "Green" ? "#22c55e" :
                            editEventData.color === "Orange" ? "#f97316" :
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
                          const tags = editEventData.tags.includes(tag)
                            ? editEventData.tags.filter((t) => t !== tag)
                            : [...editEventData.tags, tag]
                          setEditEventData({ ...editEventData, tags })
                        }}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                          editEventData.tags.includes(tag)
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
                    variant="destructive"
                    className="bg-[#ff4d4d] hover:bg-[#ff3333] text-white font-medium"
                    onClick={handleDeleteEvent}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent border-[#2a2a2c] text-white hover:bg-[#1f1f22] hover:text-white font-medium"
                    onClick={() => setEventDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-white text-black hover:bg-gray-200 font-medium" disabled={isLoading}>
                    Save
                  </Button>
                </div>
              </form>
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
              <SmoothInput
                required
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
                wrapperClassName="border border-[#2a2a2c] rounded-md"
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
            <div key={month} id={month.toLowerCase()} className="mb-16 flex flex-col lg:flex-row gap-4 lg:gap-8 relative">
              <div className="w-full lg:w-[180px] shrink-0 sticky top-[190px] lg:top-[240px] self-start h-fit bg-background/90 backdrop-blur-md z-10 py-2 lg:py-0 -mx-6 px-6 lg:mx-0 lg:px-0">
                <h2 className="text-3xl lg:text-4xl font-thin">{month}</h2>
              </div>

              {viewMode === "calendar" ? (
                <div className="flex-1 grid grid-cols-7 gap-px bg-border border border-border">
                  {monthData.map((day, index) => {
                    const cellId = `${month}-${day.date}`
                    return (
                    <div
                      key={index}
                      onMouseEnter={() => day.date && setHoveredDateCell(cellId)}
                      onMouseLeave={() => setHoveredDateCell(null)}
                      onClick={() => {
                        if (day.date) openAddEventDialog(day.date, month)
                      }}
                      className={`relative bg-background p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] transition-colors hover:bg-accent/50 ${day.date ? "cursor-pointer group/cell" : ""} ${
                        isToday(day.date) ? "ring-2 ring-inset ring-primary" : ""
                      }`}
                    >
                      {day.date && (
                        <AnimatePresence>
                          {hoveredDateCell === cellId && (
                            <motion.div
                              key={`canvas-${cellId}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 z-0 pointer-events-none h-full w-full"
                            >
                              <CrosshairIcon className="absolute h-4 w-4 -top-2 -left-2 text-white z-10" />
                              <CrosshairIcon className="absolute h-4 w-4 -bottom-2 -left-2 text-white z-10" />
                              <CrosshairIcon className="absolute h-4 w-4 -top-2 -right-2 text-white z-10" />
                              <CrosshairIcon className="absolute h-4 w-4 -bottom-2 -right-2 text-white z-10" />

                              <CanvasRevealEffect
                                animationSpeed={5}
                                containerClassName="bg-black"
                                colors={dayColors[index % 7]}
                                opacities={[0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.8, 0.8, 1, 1]}
                                dotSize={3}
                                showGradient={true}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                      
                      <div className="relative z-10 h-full flex flex-col">
                        {day.date && (
                          <>
                            <h3 className={`mb-1 sm:mb-2 font-mono font-light text-3xl sm:text-7xl transition-colors group-hover/cell:text-white ${index % 7 === 6 ? "text-red-500 group-hover/cell:text-red-400" : ""} ${isToday(day.date) ? "bg-blue-600 text-white rounded-xl px-2 py-1 inline-block shadow-[0_0_20px_rgba(37,99,235,0.4)]" : ""}`}>
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
                                  className={`block text-[9px] sm:text-xs p-1 sm:p-2.5 border-l-2 sm:border-l-[3px] rounded-r-md transition-all hover:pl-2 sm:hover:pl-3.5 cursor-pointer group relative shadow-sm ${
                                    event.color === "Blue" ? "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20" :
                                    event.color === "Red" ? "border-red-500 bg-red-500/10 hover:bg-red-500/20" :
                                    event.color === "Green" ? "border-green-500 bg-green-500/10 hover:bg-green-500/20" :
                                    event.color === "Orange" ? "border-orange-500 bg-orange-500/10 hover:bg-orange-500/20" :
                                    event.color === "Purple" ? "border-purple-500 bg-purple-500/10 hover:bg-purple-500/20" :
                                    "border-primary bg-primary/5 hover:bg-primary/10"
                                  }`}
                                >
                                  <div className={`font-semibold leading-tight mb-0.5 line-clamp-1 sm:line-clamp-none break-all sm:break-normal ${
                                    event.color === "Blue" ? "text-blue-400 group-hover/cell:text-blue-300" :
                                    event.color === "Red" ? "text-red-400 group-hover/cell:text-red-300" :
                                    event.color === "Green" ? "text-green-400 group-hover/cell:text-green-300" :
                                    event.color === "Orange" ? "text-orange-400 group-hover/cell:text-orange-300" :
                                    event.color === "Purple" ? "text-purple-400 group-hover/cell:text-purple-300" :
                                    "text-foreground group-hover/cell:text-white"
                                  }`}>{event.name}</div>
                                  {event.edition && (
                                    <span className="hidden sm:inline-block mt-1 text-[10px] bg-background px-1 py-0.5 rounded group-hover/cell:bg-white/10 group-hover/cell:text-white">
                                      {event.edition}
                                    </span>
                                  )}
                                  <div className="hidden sm:flex mt-1 items-center text-muted-foreground/80 group-hover/cell:text-white/80">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{event.time}</span>
                                  </div>
                                  {event.location && (
                                    <div className="hidden sm:flex text-muted-foreground mt-1 items-center justify-between group-hover/cell:text-white/70">
                                      <span>{event.location} {event.flag}</span>
                                    </div>
                                  )}

                                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {session && (
                                      <button
                                        onClick={(e) => handleSaveEvent(e, event.id!)}
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
                  </div>
                  );
                })}
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
                      return <div className="text-center py-12 border border-border dark:border-[#2a2a2c] border-dashed rounded-xl bg-card dark:bg-[#0f0f11] text-muted-foreground">No events for {month}</div>
                    }

                    return Object.keys(grouped).map(dayStr => {
                      const day = parseInt(dayStr)
                      const dateObj = new Date(`${month} ${day}, 2026`)
                      const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                      const eventsForDay = grouped[day]

                      return (
                        <div key={day} className="space-y-3">
                          <h3 className={`text-[13px] font-medium ${isToday(day) ? "bg-blue-600 text-white rounded-md px-1.5 py-0.5 inline-block shadow-[0_0_10px_rgba(37,99,235,0.4)]" : dateObj.getDay() === 0 ? "text-red-500 pl-1" : "text-muted-foreground pl-1"}`}>{dateStr}</h3>
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
                                  className="flex items-start justify-between p-4 rounded-xl border border-border dark:border-[#2a2a2c] bg-card dark:bg-[#0f0f11] hover:border-primary/50 dark:hover:border-border transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-[9px] h-[9px] rounded-full mt-1.5 shrink-0 ${dotColor}`}></div>
                                    <div>
                                      <h4 className="text-[15px] font-semibold text-foreground dark:text-gray-100">
                                        {event.name} 
                                        {event.edition && <span className="text-xs ml-2 bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">{event.edition}</span>}
                                      </h4>
                                      {event.description && (
                                        <p className="text-[13px] text-muted-foreground dark:text-gray-400 mt-1 max-w-2xl">{event.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                                        <div className="flex items-center text-[12px] text-muted-foreground dark:text-gray-400">
                                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                                          {event.time}
                                        </div>
                                        {event.tags && event.tags.length > 0 && (
                                          <div className="flex items-center gap-1.5">
                                            {(typeof event.tags === 'string' ? event.tags.split(',') : (event.tags as unknown as string[])).filter(Boolean).map((tag: string) => (
                                              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-border dark:border-[#2a2a2c] text-muted-foreground dark:text-gray-300">
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="shrink-0 ml-4 hidden sm:block">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-border dark:border-[#2a2a2c] text-muted-foreground dark:text-gray-300 font-medium capitalize">
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
