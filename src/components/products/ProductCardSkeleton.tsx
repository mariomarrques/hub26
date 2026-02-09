import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-border bg-card animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-square bg-panel">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute left-sm top-sm">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-md">
        {/* Category */}
        <Skeleton className="h-3 w-20 mb-1" />

        {/* Name */}
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-3/4 mb-2" />

        {/* Price */}
        <Skeleton className="h-4 w-16 mb-3" />

        {/* Button */}
        <div className="mt-auto">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
