import { useMemo } from "react"
import { circleColumns } from "@/components/circles/circleColumn"
import type { StatProps } from "@/components/dashboard/StatCard"
import StatCard from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { setFilter } from "@/states/features/dashboard/trustCircleSlice"
import { useFetchTrustCirclesQuery } from "@/states/api/endpoints/trustcircles/trustcirlcesApiSlice"
import { DataTableSkeleton } from "@/components/loaders/skeletons/DataTableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "@/components/loaders/skeletons/StatSkeleton"
import type { TrustCircles } from "@/types/global"

export default function TrustCircle() {
    const dispatch = useAppDispatch()
    const { filter } = useAppSelector(state => state.circles)

    const {
        data: trustCirclesData,
        isLoading: circlesLoading,
        isFetching: circlesFetching,
        error: circlesError,
    } = useFetchTrustCirclesQuery({ include_summary: true })

    // Extract circles and metrics from response
    const circles: TrustCircles[] = trustCirclesData?.data ?? []
    const metrics = trustCirclesData?.summary

    const totalCircles = metrics?.total_circles ?? circles.length
    const eligibleCircles = metrics?.eligible_circles ?? circles.filter((circle) => circle.loan_eligibility === "ELIGIBLE").length
    const activeCircles = metrics?.active_circles ?? circles.filter((circle) => circle.status === "active").length

    const statsData: StatProps[] = [
        {
            name: "Total Trust Circles",
            value: totalCircles.toString(),
            icon: "UsersRound",
            description: "Across all vendors"
        },
        {
            name: "Eligible for Loans",
            value: eligibleCircles.toString(),
            icon: "Banknote",
            description: "3 women required"
        },
        {
            name: "Active Circles",
            value: activeCircles.toString(),
            icon: "UserCheck",
            description: "Currently active"
        },
    ]

    const filtered = useMemo(() => {
        if (!filter || filter === "all") {
            return circles
        }

        return circles.filter((circle) => {
            if (filter === "eligible") {
                return circle.loan_eligibility === "ELIGIBLE"
            }
            if (filter === "ineligible") {
                return circle.loan_eligibility === "NOT_ELIGIBLE"
            }
            if (filter === "active") {
                return circle.status.toLowerCase() === "active"
            }
            return true
        })
    }, [filter, circles])

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Trust Circle Management</h1>
                <p className="text-muted-foreground mt-2">
                    Monitor circle health, track member activity, and manage loan eligibility across all vendor communities.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
                {(circlesLoading || circlesFetching) ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    statsData.map((stat) => (
                        <StatCard key={stat.name} {...stat} />
                    ))
                )}
            </div>

            {circlesError ? (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                    Unable to load trust circles. Please try again later.
                </div>
            ) : null}

            {/* Tabs + Table */}
            <Tabs className="space-y-6" value={filter} defaultValue="all" onValueChange={(val) => dispatch(setFilter(val as any))}>
                {circlesLoading ? (
                    <div className="space-y-6">
                        <div className="grid w-full grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 rounded-md" />
                            ))}
                        </div>
                        <DataTableSkeleton />
                    </div>
                ) : (
                    <>
                        <TabsList className="grid w-full grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All Circles</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="eligible">Loan Eligible</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="ineligible">Not Eligible</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="active">Active</TabsTrigger>
                        </TabsList>
                        <TabsContent value={filter}>
                            <DataTable columns={circleColumns} data={filtered} searchColumn="name" searchPlaceholder="search trust circles" />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    )
}
