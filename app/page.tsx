import { Suspense } from "react"
import DesignEventsCalendar from "@/components/design-events-calendar"

export default async function Page() {
  // Artificial delay so you can see the new loading animation!
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <Suspense fallback={null}>
      <DesignEventsCalendar />
    </Suspense>
  )
}
