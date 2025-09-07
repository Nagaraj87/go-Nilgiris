import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-80 w-full rounded-lg" />
          <div className="mt-8">
            <Skeleton className="h-8 w-1/4" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/4" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-6 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mt-6" />
        </div>
      </div>
    </div>
  );
}
