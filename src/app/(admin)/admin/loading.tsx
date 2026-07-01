import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="space-y-12">
        <Skeleton className="w-full h-[400px]" />
        <Skeleton className="w-full h-[400px]" />
        <Skeleton className="w-full h-[400px]" />
      </div>
    </div>
  )
}
