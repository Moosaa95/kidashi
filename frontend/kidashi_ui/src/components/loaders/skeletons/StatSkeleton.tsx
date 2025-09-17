import { Skeleton } from "@/components/ui/skeleton";

export const StatCardSkeleton = () => (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[140px]" />
            <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-8 w-[80px]" />
            <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-[60px]" />
                <Skeleton className="h-3 w-[100px]" />
            </div>
        </div>
    </div>
);
