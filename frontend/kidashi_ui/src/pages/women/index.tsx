import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { setFilter } from "@/states/features/dashboard/womenSlice"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { womenColumns } from "@/components/women/womenColumn"
import { useFetchWomenQuery } from "@/states/api/endpoints/women/womenApiSlice"
import { DataTableSkeleton } from "@/components/loaders/skeletons/DataTableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "@/components/loaders/skeletons/StatSkeleton"
import type { WomanSummary } from "@/types/global"

export default function WomenManagement() {
    const dispatch = useAppDispatch()

    const { filter } = useAppSelector((state) => state.women)
    const {
        data: womenData,
        isLoading: womenLoading,
        isFetching: womenFetching,
        error: womenError,
    } = useFetchWomenQuery({ include_summary: true })

    // Handle both response formats
    const women: WomanSummary[] = Array.isArray(womenData?.data)
        ? womenData.data
        : (womenData?.data as any)?.women ?? []

    const metrics = Array.isArray(womenData?.data)
        ? null
        : (womenData?.data as any)?.summary

    const totalWomen = metrics?.total_women ?? women.length
    const activeWomen = metrics?.active_women ?? women.filter((woman) => woman.status === "ACTIVE").length
    const inactiveWomen = metrics?.inactive_women ?? women.filter((woman) => woman.status === "INACTIVE").length
    const suspendedWomen = metrics?.suspended_women ?? women.filter((woman) => woman.status === "SUSPENDED").length

    const statsData: StatProps[] = [
        {
            name: "Total Women",
            value: totalWomen.toString(),
            change: metrics?.active_percentage ? `${metrics.active_percentage}% active` : "",
            changeType: "positive",
            icon: "Users",
            description: "Registered across the program",
        },
        {
            name: "Active Women",
            value: activeWomen.toString(),
            change: "",
            changeType: "positive",
            icon: "UserCheck",
            description: "Currently engaged",
        },
        {
            name: "Inactive Women",
            value: inactiveWomen.toString(),
            change: "",
            // changeType: "negative" as inactiveWomen > 0 ? "negative" : "positive",
            icon: "UserX",
            description: "Not currently active",
        },
        {
            name: "Suspended Women",
            value: suspendedWomen.toString(),
            change: "",
            changeType: suspendedWomen > 0 ? "negative" : "positive",
            icon: "Shield",
            description: "Temporarily suspended",
        },
    ]

    const filteredWomen = useMemo(() => {
        if (!filter || filter === "all") {
            return women
        }

        return women.filter((woman) => {
            const repaymentStatus = woman.repayment_status ?? ""
            if (filter === "withLoans") {
                return repaymentStatus && repaymentStatus !== "NOT_APPLICABLE"
            }
            if (filter === "noLoans") {
                return !repaymentStatus || repaymentStatus === "NOT_APPLICABLE"
            }
            if (filter === "overdue") {
                return ["LATE", "DEFAULTED"].includes(repaymentStatus)
            }
            return true
        })
    }, [filter, women])

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Women Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Track and manage women members across vendors and trust circles.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 lg:grid-cols-4">
                {(womenLoading || womenFetching) ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    statsData.map((stat) => (
                        <StatCard key={stat.name} {...stat} />
                    ))
                )}
            </div>

            {womenError ? (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                    Unable to load women. Please try again later.
                </div>
            ) : null}

            {/* Tabs + Table */}
            <Tabs
                className="space-y-6"
                value={filter}
                defaultValue="all"
                onValueChange={(val) => dispatch(setFilter(val as any))}
            >
                {womenLoading ? (
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
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="withLoans">With Loans</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="noLoans">No Loans</TabsTrigger>
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="overdue">At Risk</TabsTrigger>
                        </TabsList>
                        <TabsContent value={filter}>
                            <DataTable
                                columns={womenColumns}
                                data={filteredWomen}
                                searchColumn="full_name"
                                searchPlaceholder="search women members"
                            />
                        </TabsContent>
                    </>
                )}

            </Tabs>
        </div>
    )
}
