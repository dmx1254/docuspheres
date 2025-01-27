import { PostSkeleton } from "@/components/skeletons/post-skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}