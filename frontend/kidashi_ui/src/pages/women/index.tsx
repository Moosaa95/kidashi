// import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { setFilter } from "@/states/features/dashboard/womenSlice"
import StatCard, { type StatProps } from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { womenColumns } from "@/components/women/womenColumn"
import { useFetchWomenQuery } from "@/states/api/endpoints/women/womenApiSlice"
import { DataTableSkeleton } from "@/components/loaders/skeletons/DataTableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function WomenManagement() {
    // const [searchQuery, setSearchQuery] = useState("")
    const searchQuery = ""
    const dispatch = useAppDispatch()

    const { filter, stats, women, loading: womenLoading } = useAppSelector((state) => state.women)
    // const { data: womenData, isLoading: womenLoading } = useFetchWomenQuery()
    // const women = womenData?.data || []

    const statsData: StatProps[] = [
        {
            name: "Total Women",
            value: stats.total_women.toString(),
            change: "+2.1%",
            changeType: "positive" as const,
            icon: "Users",
            description: "Registered across all vendors",
        },
        {
            name: "Active Loans",
            value: stats.active_loans.toString(),
            change: "+0.5%",
            changeType: "positive" as const,
            icon: "CreditCard",
            description: "Currently being repaid",
        },
        {
            name: "Overdue Loans",
            value: stats.defaulted_loans.toString(),
            change: "-1.4%",
            changeType: "negative" as const,
            icon: "AlertTriangle",
            description: "Past due repayment",
        },
        {
            name: "Repaid Loans",
            value: stats.repaid_loans.toLocaleString(),
            change: "+0.8%",
            changeType: "positive" as const,
            icon: "TrendingUp",
            description: "Across all women",
        },
    ]

    const filtered = women.filter((woman: any) => {
        const matchesSearch =
            woman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            woman.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            woman.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter =
            filter === "all" ||
            (filter === "current" && woman.loanAmount > 0) ||
            (filter === "current" && woman.loanAmount === 0) ||
            (filter === "overdue" && woman.repaymentStatus === "overdue")

        return matchesSearch && matchesFilter
    })

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
                {statsData.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>

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
                            <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="overdue">Overdue</TabsTrigger>
                        </TabsList>
                        <TabsContent value={filter}>
                            <DataTable
                                columns={womenColumns}
                                data={filtered}
                                searchColumn="name"
                                searchPlaceholder="search women members"
                            />
                        </TabsContent>
                    </>
                )}

            </Tabs>
        </div>
    )
}
