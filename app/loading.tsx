import { MorphingSquare } from "@/components/ui/morphing-square"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-950">
      <MorphingSquare message="Loading..." />
    </div>
  )
}
