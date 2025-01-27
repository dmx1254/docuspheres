import { Skeleton } from "@/components/ui/skeleton";

export function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-5 w-5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ActivityListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  );
}