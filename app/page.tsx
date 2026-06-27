import { Suspense } from "react"
import DesignEventsCalendar from "@/components/design-events-calendar"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DesignEventsCalendar />
    </Suspense>
  )
}
