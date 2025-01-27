import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserListSkeleton } from "@/components/skeletons/user-skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="h-10 border-b px-4 bg-muted/5">
              <div className="flex h-full items-center gap-4">
                <div className="h-4 w-[30%] bg-muted animate-pulse rounded" />
                <div className="h-4 w-[20%] bg-muted animate-pulse rounded" />
                <div className="h-4 w-[30%] bg-muted animate-pulse rounded" />
                <div className="h-4 w-[20%] bg-muted animate-pulse rounded" />
              </div>
            </div>
            <UserListSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}