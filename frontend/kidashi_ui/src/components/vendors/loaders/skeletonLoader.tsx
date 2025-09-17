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


export const DataTableSkeleton = () => (
    <div className="space-y-4">
        <div className="flex items-center py-4">
            <Skeleton className="h-10 w-[250px]" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border">
            <div className="border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                </div>
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border-b px-4 py-3 last:border-b-0">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-6 w-[60px] rounded-full" />
                        <Skeleton className="h-4 w-[100px]" />
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-[60px]" />
                            <Skeleton className="h-8 w-[60px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-[120px]" />
            <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    </div>
);
