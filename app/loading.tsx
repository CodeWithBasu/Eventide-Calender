import Image from "next/image"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-950">
      <div className="animate-pulse">
        <Image
          src="/icon.png"
          alt="Loading Eventide Calendar..."
          width={120}
          height={120}
          className="rounded-[30px]"
          priority
        />
      </div>
    </div>
  )
}
