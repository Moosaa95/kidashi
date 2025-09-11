import { circleColumns } from "@/components/circles/circleColumn"
import type { StatProps } from "@/components/dashboard/StatCard"
import StatCard from "@/components/dashboard/StatCard"
import { DataTable } from "@/components/datatable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/states/app/hooks"
import { setFilter } from "@/states/features/dashboard/trustCircleSlice"
// import { useState } from "react"

export default function TrustCircle() {
    // const [searchQuery, setSearchQuery] = useState("")
    const searchQuery = ""
    const dispatch = useAppDispatch()
    const { circles, loading, filter, stats } = useAppSelector(state => state.circles)

    const statsData: StatProps[] = [
        {
            name: "Total Trust Circles",
            value: stats.total_circles.toLocaleString(),
            change: "",
            changeType: "positive",
            icon: "UsersRound",
            description: "Across all vendors"
        },
        {
            name: "Eligible for loan",
            value: stats.eligible_for_loans.toLocaleString(),
            change: "",
            changeType: "positive",
            icon: "Banknote",
            description: "3 women required"
        },
        {
            name: "Total Women",
            value: stats.total_women.toLocaleString(),
            change: "",
            changeType: "positive",
            icon: "UserCheck",
            description: "Women onboarded"
        },
        {
            name: "Avg. Repayment Rate",
            value: `${stats.average_repayment_rate.toFixed(1)}%`,
            change: "",
            changeType: "positive",
            icon: "TrendingUp",
            description: "Currently participating members"
        }
    ]

    const filtered = circles.filter((circle) => {
        const matchesSearch =
            circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            circle.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "eligible" && circle.eligibleForLoan) ||
            (filter === "ineligible" && !circle.eligibleForLoan) ||
            (filter === "active" && circle.status === "active")
        // (filter === "pending" && circle.status === "pending");

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Trust Circle Management</h1>
                <p className="text-muted-foreground mt-2">
                    Monitor circle health, track member activity, and manage loan eligibility across all vendor communities.
                </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
                {statsData.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>
            <Tabs className="space-y-6" value={filter} defaultValue="all" onValueChange={(val) => dispatch(setFilter(val as any))}>
                <TabsList className="grid w-full grid-cols-4 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="all">All Circles</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="eligible">Loan Eligible</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="ineligible">Not Eligible</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="active">Active</TabsTrigger>
                </TabsList>
                <TabsContent value={filter}>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading vendors...</p>
                    ) : (
                        <DataTable columns={circleColumns} data={filtered} searchColumn="name" searchPlaceholder="search vendors" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
