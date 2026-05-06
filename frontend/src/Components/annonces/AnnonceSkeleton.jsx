import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

function AnnonceSkeleton() {
  return (
    <div className="space-y-8">
      {/* Featured skeleton */}
      <Skeleton className="h-105 w-full rounded-2xl" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default AnnonceSkeleton;
