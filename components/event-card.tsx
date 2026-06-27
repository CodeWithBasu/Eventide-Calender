interface Event {
  name: string
  edition?: string
  time: string
  location: string
  url: string
  continent: string
}

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2 text-xs border border-gray-200 rounded hover:border-gray-400 hover:shadow-sm transition-all bg-white"
    >
      <div className="font-medium leading-tight mb-1">{event.name}</div>
      {event.edition && <div className="text-[10px] text-gray-600 mb-1">{event.edition}</div>}
      <div className="text-[10px] text-gray-500">{event.time}</div>
      <div className="text-[10px] text-gray-700 mt-1">{event.location}</div>
    </a>
  )
}
