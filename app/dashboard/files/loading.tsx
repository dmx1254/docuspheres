import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileListSkeleton } from "@/components/skeletons/file-skeleton";
import { ActivityListSkeleton } from "@/components/skeletons/activity-skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="h-10 border-b px-4 bg-muted/5">
                <div className="flex h-full items-center gap-4">
                  <div className="h-4 w-[30%] bg-muted animate-pulse rounded" />
                  <div className="h-4 w-[20%] bg-muted animate-pulse rounded" />
                  <div className="h-4 w-[20%] bg-muted animate-pulse rounded" />
                </div>
              </div>
              <FileListSkeleton />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <ActivityListSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}