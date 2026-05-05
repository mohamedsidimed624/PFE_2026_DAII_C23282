import { Skeleton } from "@/components/ui/skeleton";

function AnnonceSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[420px] rounded-[2rem]" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[360px] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default AnnonceSkeleton;